import { cleanQuestionText, cleanOptionText } from '@/lib/utils/questionCleaner'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normaliseSubject, normaliseExamType } from '@/lib/utils/constants'

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({
      message: `Missing env vars — NEXT_PUBLIC_SUPABASE_URL: ${url ? 'SET' : 'MISSING'}, SUPABASE_SERVICE_ROLE_KEY: ${key ? 'SET' : 'MISSING'}. Check .env.local and restart.`,
    }, { status: 500 })
  }
  if (!key.startsWith('eyJ')) {
    return NextResponse.json({
      message: `SUPABASE_SERVICE_ROLE_KEY looks wrong — should start with "eyJ" but starts with "${key.slice(0, 6)}". Remove surrounding quotes from .env.local and restart.`,
    }, { status: 500 })
  }

  // Always use service role directly — never rely on createServerClient here
  // so we bypass RLS and can write questions with verified=true
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 }) }

  const { questions, examType, subject, year, paper } = body

  if (!Array.isArray(questions) || !questions.length)
    return NextResponse.json({ message: 'questions array is required' }, { status: 400 })
  if (!examType || !subject)
    return NextResponse.json({ message: 'examType and subject are required' }, { status: 400 })

  const normSubject  = normaliseSubject(subject)    // always lowercase e.g. "physics"
  const normExamType = normaliseExamType(examType)   // always uppercase e.g. "JAMB"
  const batchId      = crypto.randomUUID()
  const topicCache   = {}  // title.lower → { id, title }

  // ── Resolve or create topics ──────────────────────────────
  async function getTopicId(topicTitle) {
    const raw = topicTitle?.trim() || 'General'
    const cacheKey = raw.toLowerCase()
    if (topicCache[cacheKey]) return topicCache[cacheKey]

    // Try exact match first
    const { data: exact } = await supabase
      .from('topics')
      .select('id, title')
      .eq('subject_id', normSubject)
      .ilike('title', raw)
      .maybeSingle()

    if (exact) { topicCache[cacheKey] = exact; return exact }

    // Create it
    const { data: created, error } = await supabase
      .from('topics')
      .insert({ subject_id: normSubject, title: raw })
      .select('id, title')
      .single()

    if (error) {
      // Possible race condition — try one more fetch
      const { data: retry } = await supabase
        .from('topics')
        .select('id, title')
        .eq('subject_id', normSubject)
        .ilike('title', raw)
        .maybeSingle()
      if (retry) { topicCache[cacheKey] = retry; return retry }
      // Last resort — use null topic_id but keep topic_title
      return { id: null, title: raw }
    }

    topicCache[cacheKey] = created
    return created
  }

  // ── Build rows ────────────────────────────────────────────
  const rows = await Promise.all(questions.map(async q => {
    const topic = await getTopicId(q.topic)
    return {
      subject_id:     normSubject,
      topic_id:       topic.id,
      topic_title:    topic.title || q.topic || 'General',
      exam_type:      normExamType,
      year:           year ? parseInt(year) : null,
      paper:          paper?.trim() || null,
      question_text:  cleanQuestionText(q.questionText),
      option_a:       cleanOptionText(q.optionA),
      option_b:       cleanOptionText(q.optionB),
      option_c:       cleanOptionText(q.optionC),
      option_d:       cleanOptionText(q.optionD),
      correct_answer: q.correctAnswer?.trim().toUpperCase() || 'A',
      explanation:    q.explanation?.trim()    || '',
      difficulty:     ['easy','medium','hard'].includes(q.difficulty) ? q.difficulty : 'medium',
      high_frequency: false,
      verified:       true,   // EXPLICIT — never rely on DB default alone
      upload_batch:   batchId,
    }
  }))

  // ── Insert in batches of 50 ───────────────────────────────
  let inserted = 0
  const CHUNK = 50

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { data, error } = await supabase
      .from('questions')
      .insert(chunk)
      .select('id')

    if (error) {
      return NextResponse.json({
        message: `Database insert failed at row ${i}: ${error.message}`,
        hint:    error.hint  || null,
        code:    error.code  || null,
        details: error.details || null,
      }, { status: 500 })
    }
    inserted += data?.length || 0
  }

  return NextResponse.json({ inserted, batchId }, { status: 201 })
}
