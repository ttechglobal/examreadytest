/**
 * mathRender.js — Complete math and text rendering pipeline
 *
 * Pipeline order (do not reorder):
 * 1. Fix JSON double-escaping  (\\frac → \frac)
 * 2. Strip leaked HTML tags
 * 3. Process bold markdown **text**
 * 4. Process structure (bullets, line breaks, em-dashes)
 * 5. Render display math ($$...$$ or \[...\])
 * 6. Render inline math ($...$ or \(...\))
 * 7. Render bare LaTeX expressions
 * 8. Clean remaining artifacts
 */

import katex from 'katex'

// ─── Entry point ─────────────────────────────────────────────────

export function renderMath(rawText) {
  if (!rawText || typeof rawText !== 'string') return ''
  let text = rawText
  text = fixJsonEscaping(text)
  text = stripLeakedHtml(text)
  text = processBold(text)
  text = processStructure(text)
  text = renderDisplayMath(text)
  text = renderInlineMath(text)
  text = renderBareLaTeX(text)
  text = cleanArtifacts(text)
  return text
}

export function hasMath(text) {
  if (!text) return false
  return /\$|\\[a-zA-Z]|\\\\/.test(text)
}

// ─── Step 1: Fix JSON double-escaping ────────────────────────────

function fixJsonEscaping(text) {
  return text
    .replace(/\\\\([a-zA-Z])/g, '\\$1')
    .replace(/\\\\/g, '\\')
}

// ─── Step 2: Strip leaked HTML ───────────────────────────────────

function stripLeakedHtml(text) {
  return text
    .replace(/<span\s[^>]*>([^<]*)<\/span>/g, '$1')
    .replace(/<div\s[^>]*>([^<]*)<\/div>/g, '$1')
    .replace(/<(?!\/?(?:strong|em|br|p|ul|li|ol)\b)[^>]+>/g, '')
}

// ─── Step 3: Bold markdown ────────────────────────────────────────

function processBold(text) {
  return text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
}

// ─── Step 4: Structure ────────────────────────────────────────────

function processStructure(text) {
  let result = text

  // Remove em-dash decoration at start of lines (AI artifact)
  result = result.replace(/^[\s]*[\u2014\u2013]{1,2}\s*/gm, '')
  // Remove long dash dividers
  result = result.replace(/[-\u2014\u2013]{3,}/g, '')
  // Replace inline em-dash separator with colon
  result = result.replace(/\s+[\u2014]\s+/g, ': ')

  // Bullet indicators → <li>
  result = result.replace(
    /^[\s]*[•▸\-\*]\s+(.+)$/gm,
    '<li class="math-bullet">$1</li>'
  )

  // Wrap consecutive <li> in <ul>
  result = result.replace(
    /(<li class="math-bullet">[\s\S]*?<\/li>\n?)+/g,
    (match) => `<ul class="math-bullet-list">${match}</ul>`
  )

  // Double newline → paragraph break (use sentinel to survive the \n→<br> pass)
  result = result.replace(/\n\n+/g, '§PARA§')
  // Single newline → <br> (preserves equation-per-line layout)
  result = result.replace(/\n/g, '<br/>')
  // Restore paragraph breaks
  result = result.replace(/§PARA§/g, '</p><p class="math-para">')

  if (!result.startsWith('<p') && !result.startsWith('<ul') && !result.startsWith('<ol')) {
    result = `<p class="math-para">${result}</p>`
  }

  return result
}

// ─── Step 5: Display math ─────────────────────────────────────────

function renderDisplayMath(text) {
  text = text.replace(/\$\$([^$]+)\$\$/gs, (_, math) => renderKaTeX(math.trim(), true))
  text = text.replace(/\\\[([^\]]+)\\\]/gs, (_, math) => renderKaTeX(math.trim(), true))
  return text
}

// ─── Step 6: Inline math ─────────────────────────────────────────

function renderInlineMath(text) {
  text = text.replace(/(?<!\$)\$(?!\$)([^$\n<>]+?)\$(?!\$)/g, (_, math) => renderKaTeX(math.trim(), false))
  text = text.replace(/\\\(([^)]+)\\\)/g, (_, math) => renderKaTeX(math.trim(), false))
  return text
}

// ─── Step 7: Bare LaTeX ───────────────────────────────────────────

function renderBareLaTeX(text) {
  const patterns = [
    { re: /\\frac\{([^}]+)\}\{([^}]+)\}/g,
      fn: (_, n, d) => renderKaTeX(`\\frac{${n}}{${d}}`, false) },
    { re: /\\sqrt(?:\[([^\]]+)\])?\{([^}]+)\}/g,
      fn: (_, idx, val) => renderKaTeX(idx ? `\\sqrt[${idx}]{${val}}` : `\\sqrt{${val}}`, false) },
    { re: /\\(alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|omega|phi|psi|rho|eta|Delta|Omega|Sigma|Pi)(?![a-zA-Z])/g,
      fn: (_, sym) => renderKaTeX(`\\${sym}`, false) },
    { re: /\\(times|div|pm|cdot|leq|geq|neq|approx|infty)(?![a-zA-Z])/g,
      fn: (_, op) => renderKaTeX(`\\${op}`, false) },
    { re: /\\(rightarrow|leftarrow|leftrightarrow|Rightarrow)(?![a-zA-Z])/g,
      fn: (_, a) => renderKaTeX(`\\${a}`, false) },
    { re: /\\text\{([^}]+)\}/g,
      fn: (_, t) => renderKaTeX(`\\text{${t}}`, false) },
    { re: /([a-zA-Z0-9])\^\{([^}]+)\}/g,
      fn: (_, base, exp) => renderKaTeX(`${base}^{${exp}}`, false) },
    { re: /([a-zA-Z0-9])_\{([^}]+)\}/g,
      fn: (_, base, sub) => renderKaTeX(`${base}_{${sub}}`, false) },
  ]
  patterns.forEach(({ re, fn }) => { text = text.replace(re, fn) })
  return text
}

// ─── Step 8: Clean artifacts ──────────────────────────────────────

function cleanArtifacts(text) {
  return text
    .replace(/\\([^a-zA-Z{(])/g, '$1')
    .replace(/\\([a-zA-Z]+)/g, (match, cmd) => {
      const known = ['frac','sqrt','times','div','pm','alpha','beta','gamma',
        'delta','theta','pi','sigma','lambda','mu','omega','text','left','right']
      if (known.includes(cmd)) {
        try { return katex.renderToString(`\\${cmd}`, { throwOnError: false }) }
        catch { return '' }
      }
      return ''
    })
    .replace(/\$(?![0-9])/g, '')
    .replace(/`/g, '')
    .replace(/<p class="math-para"><\/p>/g, '')
    .replace(/<p class="math-para"><br\/><\/p>/g, '')
    .replace(/  +/g, ' ')
}

// ─── KaTeX renderer ───────────────────────────────────────────────

function renderKaTeX(math, displayMode = false) {
  try {
    return katex.renderToString(math, {
      throwOnError: false,
      displayMode,
      trust: false,
      strict: false,
      output: 'html',
    })
  } catch {
    return math.replace(/\\[a-zA-Z]+/g, '').replace(/[{}]/g, '').trim()
  }
}
