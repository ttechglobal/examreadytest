'use client'
import { MathText } from '@/components/ui/MathText'

// ── Section parser ─────────────────────────────────────────────
const EMOJI_ANCHORS = ['🔑','📖','📐','🔢','✅','❌','💡']

function escapeForRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractEmoji(text, emoji) {
  const escaped = escapeForRegex(emoji)
  const anchors  = EMOJI_ANCHORS.map(escapeForRegex).join('|')
  const regex    = new RegExp(`${escaped}[^\\n]*\\n([\\s\\S]*?)(?=${anchors}|$)`)
  const match    = text.match(regex)
  return match?.[1]?.trim() || null
}

function extractSteps(text) {
  const raw = extractEmoji(text, '🔢')
  if (!raw) return []
  return raw
    .split(/(?=^Step \d+:|^\d+\.)/m)
    .map(s => s.replace(/^Step \d+:\s*|^\d+\.\s*/, '').trim())
    .filter(Boolean)
}

function extractFormulaSection(text) {
  const section = extractEmoji(text, '📐')
  if (!section) return null

  const lines = section.split('\n').map(l => l.trim()).filter(Boolean)

  // Find the formula line
  const formulaLine = lines.find(l =>
    /^formula:/i.test(l) || (l.includes('=') && l.length < 60)
  )
  // Find parameter lines — start with •, -, *, or "Symbol ="
  const paramLines = lines
    .filter(l => /^[•\-\*]/.test(l) || /^[A-Za-z].*=/.test(l))
    .map(l => l.replace(/^[•\-\*]\s*/, '').trim())
    .filter(Boolean)

  if (!formulaLine && paramLines.length === 0) {
    // Just render the whole section as formula
    return { expression: section, parameters: null }
  }

  return {
    expression: formulaLine?.replace(/^formula:\s*/i, '') ?? '',
    parameters: paramLines.length > 0 ? paramLines : null,
  }
}

function parseLegacyFormat(text) {
  const lines = text.split('\n')
  const steps = []; const whyNot = []
  let why = '', whatTests = '', currentStep = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    if (/^Step \d+:/i.test(line)) {
      if (currentStep) steps.push(currentStep)
      currentStep = { header: line.replace(/\*\*/g, ''), body: [] }; continue
    }
    if (currentStep) {
      if (/^(\*\*)?Answer:/i.test(line) || /^(\*\*)?What this tests:/i.test(line) || /^(\*\*)?Why not [A-D]:/i.test(line)) {
        steps.push(currentStep); currentStep = null
      } else { currentStep.body.push(line); continue }
    }
    const wn = line.match(/^(\*\*)?Why not ([A-D]):\s*(.*)/i)
    if (wn) { whyNot.push(`${wn[2].toUpperCase()}: ${wn[3].replace(/\*\*/g, '')}`); continue }
    if (/^(\*\*)?What this tests:/i.test(line)) { whatTests = line.replace(/^(\*\*)?What this tests:\s*/i, '').replace(/\*\*/g, ''); continue }
    if (/^(\*\*)?Why:/i.test(line)) {
      why = line.replace(/^(\*\*)?Why:\s*/i, '').replace(/\*\*/g, '')
      while (i + 1 < lines.length && lines[i+1].trim() && !/^Step \d+:/i.test(lines[i+1])) {
        i++; why += ' ' + lines[i].trim()
      }
      continue
    }
  }
  if (currentStep) steps.push(currentStep)

  const stepsText = steps.map(s => {
    const h = s.header.replace(/^Step \d+:\s*/i, '')
    return h + (s.body.length ? '\n' + s.body.join('\n') : '')
  })

  return {
    concept:    null,
    background: why || null,
    formula:    null,
    steps:      stepsText,
    whyCorrect: null,
    whyWrong:   whyNot.length ? whyNot.join('\n') : null,
    takeaway:   whatTests || null,
  }
}

function parseExplanationSections(text) {
  if (!text) return {}
  const hasEmoji = EMOJI_ANCHORS.some(e => text.includes(e))

  if (hasEmoji) {
    return {
      concept:    extractEmoji(text, '🔑'),
      background: extractEmoji(text, '📖'),
      formula:    extractFormulaSection(text),
      steps:      extractSteps(text),
      whyCorrect: extractEmoji(text, '✅'),
      whyWrong:   extractEmoji(text, '❌'),
      takeaway:   extractEmoji(text, '💡'),
    }
  }

  return parseLegacyFormat(text)
}

function clean(text) {
  return text?.replace(/\*\*/g, '').trim() || ''
}

// ── Sub-components ─────────────────────────────────────────────

function FormulaSection({ formula }) {
  if (!formula) return null
  return (
    <div className="explanation-section formula-section">
      <span className="section-icon">📐</span>
      <div className="formula-content">
        {formula.expression && (
          <div className="formula-display">
            <MathText block>{clean(formula.expression)}</MathText>
          </div>
        )}
        {formula.parameters && (
          <ul className="parameter-list">
            {formula.parameters.map((p, i) => (
              <li key={i} className="parameter-item">
                <MathText>{clean(p)}</MathText>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function StepsList({ steps }) {
  if (!steps?.length) return null
  return (
    <div className="explanation-section">
      <span className="section-icon">🔢</span>
      <ol className="steps-list">
        {steps.map((step, i) => (
          <li key={i} className="step-item">
            <div className="step-number">{i + 1}</div>
            <div className="step-content">
              <MathText>{clean(step)}</MathText>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
export function ExplanationCard({ explanation, isCorrect, correctAnswer, studentAnswer }) {
  const hasVerdict = isCorrect !== null && isCorrect !== undefined
  const s = parseExplanationSections(explanation)
  const hasStructure = s.steps?.length > 0 || s.background || s.concept

  return (
    <div className="explanation-card">

      {/* Verdict banner */}
      {hasVerdict && (
        <div className={`verdict-banner ${isCorrect ? 'correct' : studentAnswer ? 'wrong' : 'neutral'}`}>
          {isCorrect
            ? '✓  You got this right'
            : studentAnswer
            ? `The correct answer is ${correctAnswer} — here's why`
            : `Not answered — the correct answer is ${correctAnswer}`}
        </div>
      )}

      {hasStructure ? (
        <>
          {/* 🔑 Concept */}
          {s.concept && (
            <div className="explanation-section">
              <span className="section-icon">🔑</span>
              <p className="concept-label"><MathText>{clean(s.concept)}</MathText></p>
            </div>
          )}

          {/* 📖 Background */}
          {s.background && (
            <div className="explanation-section background-section">
              <span className="section-icon">📖</span>
              <div className="section-content">
                <MathText>{clean(s.background)}</MathText>
              </div>
            </div>
          )}

          {/* 📐 Formula */}
          <FormulaSection formula={s.formula} />

          {/* 🔢 Steps */}
          <StepsList steps={s.steps} />

          {/* ✅ Why correct */}
          {s.whyCorrect && (
            <div className="explanation-section why-correct-section">
              <span className="section-icon">✅</span>
              <div style={{ flex: 1, fontSize: 16, lineHeight: 1.8 }}>
                <MathText>{clean(s.whyCorrect)}</MathText>
              </div>
            </div>
          )}

          {/* ❌ Why others wrong */}
          {s.whyWrong && (
            <div className="explanation-section why-wrong-section">
              <span className="section-icon">❌</span>
              <div style={{ flex: 1, fontSize: 16, lineHeight: 1.8 }}>
                <MathText>{clean(s.whyWrong)}</MathText>
              </div>
            </div>
          )}

          {/* 💡 Takeaway */}
          {s.takeaway && (
            <div className="takeaway-strip">
              <span className="takeaway-icon">💡</span>
              <span className="takeaway-text">
                <MathText>{clean(s.takeaway)}</MathText>
              </span>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '20px 24px', fontSize: 17, lineHeight: 1.85, color: '#374151' }}>
          <MathText>{clean(explanation || '')}</MathText>
        </div>
      )}
    </div>
  )
}
