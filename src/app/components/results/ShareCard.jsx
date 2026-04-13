'use client'
import { useRef, useEffect, useState } from 'react'

const BRAND_BLUE = '#2D3CE6'
const WHITE      = '#FFFFFF'

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

async function loadFont(name, url) {
  try {
    const font = new FontFace(name, `url(${url})`)
    const loaded = await font.load()
    document.fonts.add(loaded)
    return true
  } catch { return false }
}

function drawCard(canvas, session, withScore) {
  const ctx  = canvas.getContext('2d')
  const W    = 1080
  const H    = 1080
  canvas.width  = W
  canvas.height = H

  // Background
  ctx.fillStyle = BRAND_BLUE
  ctx.fillRect(0, 0, W, H)

  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

  // ── Logo top left ──
  ctx.fillStyle = WHITE
  ctx.font = 'bold 52px Nunito, Arial, sans-serif'
  ctx.fillText('Learniie', 80, 110)
  ctx.font = '32px Inter, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText('Exam Prep', 80, 152)

  // ── Exam badge top right ──
  const badgeText = session?.examType || 'JAMB'
  ctx.fillStyle = WHITE
  roundRect(ctx, W - 220, 70, 140, 56, 28)
  ctx.fill()
  ctx.fillStyle = BRAND_BLUE
  ctx.font = 'bold 28px Inter, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(badgeText, W - 150, 106)
  ctx.textAlign = 'left'

  // ── White card ──
  const cardX = 80; const cardY = 210; const cardW = W - 160; const cardH = 600
  // Shadow layers
  for (let i = 4; i >= 1; i--) {
    ctx.fillStyle = `rgba(0,0,0,${0.04 * i})`
    roundRect(ctx, cardX + i * 2, cardY + i * 3, cardW, cardH, 32)
    ctx.fill()
  }
  ctx.fillStyle = WHITE
  roundRect(ctx, cardX, cardY, cardW, cardH, 32)
  ctx.fill()

  const cx = cardX + 60
  const cy = cardY + 80

  if (withScore && session) {
    // Score variant
    ctx.fillStyle = '#64748B'
    ctx.font = '30px Inter, Arial, sans-serif'
    ctx.fillText(`${session.examType} ${session.subject}`, cx, cy)

    ctx.fillStyle = '#0A0A0A'
    ctx.font = 'bold 68px Nunito, Arial, sans-serif'
    const line1 = `I scored ${Math.round(session.percentage)}%`
    ctx.fillText(line1, cx, cy + 90)

    ctx.font = 'bold 44px Nunito, Arial, sans-serif'
    ctx.fillStyle = '#374151'
    ctx.fillText(`on my ${session.examType}`, cx, cy + 160)
    ctx.fillText(`${session.subject} readiness test.`, cx, cy + 220)

    // Challenge text
    ctx.fillStyle = BRAND_BLUE
    ctx.font = 'bold 52px Nunito, Arial, sans-serif'
    ctx.fillText('Can you beat me?', cx, cy + 340)

    // Score ring
    const ringX = cardX + cardW - 180; const ringY = cardY + 140
    ctx.beginPath()
    ctx.arc(ringX, ringY, 90, 0, Math.PI * 2)
    ctx.fillStyle = '#F1F5F9'; ctx.fill()

    const pct = session.percentage / 100
    const start = -Math.PI / 2
    ctx.beginPath()
    ctx.arc(ringX, ringY, 90, start, start + pct * Math.PI * 2)
    ctx.strokeStyle = BRAND_BLUE; ctx.lineWidth = 14
    ctx.lineCap = 'round'; ctx.stroke()

    ctx.fillStyle = '#0A0A0A'
    ctx.font = 'bold 40px Nunito, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${Math.round(session.percentage)}%`, ringX, ringY + 14)
    ctx.textAlign = 'left'

    // Readiness label
    const ready = session.readinessLabel || 'Almost Ready'
    ctx.font = '22px Inter, Arial, sans-serif'
    ctx.fillStyle = '#64748B'
    ctx.textAlign = 'center'
    ctx.fillText(ready, ringX, ringY + 52)
    ctx.textAlign = 'left'

  } else {
    // Invite variant
    ctx.fillStyle = '#94A3B8'
    ctx.font = '30px Inter, Arial, sans-serif'
    ctx.fillText('For students writing', cx, cy)

    ctx.fillStyle = BRAND_BLUE
    ctx.font = 'bold 52px Nunito, Arial, sans-serif'
    ctx.fillText(session?.examType || 'JAMB', cx, cy + 76)

    ctx.fillStyle = '#0A0A0A'
    ctx.font = 'bold 64px Nunito, Arial, sans-serif'
    ctx.fillText('How ready are', cx, cy + 190)
    ctx.fillText('you for your', cx, cy + 270)
    ctx.fillText('exam?', cx, cy + 350)

    ctx.fillStyle = '#374151'
    ctx.font = '36px Inter, Arial, sans-serif'
    ctx.fillText('I just tested myself.', cx, cy + 450)
    ctx.fillStyle = BRAND_BLUE
    ctx.font = 'bold 36px Inter, Arial, sans-serif'
    ctx.fillText('Have you?', cx, cy + 500)
  }

  // ── Bottom strip ──
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(0, H - 130, W, 130)

  ctx.fillStyle = WHITE
  ctx.font = 'bold 34px Inter, Arial, sans-serif'
  ctx.fillText('Free · No sign-up · Instant results', 80, H - 70)

  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = '28px Inter, Arial, sans-serif'
  ctx.fillText('examprep.learniie.com', 80, H - 28)
}

export function ShareCard({ session }) {
  const canvasRef  = useRef(null)
  const [withScore, setWithScore] = useState(false)
  const [sharing,  setSharing]   = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return
    // Load Nunito then draw
    loadFont('Nunito', 'https://fonts.gstatic.com/s/nunito/v25/XRXV3I6Li01BKofINeaB.woff2')
      .finally(() => drawCard(canvasRef.current, session, withScore))
  }, [session, withScore])

  async function handleShare() {
    if (!canvasRef.current) return
    setSharing(true)
    try {
      const blob = await new Promise(r => canvasRef.current.toBlob(r, 'image/png'))
      const file = new File([blob], 'learniie-exam-prep.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Learniie Exam Prep', text: 'Check your exam readiness — free, no sign-up needed.' })
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob)
        const a   = Object.assign(document.createElement('a'), { href: url, download: 'learniie-exam-prep.png' })
        a.click(); URL.revokeObjectURL(url)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // User cancelled — fine
      }
    } finally { setSharing(false) }
  }

  function handleWhatsApp() {
    const subject = session?.subject || ''
    const examType = session?.examType || ''
    const text = withScore && session
      ? `I scored ${Math.round(session.percentage)}% on my ${examType} ${subject} readiness test on Learniie!\n\nCan you beat me? It's free:\nhttps://examprep.learniie.com`
      : `I just tested my ${examType} exam readiness on Learniie!\n\nCheck yours — free, no sign-up, instant results:\nhttps://examprep.learniie.com`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const btn = (onClick, label, primary = false) => (
    <button onClick={onClick}
      style={{
        flex: 1, padding: '12px 0', border: primary ? 'none' : '1.5px solid #E2E8F0',
        borderRadius: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14,
        background: primary ? '#2D3CE6' : '#fff',
        color: primary ? '#fff' : '#374151',
        cursor: 'pointer', transition: 'all 0.15s',
      }}>
      {label}
    </button>
  )

  return (
    <div>
      {/* Canvas preview */}
      <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E8EAED', marginBottom: 16 }}>
        <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }}/>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        {btn(handleShare, sharing ? 'Sharing…' : '↑ Share / Save image', true)}
        {btn(handleWhatsApp, 'WhatsApp')}
      </div>

      {/* Score toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E8EAED' }}>
        <button
          onClick={() => setWithScore(v => !v)}
          style={{
            width: 44, height: 24, borderRadius: 12, border: 'none',
            background: withScore ? '#2D3CE6' : '#D1D5DB',
            position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute', top: 3, left: withScore ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            transition: 'left 0.2s',
          }}/>
        </button>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151' }}>
          Include my score in the card
        </span>
      </div>
    </div>
  )
}
