// mathRender.js — math + markdown rendering utility
// Returns HTML string safe for dangerouslySetInnerHTML

let katexModule = null

function getKatex() {
  if (katexModule) return katexModule
  try { katexModule = require('katex'); return katexModule }
  catch { return null }
}

function tryRender(expr, displayMode) {
  const k = getKatex()
  if (!k) return null
  try {
    return k.renderToString(expr.trim(), {
      throwOnError: false, displayMode, output: 'html', trust: false,
    })
  } catch { return null }
}

function sanitise(text) {
  return text
    .replace(/\\\\([a-zA-Z{}\[\]()^_|])/g, '\\$1')
    .replace(/\$\$\s*\$\$/g, '')
    .replace(/\$\s*\$/g, '')
    .replace(/`/g, '')
}

export function renderMath(text) {
  if (!text) return ''
  if (typeof text !== 'string') return String(text)

  let result = sanitise(text)

  // 1. Bold markdown **text** → <strong>text</strong>
  //    Must happen before LaTeX so **$formula$** works correctly
  result = result.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')

  // 2. Bullet lines — • or ▸ or — at line start
  result = result.replace(/^[•▸]\s+/gm, '<span class="inline-bullet">▸</span> ')
  // "— **Option X:**" lines — keep the dash, just ensure it's on its own line
  result = result.replace(/^—\s+/gm, '<span class="option-dash">—</span> ')

  // 3. Paragraph breaks — double newline becomes paragraph break
  //    Single newline becomes <br>
  result = result.replace(/\n\n+/g, '</p><p class="math-para">')
  result = result.replace(/\n/g, '<br/>')
  result = `<p class="math-para">${result}</p>`

  // 4. Display math: $$...$$ or \[...\]
  result = result.replace(/\$\$([^$]+)\$\$|\\\[([^\]]+)\\\]/g, (match, a, b) => {
    return tryRender(a ?? b, true) ?? match
  })

  // 5. Inline math: $...$ or \(...\)
  result = result.replace(/\$([^$\n]+)\$|\\\(([^)]+)\\\)/g, (match, a, b) => {
    return tryRender(a ?? b, false) ?? match
  })

  // 6. Bare LaTeX patterns
  const barePatterns = [
    /\\frac\{[^{}]+\}\{[^{}]+\}/g,
    /\\sqrt(?:\[[^\]]+\])?\{[^{}]+\}/g,
    /\\(?:times|div|pm|cdot|leq|geq|neq|approx|infty)(?![a-zA-Z])/g,
    /\\(?:alpha|beta|gamma|delta|theta|pi|lambda|omega|mu|sigma|phi|psi|Delta|Omega|Sigma|Pi)(?![a-zA-Z])/g,
    /\\text\{[^{}]+\}/g,
  ]
  barePatterns.forEach(re => {
    result = result.replace(re, match => tryRender(match, false) ?? match)
  })

  return result
}

export function hasMath(text) {
  if (!text) return false
  return /\$|\\[a-zA-Z]|\\\\/.test(text)
}
