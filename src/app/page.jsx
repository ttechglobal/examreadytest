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
    <div ref={ref} style={{ transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', ...style }}>
      {children}
    </div>
  )
}

// ─── Logo mark ────────────────────────────────────────────────
function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#2D3CE6"/>
      <path d="M10 22V10l6 9 6-9v12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Nav ─────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'background 0.3s, box-shadow 0.3s',
      background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      boxShadow: scrolled ? '0 1px 0 #0000000f' : 'none',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark />
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 17, color: '#0A0A0A', letterSpacing: '-0.3px' }}>Learniie</span>
        </div>
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 32 }}>
          {[['#how','How it works'],['#subjects','Subjects'],['#exams','Exams'],['/community','Community']].map(([h, l]) => (
            <a key={h} href={h} style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#52525B', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#0A0A0A'} onMouseLeave={e => e.target.style.color = '#52525B'}>{l}</a>
          ))}
        </div>
        <Link href="/setup" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#fff', background: '#2D3CE6', padding: '9px 20px', borderRadius: 8, textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = '#1e2cc0'}
          onMouseLeave={e => e.currentTarget.style.background = '#2D3CE6'}>
          Start test
        </Link>
      </div>
    </nav>
  )
}

// ─── Hero illustration ─────────────────────────────────────────
function HeroIllustration() {
  return (
    <div style={{ width: '100%', maxWidth: 520, position: 'relative' }}>
      <svg viewBox="0 0 520 480" fill="none" style={{ width: '100%', display: 'block' }}>
        <defs>
          <style>{`
            @keyframes f1{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
            @keyframes f2{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
            @keyframes f3{0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)}}
            @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
            .ani1{animation:f1 5.2s ease-in-out infinite}
            .ani2{animation:f2 6s ease-in-out infinite 1s}
            .ani3{animation:f3 4.6s ease-in-out infinite 0.4s}
          `}</style>
          <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#00000018"/>
          </filter>
        </defs>

        {/* Soft background */}
        <ellipse cx="268" cy="244" rx="210" ry="195" fill="#EEF0FE" opacity="0.5"/>
        <ellipse cx="390" cy="130" rx="95" ry="88" fill="#6DC77A" opacity="0.09"/>

        {/* ── Score card ── */}
        <g className="ani1" filter="url(#cardShadow)">
          <rect x="142" y="28" width="236" height="200" rx="20" fill="white"/>
          {/* Card top bar */}
          <rect x="142" y="28" width="236" height="48" rx="20" fill="#2D3CE6"/>
          <rect x="142" y="56" width="236" height="20" fill="#2D3CE6"/>
          <text x="260" y="57" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="600" fontFamily="Inter" letterSpacing="1">RESULT SUMMARY</text>
          {/* Score ring */}
          <circle cx="260" cy="155" r="54" fill="none" stroke="#F1F5F9" strokeWidth="9"/>
          <circle cx="260" cy="155" r="54" fill="none" stroke="#2D3CE6" strokeWidth="9"
            strokeLinecap="round" strokeDasharray="339.3" strokeDashoffset="102"
            style={{ transformOrigin: '260px 155px', transform: 'rotate(-90deg)' }}/>
          <text x="260" y="150" textAnchor="middle" fill="#0A0A0A" fontSize="24" fontWeight="800" fontFamily="Nunito">70%</text>
          <text x="260" y="167" textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="600" fontFamily="Inter" letterSpacing="1">YOUR SCORE</text>
          {/* Readiness badge */}
          <rect x="200" y="196" width="120" height="24" rx="12" fill="#EEF0FE"/>
          <circle cx="216" cy="208" r="4" fill="#2D3CE6"/>
          <text x="264" y="212" textAnchor="middle" fill="#2D3CE6" fontSize="10" fontWeight="700" fontFamily="Inter">Almost Ready</text>
        </g>

        {/* ── Topic breakdown card ── */}
        <g className="ani2" filter="url(#cardShadow)">
          <rect x="18" y="248" width="226" height="188" rx="18" fill="white"/>
          <text x="38" y="277" fill="#0A0A0A" fontSize="12" fontWeight="700" fontFamily="Inter">Topic Breakdown</text>
          <text x="38" y="292" fill="#94A3B8" fontSize="9" fontFamily="Inter">Sorted by performance</text>
          {[
            { label: 'Mechanics',      pct: 85, w: 136, color: '#22C55E', y: 312 },
            { label: 'Waves',          pct: 60, w: 96,  color: '#2D3CE6', y: 337 },
            { label: 'Thermodynamics', pct: 44, w: 70,  color: '#F59E0B', y: 362 },
            { label: 'Electricity',    pct: 28, w: 45,  color: '#EF4444', y: 387 },
          ].map(({ label, pct, w, color, y }) => (
            <g key={label}>
              <text x="38" y={y - 2} fill="#52525B" fontSize="8.5" fontFamily="Inter">{label}</text>
              <rect x="38" y={y + 5} width="160" height="5" rx="2.5" fill="#F1F5F9"/>
              <rect x="38" y={y + 5} width={w} height="5" rx="2.5" fill={color}/>
              <text x="206" y={y + 10} fill="#0A0A0A" fontSize="8" fontWeight="700" fontFamily="Inter">{pct}%</text>
            </g>
          ))}
        </g>

        {/* ── Question card ── */}
        <g className="ani3" filter="url(#cardShadow)">
          <rect x="272" y="252" width="220" height="164" rx="18" fill="white"/>
          {/* Topic tag */}
          <rect x="286" y="268" width="66" height="18" rx="9" fill="#EEF0FE"/>
          <text x="319" y="281" textAnchor="middle" fill="#2D3CE6" fontSize="8.5" fontWeight="700" fontFamily="Inter">Waves</text>
          <text x="286" y="304" fill="#0A0A0A" fontSize="9.5" fontWeight="600" fontFamily="Inter">Which wave is longitudinal?</text>
          {[
            { l: 'A', t: 'Light waves',  sel: false },
            { l: 'B', t: 'Sound waves',  sel: true  },
            { l: 'C', t: 'X-rays',       sel: false },
            { l: 'D', t: 'Radio waves',  sel: false },
          ].map((opt, i) => (
            <g key={opt.l}>
              <rect x="286" y={318 + i * 22} width="190" height="17" rx="8.5" fill={opt.sel ? '#2D3CE6' : '#F8FAFC'}/>
              <rect x="290" y={320 + i * 22} width="13" height="13" rx="6.5" fill={opt.sel ? 'rgba(255,255,255,0.22)' : '#E2E8F0'}/>
              <text x="296.5" y={330 + i * 22} textAnchor="middle" fill={opt.sel ? 'white' : '#94A3B8'} fontSize="7" fontWeight="700" fontFamily="Inter">{opt.l}</text>
              <text x="310" y={330 + i * 22} fill={opt.sel ? 'white' : '#52525B'} fontSize="8" fontFamily="Inter" fontWeight={opt.sel ? '600' : '400'}>{opt.t}</text>
              {opt.sel && <path d="M464 326l3.5 3.5 5.5-5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
            </g>
          ))}
        </g>

        {/* ── Exam badges ── */}
        <g style={{ animation: 'f1 4.2s ease-in-out infinite 1.4s' }}>
          <rect x="28" y="198" width="62" height="30" rx="15" fill="#2D3CE6"/>
          <text x="59" y="217" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="Inter">JAMB</text>
        </g>
        <g style={{ animation: 'f2 4.8s ease-in-out infinite 0.6s' }}>
          <rect x="406" y="170" width="68" height="30" rx="15" fill="#22C55E"/>
          <text x="440" y="189" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="Inter">WAEC</text>
        </g>
        <g style={{ animation: 'f3 4s ease-in-out infinite 1s' }}>
          <rect x="406" y="210" width="68" height="30" rx="15" fill="#F59E0B"/>
          <text x="440" y="229" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="Inter">NECO</text>
        </g>

        {/* Decorative dots */}
        <circle cx="104" cy="76" r="4" fill="#2D3CE6" opacity="0.18"/>
        <circle cx="90" cy="90" r="2.5" fill="#2D3CE6" opacity="0.12"/>
        <circle cx="120" cy="92" r="2" fill="#2D3CE6" opacity="0.1"/>
        <circle cx="438" cy="388" r="4" fill="#6DC77A" opacity="0.25"/>
        <circle cx="422" cy="400" r="2.5" fill="#6DC77A" opacity="0.18"/>
        <circle cx="454" cy="398" r="2" fill="#6DC77A" opacity="0.12"/>
        <path d="M468 56L471 50L474 56L471 62Z" fill="#F59E0B" opacity="0.4"/>
        <path d="M66 438L69 432L72 438L69 444Z" fill="#2D3CE6" opacity="0.25"/>
      </svg>
    </div>
  )
}

// ─── Subject icon (pure SVG, no emoji) ───────────────────────
function SubjectIcon({ name }) {
  const paths = {
    Physics:     <><circle cx="12" cy="12" r="3" stroke="#2D3CE6" strokeWidth="1.5"/><ellipse cx="12" cy="12" rx="9" ry="4" stroke="#2D3CE6" strokeWidth="1.3" strokeOpacity="0.5"/><ellipse cx="12" cy="12" rx="9" ry="4" stroke="#2D3CE6" strokeWidth="1.3" strokeOpacity="0.5" style={{ transform: 'rotate(60deg)', transformOrigin: '12px 12px' }}/><ellipse cx="12" cy="12" rx="9" ry="4" stroke="#2D3CE6" strokeWidth="1.3" strokeOpacity="0.5" style={{ transform: 'rotate(120deg)', transformOrigin: '12px 12px' }}/></>,
    Mathematics: <><path d="M7 12h10M12 7v10" stroke="#2D3CE6" strokeWidth="1.8" strokeLinecap="round"/><path d="M8 8l8 8M16 8l-8 8" stroke="#2D3CE6" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/></>,
    Chemistry:   <><path d="M10 3v7l-4 7h12l-4-7V3" stroke="#2D3CE6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 3h6" stroke="#2D3CE6" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9.5" cy="15" r="0.8" fill="#2D3CE6"/><circle cx="13" cy="16.5" r="0.8" fill="#2D3CE6"/></>,
    Biology:     <><path d="M12 3C8.5 3 6 6 6 9c0 4 6 10 6 10s6-6 6-10c0-3-2.5-6-6-6z" stroke="#2D3CE6" strokeWidth="1.5" strokeLinejoin="round"/><path d="M6 12h12" stroke="#2D3CE6" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/></>,
    English:     <><path d="M5 7h14M5 10.5h9M5 14h14M5 17.5h7" stroke="#2D3CE6" strokeWidth="1.5" strokeLinecap="round"/></>,
    Government:  <><path d="M3 18h18M12 3l-8 8h16l-8-8z" stroke="#2D3CE6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 11v7M12 11v7M17 11v7" stroke="#2D3CE6" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/></>,
    History:     <><circle cx="12" cy="12" r="8" stroke="#2D3CE6" strokeWidth="1.5"/><path d="M12 7.5V12l3.5 3.5" stroke="#2D3CE6" strokeWidth="1.5" strokeLinecap="round"/></>,
    Economics:   <><path d="M4 17l4.5-4.5 3.5 2.5 5.5-7" stroke="#2D3CE6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 7h3v3" stroke="#2D3CE6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></>,
    Literature:  <><path d="M6 4h10a1 1 0 011 1v14l-5-2.5L7 19V5a1 1 0 011-1z" stroke="#2D3CE6" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9.5 9.5h5M9.5 12.5h3.5" stroke="#2D3CE6" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/></>,
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      {paths[name] || null}
    </svg>
  )
}

// ─── Data ────────────────────────────────────────────────────
// SUBJECTS loaded dynamically from /api/subjects — see availableSubjects state in LandingPage

const FEATURES = [
  { title: 'Real past questions', desc: 'Drawn directly from verified JAMB, WAEC, and NECO past papers — not generated or paraphrased.', accent: '#2D3CE6', bg: '#EEF0FE' },
  { title: 'Topic-level analysis', desc: 'See your score for each topic, not just an overall percentage. Know exactly where the gaps are.', accent: '#22C55E', bg: '#DCFCE7' },
  { title: 'Ranked recommendations', desc: 'We identify which topics you should study first, ranked by how much they cost you.', accent: '#F59E0B', bg: '#FEF3C7' },
  { title: 'Shareable results', desc: 'Send your result link to anyone. No login required to view it.', accent: '#8B5CF6', bg: '#F5F3FF' },
  { title: 'No account needed', desc: 'Enter your name and start. No email, no password, no friction.', accent: '#2D3CE6', bg: '#EEF0FE' },
  { title: 'Built for mobile', desc: 'Designed to work on budget Android phones on a slow connection.', accent: '#64748B', bg: '#F1F5F9' },
]

const EXAMS = [
  { id: 'JAMB', name: 'Joint Admissions & Matriculation Board', color: '#2D3CE6', bg: '#EEF0FE', desc: 'The university entrance exam sat by over a million Nigerian students every year.', status: 'available' },
  { id: 'WAEC', name: 'West African Examinations Council',       color: '#94A3B8', bg: '#F8FAFC', desc: 'WAEC past questions and analysis — coming soon.', status: 'coming-soon' },
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
      setTimeout(() => { window.location.href = `/community/${room}` }, 1200)
    } catch { setPostErr('Network error. Please try again.') }
    finally { setPosting(false) }
  }

  const roomColors = { jamb: '#2D3CE6', waec: '#16A34A', neco: '#D97706' }
  const roomBgs    = { jamb: '#EEF0FE', waec: '#DCFCE7', neco: '#FEF3C7' }

  return (
    <section id="community" style={{ background: '#F5F7FF', padding: '100px 24px' }}>
      <div style={mw}>
        <Reveal>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2D3CE6', marginBottom: 12 }}>Community</p>
          <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(26px,4.5vw,40px)', fontWeight: 900, color: '#0A0A0A', lineHeight: 1.08, letterSpacing: '-0.5px', margin: '0 0 12px' }}>
            Students helping students
          </h2>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, color: '#52525B', marginBottom: 32, maxWidth: 480 }}>
            Connect with thousands preparing for JAMB and WAEC. Share tips, ask questions, see how others are doing.
          </p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,440px),1fr))', gap: 24, alignItems: 'start' }}>
          {/* Room cards + recent feed */}
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {['jamb','waec'].map(r => (
                <Link key={r} href={`/community/${r}`}
                  style={{ flex: 1, textAlign: 'center', padding: '12px 0', border: `1.5px solid ${roomColors[r]}33`, borderRadius: 12, background: '#fff', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 15, color: roomColors[r], textDecoration: 'none', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = roomBgs[r] }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
                  {r.toUpperCase()} ›
                </Link>
              ))}
            </div>

            {feed.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#64748B', margin: 0 }}>💬 Recent posts</p>
                </div>
                {feed.map((post, i) => (
                  <div key={post.id} style={{ padding: '12px 16px', borderBottom: i < feed.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#0A0A0A' }}>{post.display_name}</span>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#94A3B8' }}>{formatTimeAgo(post.created_at)}</span>
                    </div>
                    <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>
                      {post.content.slice(0, 100)}{post.content.length > 100 ? '…' : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Link href="/community"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: '#2D3CE6', textDecoration: 'none' }}>
              Join the conversation →
            </Link>
          </div>

          {/* Mini post composer */}
          <div style={{ background: '#fff', border: '1.5px solid #DDE2FF', borderRadius: 14, padding: 24 }}>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 16, color: '#0A0A0A', marginBottom: 16 }}>
              What's on your mind about your exam prep?
            </p>
            {postDone ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 24, marginBottom: 8 }}>🎉</p>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: '#15803D' }}>Posted! Redirecting to community…</p>
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
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#64748B', flexShrink: 0 }}>Posting to:</span>
                  <select value={room} onChange={e => setRoom(e.target.value)}
                    style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', outline: 'none', background: '#fff', cursor: 'pointer' }}>
                    <option value="jamb">JAMB</option>
                    <option value="waec">WAEC</option>
                  </select>
                  <input value={name} onChange={e => setName(e.target.value.slice(0, 40))} placeholder="Name (optional)"
                    style={{ flex: 1, minWidth: 120, fontFamily: 'Nunito, sans-serif', fontSize: 13, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', outline: 'none' }}/>
                </div>
                {postErr && <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#DC2626', marginBottom: 8 }}>{postErr}</p>}
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

// ─── Main page ────────────────────────────────────────────────
export default function LandingPage() {
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [sessions, setSessions] = useState([])
  useEffect(() => {
    getSessions().then(setSessions).catch(() => {})
    fetch('/api/subjects')
      .then(r => r.json())
      .then(d => setAvailableSubjects(d.subjects || []))
      .catch(() => {})
  }, [])

  const mw = { maxWidth: 1120, margin: '0 auto', padding: '0 24px' }
  const mwMid = { maxWidth: 880, margin: '0 auto', padding: '0 24px' }
  const label = { fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2D3CE6' }
  const h2 = { fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(26px,4.5vw,40px)', fontWeight: 900, color: '#0A0A0A', lineHeight: 1.08, letterSpacing: '-0.5px', margin: 0 }
  const body = { fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: 1.72, color: '#52525B', margin: 0 }

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', background: '#FAFAFA', minHeight: '100vh', overflowX: 'hidden' }}>
      <Nav />

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section style={{ paddingTop: 120, paddingBottom: 80, background: 'linear-gradient(160deg, #F4F6FF 0%, #FAFAFA 70%)' }}>
        <div style={{ ...mw, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: '48px 72px', alignItems: 'center' }}>

          {/* Left: copy */}
          <div>
            {/* Exam badges */}
            <div style={{ display: 'flex', gap: 7, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, padding: '5px 14px', borderRadius: 99, background: '#EEF0FD', color: '#2D3CE6', border: '1.5px solid #C5CAF6' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6DC77A', boxShadow: '0 0 0 2px rgba(109,199,122,0.3)', animation: 'pulse-dot 2s infinite', display: 'inline-block' }}/>
                JAMB
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 12, padding: '5px 14px', borderRadius: 99, background: '#F8F9FA', color: '#94A3B8', border: '1.5px dashed #CBD5E1' }}>
                WAEC
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: '#94A3B8' }}>Soon</span>
              </span>
            </div>

            {/* Headline — large, editorial, two-colour */}
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 'clamp(38px,6.5vw,60px)', lineHeight: 1.02, letterSpacing: '-1.5px', color: '#0A0A0A', margin: '0 0 2px' }}>Know exactly</p>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 'clamp(38px,6.5vw,60px)', lineHeight: 1.02, letterSpacing: '-1.5px', color: '#2D3CE6', margin: 0 }}>where you stand.</p>
            </div>

            <p style={{ ...body, fontSize: 17, maxWidth: 420, marginBottom: 36 }}>
              Take 40 past questions. Get a personalised topic-by-topic breakdown of exactly where you stand — free, instant, no sign-up.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginBottom: 32 }}>
              <Link href="/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#2D3CE6', color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, padding: '14px 28px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 20px #2D3CE640', letterSpacing: '-0.1px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1e2cc0'}
                onMouseLeave={e => e.currentTarget.style.background = '#2D3CE6'}>
                Start my readiness test
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <a href="#how" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#52525B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                How it works
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>

            {/* Trust tagline — honest, no fake stats */}
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, color: '#71717A', margin: 0 }}>
              Free · No sign-up · Results in minutes
            </p>
          </div>

          {/* Right: illustration */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS — horizontal 3-step
      ══════════════════════════════════════════════════════════ */}
      <section id="how" style={{ background: '#fff', padding: '100px 24px' }}>
        <div style={mwMid}>
          <Reveal>
            <p style={{ ...label, marginBottom: 12 }}>Simple by design</p>
            <h2 style={{ ...h2, marginBottom: 60 }}>Three steps to clarity</h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '40px 48px', position: 'relative' }}>
            {/* Connector line */}
            <div className="hidden md:block" style={{ position: 'absolute', top: 21, left: '17%', right: '17%', height: '1px', borderTop: '2px dashed #DDE2FF' }}/>

            {[
              { n: '01', title: 'Enter your name', desc: 'No account, no password, no email. Your name is enough.' },
              { n: '02', title: 'Choose a subject', desc: 'Pick from 9 subjects. We serve you 40 proportionally distributed past questions.' },
              { n: '03', title: 'Read your breakdown', desc: 'Instant topic-by-topic analysis. Ranked recommendations. Know what to study next.' },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 100}>
                <div style={{ textAlign: 'center', paddingTop: 8 }}>
                  {/* Step number circle */}
                  <div style={{ width: 42, height: 42, borderRadius: 14, background: '#EEF0FE', border: '1.5px solid #DDE2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative', zIndex: 1 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 15, color: '#2D3CE6' }}>{step.n}</span>
                  </div>
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 17, color: '#0A0A0A', marginBottom: 8 }}>{step.title}</p>
                  <p style={{ ...body, fontSize: 14 }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SUBJECTS — grid of cards with SVG icons
      ══════════════════════════════════════════════════════════ */}
      <section id="subjects" style={{ background: '#F5F7FF', padding: '100px 24px' }}>
        <div style={mw}>
          <Reveal>
            <p style={{ ...label, marginBottom: 12 }}>{availableSubjects.length} subject{availableSubjects.length !== 1 ? "s" : ""} available</p>
            <h2 style={{ ...h2, marginBottom: 16 }}>Pick your subject</h2>
            <p style={{ ...body, fontSize: 15, marginBottom: 48, maxWidth: 480 }}>Every subject includes questions from multiple years and all relevant exam types.</p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {availableSubjects.length === 0 && (
              <p style={{ fontSize: 14, color: '#94A3B8', gridColumn: '1 / -1' }}>Loading subjects…</p>
            )}
            {availableSubjects.map((subj, i) => (
              <Reveal key={subj.id} delay={i * 35}>
                <Link href={`/setup?subject=${subj.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 12, padding: '13px 15px', textDecoration: 'none', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#2D3CE6'; e.currentTarget.style.background = '#F5F7FF'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px #2D3CE618' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8EAED'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F5F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <SubjectIcon name={subj.title} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 13.5, color: '#0A0A0A' }}>{subj.title}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES — 2-col grid, no emoji
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '100px 24px' }}>
        <div style={mw}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: '64px 80px', alignItems: 'start' }}>
            {/* Left: copy */}
            <Reveal>
              <p style={{ ...label, marginBottom: 12 }}>What you get</p>
              <h2 style={{ ...h2, marginBottom: 20 }}>Everything you need,<br/>nothing you don't</h2>
              <p style={{ ...body, marginBottom: 36 }}>Learniie Exam Prep is designed for one thing: helping Nigerian students understand exactly where they stand before their exams.</p>
              <Link href="/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0A0A0A', color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, padding: '12px 22px', borderRadius: 9, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2D3CE6'}
                onMouseLeave={e => e.currentTarget.style.background = '#0A0A0A'}>
                Start your free test
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </Reveal>

            {/* Right: feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 60}>
                  <div style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: i < FEATURES.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.accent, flexShrink: 0, marginTop: 6 }}/>
                    <div>
                      <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 15, color: '#0A0A0A', marginBottom: 4 }}>{f.title}</p>
                      <p style={{ ...body, fontSize: 14 }}>{f.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          EXAM TYPES — three cards
      ══════════════════════════════════════════════════════════ */}
      <section id="exams" style={{ background: '#F5F7FF', padding: '100px 24px' }}>
        <div style={mw}>
          <Reveal>
            <p style={{ ...label, marginBottom: 12 }}>Three exams</p>
            <h2 style={{ ...h2, marginBottom: 48 }}>Every major Nigerian exam, covered</h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {EXAMS.map((exam, i) => {
              const isAvailable = exam.status === 'available'
              return (
                <Reveal key={exam.id} delay={i * 80}>
                  <div style={{ background: isAvailable ? '#fff' : '#FAFAFA', borderRadius: 16, border: `1.5px solid ${isAvailable ? exam.color + '22' : '#E2E8F0'}`, padding: '28px 28px 24px', position: 'relative', overflow: 'hidden', opacity: isAvailable ? 1 : 0.7 }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: exam.bg, opacity: 0.7 }}/>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                      <div style={{ display: 'inline-flex', fontWeight: 800, fontSize: 19, color: exam.color, background: exam.bg, padding: '6px 14px', borderRadius: 8, position: 'relative' }}>
                        {exam.id}
                      </div>
                      {isAvailable ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '3px 10px', borderRadius: 99, border: '1px solid #86EFAC' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6DC77A', boxShadow: '0 0 0 2px rgba(109,199,122,0.3)', animation: 'pulse-dot 2s infinite', display: 'inline-block' }}/>
                          Live now
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', background: '#F1F5F9', padding: '3px 10px', borderRadius: 99, border: '1.5px dashed #CBD5E1' }}>
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{exam.name}</p>
                    <p style={{ ...body, fontSize: 14, marginBottom: 22 }}>{exam.desc}</p>
                    {isAvailable ? (
                      <a href="/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#2D3CE6', color: '#fff', fontWeight: 800, fontSize: 13, padding: '9px 18px', borderRadius: 8, textDecoration: 'none' }}>
                        Start JAMB test →
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>Questions coming soon</span>
                    )}
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMMUNITY SECTION
      ══════════════════════════════════════════════════════════ */}
      <CommunitySection mw={mw} />

            {/* ══════════════════════════════════════════════════════════
          CTA BAND — dark
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0D0F2B', padding: '90px 24px' }}>
        <div style={{ ...mwMid, textAlign: 'center' }}>
          <Reveal>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 'clamp(28px,5vw,44px)', color: '#fff', lineHeight: 1.08, letterSpacing: '-0.7px', marginBottom: 16 }}>
              Ready to find out where you stand?
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#6B7DB3', marginBottom: 40 }}>
              Free. No sign-up. Works on any phone.
            </p>
            <Link href="/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fff', color: '#2D3CE6', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, padding: '15px 32px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 32px rgba(0,0,0,0.28)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EEF0FE' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
              Start my test — it's free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#2D3CE6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PAST SESSIONS
      ══════════════════════════════════════════════════════════ */}
      {sessions.length > 0 && (
        <section style={{ background: '#fff', padding: '72px 24px' }}>
          <div style={mwMid}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 22, color: '#0A0A0A', margin: '0 0 4px' }}>Welcome back</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#71717A', margin: 0 }}>Your recent sessions</p>
              </div>
              <button onClick={() => { clearSessions(); setSessions([]) }}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
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
                      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, color: '#0A0A0A', margin: '0 0 3px' }}>{s.studentName}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8', margin: 0 }}>{s.examType} · {s.subject} · {formatDate(s.createdAt)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 20, color: '#0A0A0A', margin: '0 0 4px' }}>{Math.round(s.percentage)}%</p>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: bg, color: fg }}>{r.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#0A0A0A', padding: '60px 24px 32px' }}>
        <div style={mw}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, justifyContent: 'space-between', marginBottom: 56 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <LogoMark size={28} />
                <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 16, color: '#fff' }}>Learniie</span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#52525B', maxWidth: 220, lineHeight: 1.65, margin: '0 0 20px' }}>Free exam readiness testing for every Nigerian student.</p>
              <a href="https://learniie.com" target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#2D3CE6', textDecoration: 'none' }}>
                learniie.com →
              </a>
            </div>
            <div style={{ display: 'flex', gap: 64 }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#3F3F46', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16 }}>Product</p>
                {[['#how','How it works'],['#subjects','Subjects'],['#exams','Exams'],['/community','Community']].map(([h, l]) => (
                  <div key={l} style={{ marginBottom: 11 }}>
                    <a href={h} style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#71717A', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#71717A'}>{l}</a>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#3F3F46', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16 }}>Links</p>
                {[['https://learniie.com','learniie.com']].map(([h, l]) => (
                  <div key={l} style={{ marginBottom: 11 }}>
                    <a href={h} style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#71717A', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#71717A'}>{l}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1E1E1E', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#3F3F46', margin: 0 }}>© 2025 Learniie · Free for all students</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#3F3F46', margin: 0 }}>Made with care for Nigerian students</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
