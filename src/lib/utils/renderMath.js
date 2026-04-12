// Utility for contexts that need HTML string output (e.g. canvas drawing)
// For React rendering, use the MathText component instead.

export function loadKatex() {
  if (typeof window === 'undefined' || window.__katex) return
  import('katex').then(m => { window.__katex = m.default }).catch(() => {})
}

// Renders $...$ and $$...$$ to HTML string. Returns plain text if KaTeX not loaded.
export function renderMathInText(text) {
  if (!text) return ''
  if (typeof window === 'undefined' || !window.__katex) return text

  // Block math first ($$...$$), then inline ($...$)
  return text
    .replace(/\$\$([^$]+)\$\$/g, (match, math) => {
      try {
        return window.__katex.renderToString(math.trim(), {
          throwOnError: false, displayMode: true, output: 'html',
        })
      } catch { return match }
    })
    .replace(/\$([^$\n]+)\$/g, (match, math) => {
      try {
        return window.__katex.renderToString(math.trim(), {
          throwOnError: false, displayMode: false, output: 'html',
        })
      } catch { return match }
    })
}
