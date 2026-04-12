import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { EXPLANATION_GENERATION_PROMPT } from '@/lib/prompts/explanationGeneration'
import { cookies } from 'next/headers'
import { verifyAdminJWT } from '@/lib/auth/jwt'

function buildUserMessage(q) {
  return `Generate a full step-by-step explanation for this ${q.exam_type} ${q.subject_id} question.

Question: ${q.question_text}

Options:
A) ${q.option_a}
B) ${q.option_b}
C) ${q.option_c}
D) ${q.option_d}

Correct answer: ${q.correct_answer}
Topic: ${q.topic_title}
Difficulty: ${q.difficulty}

Use LaTeX for ALL mathematical expressions and chemical formulae.`
}

// POST — start a batch
export async function POST(request) {
  const token = cookies().get('admin_token')?.value
  const payload = token ? await verifyAdminJWT(token).catch(() => null) : null
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const { questionIds, uploadBatch } = body

  const supabase = createServerClient()

  // Fetch questions — either by IDs or by upload batch
  let query = supabase.from('questions').select('*')
  if (questionIds?.length) {
    query = query.in('id', questionIds)
  } else if (uploadBatch) {
    query = query.eq('upload_batch', uploadBatch)
  } else {
    // Questions with empty/short explanations
    query = query.or('explanation.is.null,explanation.eq.')
    query = query.limit(100)
  }

  const { data: questions, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!questions?.length) return NextResponse.json({ error: 'No questions found' }, { status: 404 })

  // Build batch requests for Anthropic Batches API
  const requests = questions.map(q => ({
    custom_id: q.id,
    params: {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: EXPLANATION_GENERATION_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(q) }],
    },
  }))

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'message-batches-2024-09-24',
      },
      body: JSON.stringify({ requests }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: `Anthropic Batches error: ${err.error?.message || res.status}` }, { status: 500 })
    }

    const batch = await res.json()
    return NextResponse.json({
      success:   true,
      batchId:   batch.id,
      total:     questions.length,
      status:    batch.processing_status,
    })
  } catch (err) {
    return NextResponse.json({ error: `Batch request failed: ${err.message}` }, { status: 500 })
  }
}

// GET — poll batch status and save results if complete
export async function GET(request) {
  const token = cookies().get('admin_token')?.value
  const payload = token ? await verifyAdminJWT(token).catch(() => null) : null
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batchId')
  if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })

  // Check batch status
  const statusRes = await fetch(`https://api.anthropic.com/v1/messages/batches/${batchId}`, {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'message-batches-2024-09-24',
    },
  })

  if (!statusRes.ok) {
    return NextResponse.json({ error: 'Could not fetch batch status' }, { status: 500 })
  }

  const batchStatus = await statusRes.json()

  if (batchStatus.processing_status !== 'ended') {
    return NextResponse.json({
      status:   batchStatus.processing_status,
      counts:   batchStatus.request_counts,
      complete: false,
    })
  }

  // Batch is done — fetch results and save to DB
  const resultsRes = await fetch(batchStatus.results_url, {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'message-batches-2024-09-24',
    },
  })

  if (!resultsRes.ok) return NextResponse.json({ error: 'Could not fetch batch results' }, { status: 500 })

  const supabase = createServerClient()
  const text     = await resultsRes.text()
  const lines    = text.split('\n').filter(Boolean)
  let saved = 0; let failed = 0

  for (const line of lines) {
    try {
      const result = JSON.parse(line)
      if (result.result?.type === 'succeeded') {
        const explanation = result.result.message.content?.[0]?.text
        if (explanation && result.custom_id) {
          await supabase
            .from('questions')
            .update({ explanation })
            .eq('id', result.custom_id)
          saved++
        }
      } else {
        failed++
      }
    } catch { failed++ }
  }

  return NextResponse.json({ complete: true, saved, failed, total: lines.length })
}
