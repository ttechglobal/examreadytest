import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { EXPLANATION_GENERATION_PROMPT } from '@/lib/prompts/explanationGeneration'
import { cookies } from 'next/headers'
import { verifyAdminJWT } from '@/lib/auth/jwt'

export async function POST(request) {
  // Auth check
  const token = cookies().get('admin_token')?.value
  const payload = token ? await verifyAdminJWT(token).catch(() => null) : null
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set in .env.local' }, { status: 500 })

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const { questionId } = body
  if (!questionId) return NextResponse.json({ error: 'questionId required' }, { status: 400 })

  const supabase = createServerClient()
  const { data: question, error: qErr } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single()

  if (qErr || !question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

  const userMessage = `Generate a full step-by-step explanation for this ${question.exam_type} ${question.subject_id} question.

Question: ${question.question_text}

Options:
A) ${question.option_a}
B) ${question.option_b}
C) ${question.option_c}
D) ${question.option_d}

Correct answer: ${question.correct_answer}
Topic: ${question.topic_title}
Difficulty: ${question.difficulty}

Generate the full explanation following the format in your instructions.
Use LaTeX for ALL mathematical expressions, formulas, units, and chemical formulae.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: EXPLANATION_GENERATION_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: `Anthropic API error: ${err.error?.message || res.status}` }, { status: 500 })
    }

    const data     = await res.json()
    const explanation = data.content?.[0]?.text
    if (!explanation) return NextResponse.json({ error: 'No explanation returned from API' }, { status: 500 })

    // Save back to the question
    await supabase
      .from('questions')
      .update({ explanation })
      .eq('id', questionId)

    return NextResponse.json({ success: true, explanation })
  } catch (err) {
    return NextResponse.json({ error: `Request failed: ${err.message}` }, { status: 500 })
  }
}
