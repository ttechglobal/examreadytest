'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getSessions, clearSessions } from '@/lib/storage/sessions'
import { formatDate, formatTimeAgo } from '@/lib/utils/format'
import { getReadiness } from '@/lib/utils/constants'

// ─── Scroll reveal ────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} style={{ transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)', ...style }}>
      {children}
    </div>
  )
}

// ─── Logo mark ────────────────────────────────────────────────
function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <rect width="30" height="30" rx="7" fill="#2D3CE6"/>
      <path d="M9 21V9l6 8.5L21 9v12" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Nav ─────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(255,255,255,0.96)' : '#fff',
      backdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid #E8EAED' : '1px solid #F1F5F9',
      transition: 'all 0.25s',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <LogoMark />
          <span style={{ fontWeight: 900, fontSize: 16, color: '#0A0A0A', letterSpacing: '-0.3px' }}>Exam Ready Test</span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[['#features','Students'],['schools','Schools'],['/community','Community']].map(([h, l]) => (
            <a key={h} href={h.startsWith('/') || h.startsWith('http') ? h : '/'+h}
              style={{ fontSize: 14, fontWeight: 600, color: '#52525B', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#0A0A0A'}
              onMouseLeave={e => e.target.style.color = '#52525B'}>{l}</a>
          ))}
        </div>

        {/* CTA */}
        <Link href="/setup"
          style={{ fontSize: 14, fontWeight: 800, color: '#fff', background: '#2D3CE6', padding: '9px 20px', borderRadius: 8, textDecoration: 'none', letterSpacing: '-0.1px' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1e2cc0'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#2D3CE6'; e.currentTarget.style.transform = 'none' }}>
          Start Test →
        </Link>
      </div>
    </nav>
  )
}

// ─── Product illustration SVG ─────────────────────────────────
function ProductIllustration() {
  return (
    <div style={{ width: '100%', maxWidth: 500, position: 'relative' }}>
      <svg viewBox="0 0 500 460" fill="none" style={{ width: '100%', display: 'block' }}>
        <defs>
          <style>{`
            @keyframes floatA{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
            @keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
            @keyframes floatC{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
            .fa{animation:floatA 5s ease-in-out infinite}
            .fb{animation:floatB 6.5s ease-in-out infinite 1s}
            .fc{animation:floatC 4.8s ease-in-out infinite 0.5s}
          `}</style>
          <filter id="sh" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#00000014"/>
          </filter>
        </defs>

        {/* Background glow */}
        <ellipse cx="250" cy="230" rx="200" ry="185" fill="#EEF0FE" opacity="0.55"/>
        <ellipse cx="370" cy="110" rx="90" ry="82" fill="#6DC77A" opacity="0.08"/>

        {/* ── Question card (main) ── */}
        <g className="fa" filter="url(#sh)">
          <rect x="80" y="60" width="240" height="190" rx="18" fill="white"/>
          {/* Header stripe */}
          <rect x="80" y="60" width="240" height="44" rx="18" fill="#2D3CE6"/>
          <rect x="80" y="84" width="240" height="20" fill="#2D3CE6"/>
          <text x="200" y="85" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="9.5" fontWeight="700" fontFamily="Nunito" letterSpacing="1">PHYSICS · JAMB</text>
          {/* Question text */}
          <text x="100" y="126" fill="#0A0A0A" fontSize="9.5" fontWeight="700" fontFamily="Nunito">Which type of wave requires</text>
          <text x="100" y="140" fill="#0A0A0A" fontSize="9.5" fontWeight="700" fontFamily="Nunito">a medium to propagate?</text>
          {/* Options */}
          {[
            { l:'A', t:'Electromagnetic waves', sel:false, y:160 },
            { l:'B', t:'Longitudinal waves',    sel:true,  y:180 },
            { l:'C', t:'Transverse waves',      sel:false, y:200 },
            { l:'D', t:'Radio waves',           sel:false, y:220 },
          ].map(o => (
            <g key={o.l}>
              <rect x="96" y={o.y - 10} width="206" height="16" rx="8" fill={o.sel ? '#2D3CE6' : '#F8FAFC'}/>
              <rect x="99" y={o.y - 8} width="12" height="12" rx="6" fill={o.sel ? 'rgba(255,255,255,0.2)' : '#E2E8F0'}/>
              <text x="104.5" y={o.y + 1} textAnchor="middle" fill={o.sel ? 'white' : '#94A3B8'} fontSize="6.5" fontWeight="800" fontFamily="Nunito">{o.l}</text>
              <text x="118" y={o.y + 1} fill={o.sel ? 'white' : '#52525B'} fontSize="7.5" fontFamily="Nunito" fontWeight={o.sel ? '700' : '400'}>{o.t}</text>
              {o.sel && <path d="M280 152l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
            </g>
          ))}
        </g>

        {/* ── Score card ── */}
        <g className="fb" filter="url(#sh)">
          <rect x="270" y="46" width="190" height="148" rx="16" fill="white"/>
          <rect x="270" y="46" width="190" height="36" rx="16" fill="#0F172A"/>
          <rect x="270" y="68" width="190" height="14" fill="#0F172A"/>
          <text x="365" y="68" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8" fontWeight="700" fontFamily="Nunito" letterSpacing="0.8">YOUR RESULT</text>
          {/* Score ring */}
          <circle cx="365" cy="138" r="42" fill="none" stroke="#F1F5F9" strokeWidth="7"/>
          <circle cx="365" cy="138" r="42" fill="none" stroke="#2D3CE6" strokeWidth="7"
            strokeLinecap="round" strokeDasharray="264" strokeDashoffset="79"
            style={{ transformOrigin: '365px 138px', transform: 'rotate(-90deg)' }}/>
          <text x="365" y="133" textAnchor="middle" fill="#0A0A0A" fontSize="22" fontWeight="900" fontFamily="Nunito">70%</text>
          <text x="365" y="148" textAnchor="middle" fill="#94A3B8" fontSize="7.5" fontWeight="700" fontFamily="Nunito" letterSpacing="0.5">SCORE</text>
          {/* Badge */}
          <rect x="315" y="168" width="100" height="20" rx="10" fill="#EEF0FE"/>
          <circle cx="328" cy="178" r="3.5" fill="#2D3CE6"/>
          <text x="370" y="181" textAnchor="middle" fill="#2D3CE6" fontSize="8.5" fontWeight="800" fontFamily="Nunito">Almost Ready</text>
        </g>

        {/* ── Topic breakdown card ── */}
        <g className="fc" filter="url(#sh)">
          <rect x="34" y="270" width="210" height="170" rx="16" fill="white"/>
          <text x="54" y="298" fill="#0A0A0A" fontSize="11" fontWeight="800" fontFamily="Nunito">Topic Breakdown</text>
          <text x="54" y="312" fill="#94A3B8" fontSize="8" fontFamily="Nunito">Physics · Sorted by score</text>
          {[
            { t:'Mechanics',      pct:85, w:130, color:'#22C55E', y:330 },
            { t:'Waves',          pct:62, w:95,  color:'#2D3CE6', y:356 },
            { t:'Thermodynamics', pct:43, w:66,  color:'#F59E0B', y:382 },
            { t:'Electricity',    pct:24, w:37,  color:'#EF4444', y:408 },
          ].map(({ t, pct, w, color, y }) => (
            <g key={t}>
              <text x="54" y={y - 4} fill="#374151" fontSize="8" fontWeight="600" fontFamily="Nunito">{t}</text>
              <rect x="54" y={y + 2} width="148" height="5" rx="2.5" fill="#F1F5F9"/>
              <rect x="54" y={y + 2} width={w} height="5" rx="2.5" fill={color}/>
              <text x="210" y={y + 7} fill="#0A0A0A" fontSize="7.5" fontWeight="800" fontFamily="Nunito">{pct}%</text>
            </g>
          ))}
        </g>

        {/* Exam badges */}
        <g style={{ animation: 'floatA 4s ease-in-out infinite 1.2s' }}>
          <rect x="28" y="210" width="52" height="26" rx="13" fill="#2D3CE6"/>
          <text x="54" y="227" textAnchor="middle" fill="white" fontSize="10" fontWeight="800" fontFamily="Nunito">JAMB</text>
        </g>
        <g style={{ animation: 'floatB 4.5s ease-in-out infinite 0.4s' }}>
          <rect x="384" y="218" width="60" height="26" rx="13" fill="#F1F5F9"/>
          <text x="414" y="235" textAnchor="middle" fill="#94A3B8" fontSize="10" fontWeight="700" fontFamily="Nunito">WAEC</text>
          <text x="430" y="229" fill="#94A3B8" fontSize="6.5" fontWeight="600" fontFamily="Nunito">soon</text>
        </g>

        {/* Decorative dots */}
        <circle cx="56" cy="88" r="4" fill="#2D3CE6" opacity="0.15"/>
        <circle cx="44" cy="100" r="2.5" fill="#2D3CE6" opacity="0.1"/>
        <circle cx="434" cy="370" r="4" fill="#6DC77A" opacity="0.2"/>
        <circle cx="446" cy="382" r="2.5" fill="#6DC77A" opacity="0.14"/>
      </svg>
    </div>
  )
}

// ─── Features ─────────────────────────────────────────────────
const FEATURES = [
  { icon: '📝', title: 'Real past questions',     desc: 'Questions drawn directly from JAMB past papers across multiple years — not AI-generated or paraphrased.' },
  { icon: '🎯', title: 'Topic-level analysis',    desc: 'See exactly which topics need more work. Not just a score — a complete breakdown by topic.' },
  { icon: '💡', title: 'Step-by-step explanations', desc: 'Understand why each answer is correct. Every question has a full worked explanation.' },
  { icon: '📊', title: 'Ranked recommendations',  desc: 'Prioritised list of what to study next, based on your actual performance on each topic.' },
  { icon: '📤', title: 'Shareable results',        desc: 'Send your result link to classmates or family. No login required to view.' },
  { icon: '⚡', title: 'No account needed',        desc: 'Just your name. Start testing in 10 seconds. No email, no password, no friction.' },
]

// ─── Community section ────────────────────────────────────────
function CommunitySection({ mw }) {
  const [feed,     setFeed]     = useState([])
  const [posting,  setPosting]  = useState(false)
  const [message,  setMessage]  = useState('')
  const [name,     setName]     = useState('')
  const [room,     setRoom]     = useState('jamb')
  const [postDone, setPostDone] = useState(false)
  const [postErr,  setPostErr]  = useState(null)

  useEffect(() => {
    fetch('/api/community/feed')
      .then(r => r.json())
      .then(d => setFeed((d.posts || []).slice(0, 2)))
      .catch(() => {})
  }, [])

  async function handlePost(e) {
    e.preventDefault()
    if (!message.trim()) return
    setPosting(true); setPostErr(null)
    try {
      const res = await fetch(`/api/community/${room}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name || 'Anonymous', content: message, postType: 'general' }),
      })
      const data = await res.json()
      if (!res.ok) { setPostErr(data.error || 'Failed to post'); return }
      setPostDone(true); setMessage('')
      setTimeout(() => { window.location.href = `/community/${room}` }, 1000)
    } catch { setPostErr('Network error. Please try again.') }
    finally { setPosting(false) }
  }

  return (
    <section style={{ background: '#F5F7FF', padding: '100px 24px' }}>
      <div style={mw}>
        <Reveal>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#2D3CE6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Community</p>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(26px,4.5vw,38px)', color: '#0A0A0A', letterSpacing: '-0.5px', lineHeight: 1.08, marginBottom: 14 }}>
            You're not studying alone.
          </h2>
          <p style={{ fontWeight: 500, fontSize: 16, color: '#52525B', maxWidth: 480, marginBottom: 48, lineHeight: 1.7 }}>
            Thousands of students preparing for the same exams. Share progress, ask questions, swap tips — no account needed.
          </p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,420px),1fr))', gap: 24 }}>
          {/* Room cards + recent feed */}
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[['jamb','JAMB','#2D3CE6','#EEF0FE'],['waec','WAEC','#16A34A','#DCFCE7']].map(([id, label, color, bg]) => (
                <Link key={id} href={`/community/${id}`}
                  style={{ flex: 1, textAlign: 'center', padding: '13px 0', border: `1.5px solid ${color}33`, borderRadius: 12, background: '#fff', fontWeight: 800, fontSize: 15, color, textDecoration: 'none', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = bg }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
                  {label} ›
                </Link>
              ))}
              <div style={{ flex: 1, textAlign: 'center', padding: '13px 0', border: '1.5px dashed #E2E8F0', borderRadius: 12, background: '#FAFAFA', fontWeight: 700, fontSize: 13, color: '#94A3B8' }}>
                More soon
              </div>
            </div>

            {feed.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#64748B', margin: 0 }}>💬 Recent posts</p>
                </div>
                {feed.map((post, i) => (
                  <div key={post.id} style={{ padding: '13px 16px', borderBottom: i < feed.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#0A0A0A' }}>{post.display_name}</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{formatTimeAgo(post.created_at)}</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>
                      {post.content.slice(0, 100)}{post.content.length > 100 ? '…' : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Link href="/community" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, color: '#2D3CE6', textDecoration: 'none' }}>
              Join the conversation →
            </Link>
          </div>

          {/* Mini composer */}
          <div style={{ background: '#fff', border: '1.5px solid #DDE2FF', borderRadius: 14, padding: 24 }}>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#0A0A0A', marginBottom: 16 }}>
              What's on your mind about your exam prep?
            </p>
            {postDone ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 22, marginBottom: 8 }}>🎉</p>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#15803D' }}>Posted! Redirecting to community…</p>
              </div>
            ) : (
              <form onSubmit={handlePost}>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, 500))}
                  placeholder="Share a tip, ask a question, or just say hi…"
                  rows={3}
                  style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', fontFamily: 'Nunito, sans-serif', fontSize: 14, lineHeight: 1.6, resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  <select value={room} onChange={e => setRoom(e.target.value)}
                    style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 10px', outline: 'none', background: '#fff', cursor: 'pointer' }}>
                    <option value="jamb">JAMB</option>
                    <option value="waec">WAEC</option>
                  </select>
                  <input value={name} onChange={e => setName(e.target.value.slice(0, 40))} placeholder="Name (optional)"
                    style={{ flex: 1, minWidth: 120, fontFamily: 'Nunito, sans-serif', fontSize: 13, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 10px', outline: 'none' }}/>
                </div>
                {postErr && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 8 }}>{postErr}</p>}
                <button type="submit" disabled={!message.trim() || posting}
                  style={{ width: '100%', padding: '12px 0', border: 'none', borderRadius: 10, background: message.trim() ? '#2D3CE6' : '#E2E8F0', color: message.trim() ? '#fff' : '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, cursor: message.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
                  {posting ? 'Posting…' : 'Post anonymously →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main landing page ────────────────────────────────────────
export default function LandingPage() {
  const [sessions, setSessions] = useState([])
  useEffect(() => {
    getSessions().then(setSessions).catch(() => {})
  }, [])

  const mw    = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' }
  const mwMid = { maxWidth: 820,  margin: '0 auto', padding: '0 24px' }

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', background: '#FAFAFA', minHeight: '100vh', overflowX: 'hidden' }}>
      <Nav />

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section style={{ background: '#fff', paddingTop: 100, paddingBottom: 80 }}>
        <div style={{ ...mw, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: '48px 72px', alignItems: 'center' }}>

          {/* Left: copy */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#2D3CE6', marginBottom: 20 }}>
              Free exam readiness testing
            </p>

            <h1 style={{ fontWeight: 900, fontSize: 'clamp(40px,6.5vw,62px)', lineHeight: 1.02, letterSpacing: '-1.8px', color: '#0A0A0A', marginBottom: 22 }}>
              Know exactly<br/>
              <span style={{ color: '#2D3CE6' }}>where you stand.</span>
            </h1>

            <p style={{ fontWeight: 500, fontSize: 17, color: '#52525B', lineHeight: 1.75, maxWidth: 420, marginBottom: 36 }}>
              Take 40 past questions. Get a topic-by-topic breakdown of what you know and what you need to work on. Free. No sign-up.
            </p>

            {/* Exam badges */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 36, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 99, background: '#EEF0FD', color: '#2D3CE6', border: '1.5px solid #C5CAF6' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6DC77A', boxShadow: '0 0 0 2px rgba(109,199,122,0.3)', animation: 'pulse-dot 2s infinite', display: 'inline-block' }}/>
                JAMB — Available now
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: 13, padding: '6px 14px', borderRadius: 99, background: '#F8F9FA', color: '#94A3B8', border: '1.5px dashed #CBD5E1' }}>
                WAEC — Coming soon
              </span>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/setup"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, background: '#2D3CE6', color: '#fff', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', letterSpacing: '-0.2px', boxShadow: '0 4px 20px rgba(45,60,230,0.22)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(45,60,230,0.28)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(45,60,230,0.22)' }}>
                Start your readiness test →
              </Link>
              <Link href="/schools"
                style={{ fontSize: 14, fontWeight: 600, color: '#2D3CE6', textDecoration: 'none' }}>
                For schools & tutorial centres →
              </Link>
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', marginTop: 20 }}>
              Free · No sign-up · Results in minutes
            </p>
          </div>

          {/* Right: Product illustration */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ProductIllustration />
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════ */}
      <section id="features" style={{ padding: '100px 24px', background: '#F8F9FA' }}>
        <div style={mw}>
          <Reveal>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(26px,4.5vw,38px)', color: '#0A0A0A', letterSpacing: '-0.5px', textAlign: 'center', marginBottom: 14 }}>
              Everything that helps.<br/>Nothing that doesn't.
            </h2>
            <p style={{ fontWeight: 500, fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 56, maxWidth: 480, margin: '0 auto 56px' }}>
              Built for one thing: helping Nigerian students understand exactly where they stand before their exams.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,300px), 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: '28px 24px', height: '100%', boxSizing: 'border-box', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = '#C7D2FE' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E8EAED' }}>
                  <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: '#0A0A0A', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontWeight: 500, fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMMUNITY ═════════════════════════════════════════ */}
      <CommunitySection mw={mw} />

      {/* ══ CTA BAND ══════════════════════════════════════════ */}
      <section style={{ background: '#0F172A', padding: '90px 24px' }}>
        <div style={{ ...mwMid, textAlign: 'center' }}>
          <Reveal>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(28px,5vw,44px)', color: '#fff', lineHeight: 1.08, letterSpacing: '-0.7px', marginBottom: 16 }}>
              Ready to find out where you stand?
            </h2>
            <p style={{ fontWeight: 500, fontSize: 16, color: '#6B7DB3', marginBottom: 40 }}>
              Free. No sign-up. Works on any phone.
            </p>
            <Link href="/setup"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fff', color: '#2D3CE6', fontWeight: 800, fontSize: 15, padding: '15px 32px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 32px rgba(0,0,0,0.28)', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EEF0FE'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none' }}>
              Start my test — it's free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#2D3CE6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══ PAST SESSIONS ════════════════════════════════════ */}
      {sessions.length > 0 && (
        <section style={{ background: '#fff', padding: '72px 24px' }}>
          <div style={mwMid}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <p style={{ fontWeight: 900, fontSize: 20, color: '#0A0A0A', margin: '0 0 4px' }}>Welcome back</p>
                <p style={{ fontSize: 14, color: '#71717A', margin: 0 }}>Your recent sessions</p>
              </div>
              <button onClick={() => { clearSessions(); setSessions([]) }}
                style={{ fontSize: 13, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
                Clear
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sessions.slice(0, 3).map(s => {
                const r = getReadiness(s.percentage)
                const colors = { green: ['#DCFCE7','#16A34A'], blue: ['#EEF0FE','#2D3CE6'], amber: ['#FEF3C7','#D97706'], red: ['#FEE2E2','#DC2626'] }
                const [bg, fg] = colors[r.color] || colors.blue
                return (
                  <Link key={s.shareToken} href={`/results/${s.shareToken}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1.5px solid #EBEBEB', borderRadius: 13, padding: '15px 18px', textDecoration: 'none', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2D3CE6'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#EBEBEB'; e.currentTarget.style.transform = 'none' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 15, color: '#0A0A0A', margin: '0 0 3px' }}>{s.studentName}</p>
                      <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{s.examType} · {s.subject} · {formatDate(s.createdAt)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 900, fontSize: 20, color: '#0A0A0A', margin: '0 0 4px' }}>{Math.round(s.percentage)}%</p>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: bg, color: fg }}>{r.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer style={{ background: '#0F172A', padding: '60px 24px 32px' }}>
        <div style={mw}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 48, marginBottom: 56 }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, background: '#2D3CE6', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>E</div>
                <span style={{ fontWeight: 900, fontSize: 15, color: '#fff' }}>Exam Ready Test</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, margin: '0 0 16px', maxWidth: 220 }}>
                Free exam readiness testing for every Nigerian student.
              </p>
              <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>
                A <a href="https://learniie.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2D3CE6', textDecoration: 'none' }}>Learniie</a> product
              </p>
            </div>

            {/* Students */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16 }}>Students</p>
              {[['/#features','How it works'],['/setup','Take a test'],['/community','Community'],['/results','View results']].map(([h,l]) => (
                <div key={l} style={{ marginBottom: 11 }}>
                  <a href={h} style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#64748B'}>{l}</a>
                </div>
              ))}
            </div>

            {/* Schools */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16 }}>Schools</p>
              {[['/schools','For schools'],['/schools/register','Register'],['/schools/login','Log in'],['/schools#how','How it works']].map(([h,l]) => (
                <div key={l} style={{ marginBottom: 11 }}>
                  <a href={h} style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#64748B'}>{l}</a>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1E293B', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>© 2025 Exam Ready Test · Made with care for Nigerian students</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ fontSize: 12, fontWeight: 700, color: '#64748B', background: 'none', border: '1px solid #334155', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#64748B' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = '#334155' }}>
              ↑ Top
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
