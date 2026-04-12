// mathRender.js — Server + client safe math rendering
// Uses static import so KaTeX bundle is included once
// Returns HTML string for dangerouslySetInnerHTML

let katexModule = null

function getKatex() {
  if (katexModule) return katexModule
  try {
    // Works in both server and client via Next.js bundling
    katexModule = require('katex')
    return katexModule
  } catch {
    return null
  }
}

function tryRender(expr, displayMode) {
  const k = getKatex()
  if (!k) return null
  try {
    return k.renderToString(expr.trim(), {
      throwOnError: false,
      displayMode,
      output: 'html',
      trust: false,
    })
  } catch {
    return null
  }
}

/**
 * Sanitise common AI extraction artifacts before rendering.
 * Fixes double-escaped backslashes from JSON serialisation.
 */
function sanitise(text) {
  return text
    // Fix double-escaped backslashes that break LaTeX: \\frac → \frac
    .replace(/\\\\([a-zA-Z{}\[\]()^_|])/g, '\\$1')
    // Remove orphan $$ with nothing between
    .replace(/\$\$\s*\$\$/g, '')
    // Remove orphan $ with nothing between
    .replace(/\$\s*\$/g, '')
    // Remove stray backticks
    .replace(/`/g, '')
}

/**
 * Main render function.
 * Handles $$...$$, $...$, \[...\], \(...\), and bare LaTeX patterns.
 * Returns HTML string safe for dangerouslySetInnerHTML.
 */
export function renderMath(text) {
  if (!text) return ''
  if (typeof text !== 'string') return String(text)

  let result = sanitise(text)

  // 1. Display math: $$...$$ or \[...\]
  result = result.replace(/\$\$([^$]+)\$\$|\\\[([^\]]+)\\\]/g, (match, a, b) => {
    const expr = a ?? b
    return tryRender(expr, true) ?? match
  })

  // 2. Inline math: $...$ or \(...\)
  result = result.replace(/\$([^$\n]+)\$|\\\(([^)]+)\\\)/g, (match, a, b) => {
    const expr = a ?? b
    return tryRender(expr, false) ?? match
  })

  // 3. Bare LaTeX patterns that weren't wrapped in delimiters
  // Only apply to strings that look like LaTeX commands
  const barePatterns = [
    { re: /\\frac\{[^{}]+\}\{[^{}]+\}/g },
    { re: /\\sqrt(?:\[[^\]]+\])?\{[^{}]+\}/g },
    { re: /\\(?:times|div|pm|cdot|leq|geq|neq|approx|infty)(?![a-zA-Z])/g },
    { re: /\\(?:alpha|beta|gamma|delta|theta|pi|lambda|omega|mu|sigma|phi|psi|Delta|Omega|Sigma|Pi)(?![a-zA-Z])/g },
    { re: /\\text\{[^{}]+\}/g },
    { re: /\\left[\[(|][\s\S]+?\\right[\])|\]]/g },
  ]

  barePatterns.forEach(({ re }) => {
    result = result.replace(re, (match) => {
      return tryRender(match, false) ?? match
    })
  })

  return result
}

/**
 * Check whether a string contains any math notation.
 * Used to skip rendering for plain text (perf optimisation).
 */
export function hasMath(text) {
  if (!text) return false
  return /\$|\\[a-zA-Z]|\\\\/.test(text)
}
