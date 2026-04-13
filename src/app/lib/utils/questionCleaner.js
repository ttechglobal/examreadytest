// Strips common exam paper artifacts from question and option text

const INSTRUCTION_PATTERNS = [
  /^choose\s+(the\s+)?correct\s+(option|answer)[:\.\s]*/i,
  /^choose\s+your\s+question\s+type[:\.\s]*/i,
  /^select\s+(the\s+)?correct\s+(option|answer)[:\.\s]*/i,
  /^\d+[\.\)]\s*/,            // Leading number: "1. " or "1) "
  /^question\s+\d+[\.\):\s]*/i,
]

export function cleanQuestionText(text) {
  if (!text) return ''
  let cleaned = text.trim()
  INSTRUCTION_PATTERNS.forEach(p => { cleaned = cleaned.replace(p, '') })
  return cleaned.trim()
}

export function cleanOptionText(text) {
  if (!text) return ''
  return text.trim().replace(/^[A-Ea-e][\.\)]\s+/, '').trim()
}
