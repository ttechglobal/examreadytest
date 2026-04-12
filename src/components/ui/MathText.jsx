'use client'
import { useMemo } from 'react'
import { renderMath, hasMath } from '@/lib/utils/mathRender'

/**
 * Renders text that may contain LaTeX math expressions.
 * Use for ALL question text, options, and explanations.
 *
 * Props:
 *   children  — text to render
 *   as        — HTML tag (default: 'span')
 *   className — extra CSS classes
 *   block     — render as block element (default: false)
 */
export function MathText({ children, as: Tag = 'span', className = '', block = false }) {
  const text = children ?? ''

  const html = useMemo(() => {
    if (!text) return ''
    const str = String(text)
    // Skip heavy render path for plain text
    if (!hasMath(str)) return str
    return renderMath(str)
  }, [text])

  if (!text) return null

  return (
    <Tag
      className={`math-text ${block ? 'math-block' : ''} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default MathText
