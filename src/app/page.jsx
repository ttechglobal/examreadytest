'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getSessions, clearSessions } from '@/lib/storage/sessions'
import { getReadiness } from '@/lib/utils/constants'

// ─── Design tokens ─────────────────────────────────────────────
// Navy + Vivid Blue + Achievement Green + Coral Pop
// Inspired by: Duolingo confidence, Khan clarity, Quizlet energy
const C = {
  brand:    '#1A2B5E',  // deep navy — authority, trust
  cta:      '#1D6FEF',  // vivid blue — primary action
  ctaDk:    '#1558CC',
  ctaLt:    '#EBF2FE',
  green:    '#19A96B',  // achievement green — success, growth
  greenLt:  '#E8FAF2',
  greenDk:  '#0E8653',
  pop:      '#FF6B35',  // coral-orange — energy, reward
  popLt:    '#FFF0EB',
  violet:   '#7C3AED',
  violetLt: '#F5F3FF',
  ink:      '#0F172A',
  ink2:     '#1E293B',
  muted:    '#64748B',
  faint:    '#94A3B8',
  border:   '#E2E8F0',
  surface:  '#F8FAFF',  // cool blue-white — academic feel
  white:    '#FFFFFF',
}

// ─── Logo ─────────────────────────────────────────────────────
export function AppLogo({ size = 30, dark = false }) {
  const bg = dark ? '#fff' : C.brand
  const fg = dark ? C.brand : C.green
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <rect width="38" height="38" rx="10" fill={bg}/>
      <path d="M19 11v16" stroke={fg} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M19 12C15 12 9 14 9 19s6 7 10 7" stroke={dark ? C.brand : 'white'} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8"/>
      <path d="M19 12c4 0 10 2 10 7s-6 7-10 7" stroke={fg} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M14 23l5-4 5 4" stroke={dark ? C.brand : 'white'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.45"/>
    </svg>
  )
}

// ─── Scroll-reveal hook ────────────────────────────────────────
function useReveal() {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); io.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return [ref, v]
}
function Reveal({ children, delay = 0 }) {
  const [ref, v] = useReveal()
  return (
    <div ref={ref} style={{
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      opacity: v ? 1 : 0,
      transform: v ? 'translateY(0)' : 'translateY(22px)',
    }}>{children}</div>
  )
}

// ─── Navigation ────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const nb = scrolled ? 'rgba(248,250,255,0.97)' : 'transparent'
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: nb, backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
      transition: 'all 0.3s' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AppLogo size={30}/>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
            color: C.ink, letterSpacing: '-0.3px' }}>ExamReady</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-desk" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {[['/community','Community']].map(([h,l]) => (
            <a key={l} href={h} style={{ fontSize: 14, fontWeight: 600, color: C.muted,
              textDecoration: 'none', padding: '8px 14px', borderRadius: 9, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.ink; e.currentTarget.style.background = C.ctaLt }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'none' }}>{l}</a>
          ))}
          <Link href="/schools" style={{ fontSize: 14, fontWeight: 600, color: C.muted,
            textDecoration: 'none', padding: '8px 14px', borderRadius: 9, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = C.greenDk; e.currentTarget.style.background = C.greenLt }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'none' }}>
            For schools
          </Link>
          <Link href="/setup" style={{ marginLeft: 8, fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 14, color: '#fff', background: C.cta, padding: '10px 22px', borderRadius: 10,
            textDecoration: 'none', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.ctaDk; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.cta; e.currentTarget.style.transform = 'none' }}>
            Start practising →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(o => !o)} className="nav-mob"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: C.ink }}>
          {open
            ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>}
        </button>
      </div>

      {open && (
        <div className="nav-mob" style={{ background: C.white, borderTop: `1px solid ${C.border}`,
          padding: '12px 24px 24px' }}>
          {[['/community','Community'],['/schools','For schools']].map(([h,l]) => (
            <a key={l} href={h} onClick={() => setOpen(false)} style={{ display: 'block',
              fontSize: 16, fontWeight: 600, color: C.ink2, textDecoration: 'none',
              padding: '13px 0', borderBottom: `1px solid ${C.border}` }}>{l}</a>
          ))}
          <Link href="/setup" onClick={() => setOpen(false)} style={{ display: 'block',
            marginTop: 16, textAlign: 'center', fontSize: 16, fontFamily: 'var(--font-display)',
            fontWeight: 700, color: '#fff', background: C.cta, padding: '14px 0',
            borderRadius: 10, textDecoration: 'none' }}>
            Start practising →
          </Link>
        </div>
      )}
      <style>{`@media(min-width:640px){.nav-mob{display:none!important}.nav-desk{display:flex!important}}@media(max-width:639px){.nav-desk{display:none!important}.nav-mob{display:block!important}}`}</style>
    </nav>
  )
}

// ─── Hero illustration ─────────────────────────────────────────
function HeroIllustration() {
  return (
    <div style={{ width: '100%', maxWidth: 500, position: 'relative' }}>
      <style>{`
        .hi-a{animation:hi-fa 5.5s ease-in-out infinite}
        .hi-b{animation:hi-fb 7s ease-in-out infinite 0.9s}
        .hi-c{animation:hi-fc 5.2s ease-in-out infinite 1.7s}
        .hi-d{animation:hi-fa 4s ease-in-out infinite 0.5s}
        @keyframes hi-fa{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes hi-fb{0%,100%{transform:translateY(0)rotate(-1deg)}50%{transform:translateY(-8px)rotate(1.5deg)}}
        @keyframes hi-fc{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
      `}</style>
      <svg viewBox="0 0 500 500" fill="none" style={{ width: '100%', display: 'block' }}>
        <defs>
          <filter id="sh1"><feDropShadow dx="0" dy="10" stdDeviation="20" floodColor="#1A2B5E16"/></filter>
          <filter id="sh2"><feDropShadow dx="0" dy="5" stdDeviation="12" floodColor="#1A2B5E0D"/></filter>
          <pattern id="dot-bg" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1.2" fill="#1D6FEF" opacity="0.07"/>
          </pattern>
        </defs>

        {/* Subtle dot background */}
        <circle cx="250" cy="250" r="220" fill="url(#dot-bg)"/>
        <circle cx="250" cy="250" r="180" fill={C.surface} opacity="0.6"/>

        {/* ── Question card ── */}
        <g className="hi-a" filter="url(#sh1)">
          <rect x="30" y="55" width="272" height="214" rx="18" fill="white"/>
          <rect x="30" y="55" width="272" height="50" rx="18" fill={C.brand}/>
          <rect x="30" y="87" width="272" height="18" fill={C.brand}/>
          <text x="166" y="80" textAnchor="middle" fill={C.green} fontSize="8" fontWeight="800" fontFamily="Nunito" letterSpacing="2">PHYSICS · WAEC</text>
          <text x="52" y="125" fill={C.ink} fontSize="9.5" fontWeight="700" fontFamily="Nunito">Which wave requires a medium</text>
          <text x="52" y="140" fill={C.ink} fontSize="9.5" fontWeight="700" fontFamily="Nunito">to propagate?</text>
          {[
            ['A','Electromagnetic waves',false,161],
            ['B','Longitudinal waves',   true, 182],
            ['C','Transverse waves',     false,203],
            ['D','Radio waves',          false,224],
          ].map(([l,t,sel,y]) => (
            <g key={l}>
              <rect x="48" y={y-12} width="234" height="18" rx="9" fill={sel ? C.cta : '#F8FAFC'}/>
              <rect x="51" y={y-10} width="14" height="14" rx="7" fill={sel ? 'rgba(255,255,255,0.2)' : C.border}/>
              <text x="58" y={y+1} textAnchor="middle" fill={sel ? '#fff' : C.faint} fontSize="6.5" fontWeight="800" fontFamily="Nunito">{l}</text>
              <text x="73" y={y+1.5} fill={sel ? '#fff' : '#475569'} fontSize="8" fontFamily="Nunito" fontWeight={sel?'700':'500'}>{t}</text>
              {sel && (
                <g>
                  <circle cx="271" cy={y-3} r="7" fill={C.green}/>
                  <text x="271" y={y+1} textAnchor="middle" fill="white" fontSize="8" fontWeight="900">✓</text>
                </g>
              )}
            </g>
          ))}
        </g>

        {/* ── Score ring card ── */}
        <g className="hi-b" filter="url(#sh1)">
          <rect x="282" y="42" width="176" height="168" rx="18" fill="white"/>
          <rect x="282" y="42" width="176" height="46" rx="18" fill={C.brand}/>
          <rect x="282" y="70" width="176" height="18" fill={C.brand}/>
          <text x="370" y="66" textAnchor="middle" fill={C.green} fontSize="7.5" fontWeight="800" fontFamily="Nunito" letterSpacing="1.2">YOUR SCORE</text>
          {/* Ring */}
          <circle cx="370" cy="142" r="40" fill="none" stroke="#F1F5F9" strokeWidth="7"/>
          <circle cx="370" cy="142" r="40" fill="none" stroke={C.green} strokeWidth="7"
            strokeLinecap="round" strokeDasharray="251" strokeDashoffset="75"
            style={{ transformOrigin:'370px 142px', transform:'rotate(-90deg)' }}/>
          <text x="370" y="138" textAnchor="middle" fill={C.ink} fontSize="21" fontWeight="900" fontFamily="Nunito">74%</text>
          <text x="370" y="152" textAnchor="middle" fill={C.faint} fontSize="7" fontWeight="700" fontFamily="Nunito" letterSpacing="0.5">SCORE</text>
          {/* Badge */}
          <rect x="322" y="172" width="96" height="18" rx="9" fill={C.greenLt}/>
          <text x="370" y="185" textAnchor="middle" fill={C.greenDk} fontSize="7.5" fontWeight="800" fontFamily="Nunito">Almost Ready 🎯</text>
        </g>

        {/* ── Topic breakdown card ── */}
        <g className="hi-c" filter="url(#sh2)">
          <rect x="22" y="292" width="212" height="170" rx="16" fill="white"/>
          <text x="42" y="320" fill={C.ink} fontSize="10.5" fontWeight="800" fontFamily="Nunito">Topic breakdown</text>
          {[
            ['Mechanics',      82, 130, C.green,  340],
            ['Waves',          61,  96, C.cta,    364],
            ['Thermodynamics', 45,  71, C.pop,    388],
            ['Electricity',    22,  35, '#EF4444',412],
          ].map(([topic, pct, w, col, y]) => (
            <g key={topic}>
              <text x="42" y={y-5} fill="#475569" fontSize="7.5" fontWeight="600" fontFamily="Nunito">{topic}</text>
              <rect x="42" y={y} width="148" height="5" rx="2.5" fill="#F1F5F9"/>
              <rect x="42" y={y} width={w}   height="5" rx="2.5" fill={col}/>
              <text x="196" y={y+4} fill={C.ink} fontSize="7.5" fontWeight="800" fontFamily="Nunito">{pct}%</text>
            </g>
          ))}
        </g>

        {/* ── Exam badges ── */}
        <g className="hi-d" style={{ animation:'hi-fa 4.2s ease-in-out infinite 0.3s' }}>
          <rect x="14" y="224" width="56" height="28" rx="14" fill={C.brand}/>
          <text x="42" y="242" textAnchor="middle" fill={C.green} fontSize="9.5" fontWeight="800" fontFamily="Nunito">JAMB</text>
        </g>
        <g style={{ animation:'hi-fb 4.8s ease-in-out infinite 1.1s' }}>
          <rect x="398" y="244" width="62" height="28" rx="14" fill="#16A34A"/>
          <text x="429" y="262" textAnchor="middle" fill="white" fontSize="9.5" fontWeight="800" fontFamily="Nunito">WAEC</text>
        </g>

            </svg>
    </div>
  )
}

// ─── Data ──────────────────────────────────────────────────────

const BENEFITS = [
  {
    emoji: '📝', color: C.cta, bg: C.ctaLt,
    headline: 'Practice with real past exam questions',
    body: 'Every question is an actual past exam question. Same topics, same style, same difficulty as the real thing — so exam day holds no surprises.',
  },
  {
    emoji: '💡', color: C.green, bg: C.greenLt,
    headline: 'Understand every answer — not just memorise it',
    body: 'Each question includes a clear, step-by-step explanation. You will understand why the correct answer is right — so you can apply it again in the exam.',
  },
  {
    emoji: '🎯', color: C.pop, bg: C.popLt,
    headline: 'See exactly which topics to focus on',
    body: 'After every test, get a full topic breakdown. See exactly where you lost marks and what to revise before exam day.',
  },
  {
    emoji: '🔄', color: C.violet, bg: C.violetLt,
    headline: 'Study mode: keep trying until it clicks',
    body: 'Pick the wrong answer? Get a targeted hint. Try again. Get it right, then see the full explanation. This is active learning — not passive reading.',
  },
  {
    emoji: '⚡', color: C.cta, bg: C.ctaLt,
    headline: 'No account needed — start in seconds',
    body: 'Type your name, pick your subject, and start answering. No sign-up, no passwords, no wasted time. You are one tap away from practising.',
  },
  {
    emoji: '📈', color: C.green, bg: C.greenLt,
    headline: 'Track how your readiness improves over time',
    body: 'Every session is saved on your device. Come back tomorrow, see your progress, and keep building confidence before the big day.',
  },
]

const STEPS = [
  {
    n: '1', color: C.cta, bg: C.ctaLt,
    title: 'Choose your subject',
    body: 'Physics, Maths, Chemistry, Biology, English, Government and more. Pick whatever exam you are preparing for.',
  },
  {
    n: '2', color: C.green, bg: C.greenLt,
    title: 'Answer 40 real past questions',
    body: 'Work through actual exam questions in exam conditions — 30 minutes, same format and pressure as the real test.',
  },
  {
    n: '3', color: C.pop, bg: C.popLt,
    title: 'Get your full exam readiness report',
    body: 'See your score and a topic-by-topic breakdown. Know your strong areas and exactly what to revise next.',
  },
]

const PROOF = [
  { value: '10,000+', label: 'Practice tests taken' },
  { value: '157+',    label: 'Real past questions' },
  { value: 'Instant', label: 'Feedback per question' },
  { value: 'Zero',    label: 'Sign-up required' },
]

// ─── Community section ─────────────────────────────────────────
function CommunitySection() {
  const [feed, setFeed] = useState([])
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [room, setRoom] = useState('jamb')
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)
  useEffect(() => {
    fetch('/api/community/feed').then(r => r.json()).then(d => setFeed((d.posts || []).slice(0,3))).catch(() => {})
  }, [])
  async function handlePost(e) {
    e.preventDefault()
    if (!message.trim()) return
    setPosting(true)
    try {
      const res = await fetch(`/api/community/${room}/posts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name || 'Anonymous', content: message, postType: 'general' })
      })
      if (res.ok) { setPosted(true); setMessage(''); setTimeout(() => { window.location.href = `/community/${room}` }, 900) }
    } catch {} finally { setPosting(false) }
  }
  const inp = {
    border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 10,
    padding: '11px 14px', fontFamily: 'Nunito, sans-serif', fontSize: 14,
    outline: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff',
    transition: 'border-color 0.15s', boxSizing: 'border-box', width: '100%'
  }
  return (
    <section style={{ background: C.brand, padding: 'clamp(72px,8vw,96px) 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '28px 28px', pointerEvents: 'none' }}/>

      <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative' }}>
        <Reveal>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(25,169,107,0.15)', border: `1px solid ${C.green}44`, borderRadius: 99, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>💬</span>
            <span style={{ fontWeight: 700, fontSize: 11, color: C.green, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Study Community</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px,4vw,40px)', color: '#fff', letterSpacing: '-0.5px', marginBottom: 14, lineHeight: 1.2 }}>
            Don't prepare alone.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.52)', maxWidth: 460, marginBottom: 48, lineHeight: 1.75 }}>
            Thousands of students sharing tips, asking questions, and getting ready together. Your study community is already here.
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 24 }}>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[['/community/jamb','JAMB',C.cta],['/community/waec','WAEC','#16A34A']].map(([href,label,color]) => (
                <Link key={label} href={href} style={{ padding: '14px 16px', border: `1.5px solid ${color}44`, borderRadius: 12, background: `${color}10`, textDecoration: 'none', transition: 'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.background=`${color}1E`; e.currentTarget.style.borderColor=`${color}77` }}
                  onMouseLeave={e => { e.currentTarget.style.background=`${color}10`; e.currentTarget.style.borderColor=`${color}44` }}>
                  <p style={{ fontWeight: 800, fontSize: 13, color, margin: '0 0 3px' }}>{label} Community</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)', margin: 0 }}>Join the conversation →</p>
                </Link>
              ))}
            </div>
            {feed.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
                {feed.map((post, i) => (
                  <div key={post.id} style={{ padding: '13px 16px', borderBottom: i < feed.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <p style={{ fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>{post.display_name}</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.74)', lineHeight: 1.6, margin: 0 }}>{post.content?.slice(0,110)}{post.content?.length > 110 ? '…' : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${C.green}44`, borderRadius: 16, padding: 24 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 4 }}>What's on your mind?</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.44)', marginBottom: 18 }}>Post anonymously — no account needed</p>
            {posted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: 32, marginBottom: 10 }}>✨</p>
                <p style={{ fontWeight: 700, fontSize: 14, color: C.green }}>Posted! Taking you there…</p>
              </div>
            ) : (
              <form onSubmit={handlePost}>
                <textarea value={message} onChange={e => setMessage(e.target.value.slice(0,500))}
                  placeholder="Share a tip, ask a question…" rows={3}
                  style={{ ...inp, resize:'none', marginBottom:12, lineHeight:1.6 }}
                  onFocus={e => e.target.style.borderColor=`${C.green}77`}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.14)'}/>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <select value={room} onChange={e => setRoom(e.target.value)} style={{ ...inp, width:'auto', cursor:'pointer' }}>
                    <option value="jamb">JAMB</option><option value="waec">WAEC</option>
                  </select>
                  <input value={name} onChange={e => setName(e.target.value.slice(0,40))}
                    placeholder="Your name (optional)" style={{ ...inp, flex:1 }}
                    onFocus={e => e.target.style.borderColor=`${C.cta}77`}
                    onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.14)'}/>
                </div>
                <button type="submit" disabled={!message.trim() || posting}
                  style={{ width:'100%', padding:'13px 0', border:'none', borderRadius:10,
                    background: message.trim() ? C.green : 'rgba(255,255,255,0.07)',
                    color: message.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
                    fontFamily:'var(--font-display)', fontWeight:700, fontSize:14,
                    cursor: message.trim() ? 'pointer' : 'not-allowed', transition:'all 0.15s' }}>
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

// ─── Past sessions ─────────────────────────────────────────────
function PastSessions({ sessions, onClear }) {
  if (!sessions.length) return null
  return (
    <section style={{ background: C.white, padding: '56px 24px', borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: C.ink, margin: '0 0 3px' }}>Welcome back 👋</p>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Pick up where you left off</p>
          </div>
          <button onClick={onClear} style={{ fontSize: 13, color: C.faint, background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.slice(0,3).map(s => {
            const r = getReadiness(s.percentage)
            const badge = { green:[C.greenLt,C.greenDk], blue:[C.ctaLt,C.cta], amber:['#FFF7ED','#D97706'], red:['#FEE2E2','#DC2626'] }
            const [bg,fg] = badge[r.color] || badge.blue
            return (
              <Link key={s.shareToken} href={`/results/${s.shareToken}`}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  background: C.surface, border: `1.5px solid ${C.border}`, borderRadius:14,
                  padding:'14px 18px', textDecoration:'none', transition:'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=C.cta; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(29,111,239,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:14, color:C.ink, margin:'0 0 3px', textTransform:'capitalize' }}>{s.subject} · {s.examType}</p>
                  <p style={{ fontSize:12, color:C.muted, margin:0 }}>{s.score!=null&&s.totalQuestions!=null ? `${s.score}/${s.totalQuestions} correct` : 'View results'}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:12, fontWeight:800, padding:'3px 12px', borderRadius:99, background:bg, color:fg }}>{Math.round(s.percentage)}%</span>
                  <span style={{ fontSize:12, color:C.faint }}>→</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Main page ─────────────────────────────────────────────────
export default function LandingPage() {
  const [sessions, setSessions] = useState([])
  useEffect(() => { getSessions().then(setSessions).catch(() => {}) }, [])

  return (
    <div style={{ fontFamily: 'Nunito, var(--font-nunito), sans-serif', background: C.surface, minHeight: '100vh', overflowX: 'hidden' }}>
      <Nav/>

      {/* ─────────────────── HERO ──────────────────────────── */}
      <section style={{ background: C.surface, paddingTop: 64, position: 'relative', overflow: 'hidden' }}>
        {/* Dot grid — academic texture */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 1px 1px, #1A2B5E0C 1px, transparent 0)', backgroundSize:'24px 24px', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1160, margin:'0 auto', padding:'clamp(56px,8vw,88px) 24px clamp(64px,9vw,96px)',
          display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,340px),1fr))',
          gap:'clamp(40px,6vw,80px)', alignItems:'center', position:'relative', zIndex:1 }}>

          {/* ── Copy ── */}
          <div>
            {/* Overline */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.ctaLt,
              border:`1px solid ${C.cta}33`, borderRadius:99, padding:'6px 14px', marginBottom:28,
              animation:'reveal-up 0.5s ease both' }}>
              <span style={{ fontSize:14 }}>🎓</span>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12,
                color:C.cta, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                JAMB · WAEC · BECE · Exam Prep
              </span>
            </div>

            {/* H1 — passes the 10-second test */}
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800,
              fontSize:'clamp(36px,5.5vw,58px)', lineHeight:1.12, letterSpacing:'-1px',
              color:C.ink, marginBottom:22, animation:'reveal-up 0.5s ease 80ms both' }}>
              Practice past questions.<br/>
              <span style={{ color:C.cta }}>Understand every answer.</span><br/>
              <span style={{ color:C.green }}>Walk in ready.</span>
            </h1>

            {/* Subheadline */}
            <p style={{ fontSize:'clamp(15px,2vw,17px)', color:C.muted, lineHeight:1.8,
              maxWidth:460, marginBottom:38, animation:'reveal-up 0.5s ease 160ms both' }}>
              ExamReady gives you real past exam questions, instant feedback, and clear
              explanations — so you understand the material, not just memorise answers.
            </p>

            {/* CTAs */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center',
              marginBottom:32, animation:'reveal-up 0.5s ease 240ms both' }}>
              <Link href="/setup"
                style={{ display:'inline-flex', alignItems:'center', gap:8,
                  fontFamily:'var(--font-display)', fontSize:15, fontWeight:700,
                  background:C.cta, color:'#fff', padding:'15px 30px', borderRadius:12,
                  textDecoration:'none',
                  transition:'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.background=C.ctaDk; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='none' }}
                onMouseLeave={e => { e.currentTarget.style.background=C.cta; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
                Start practising now
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link href="/schools" style={{ fontSize:14, fontWeight:600, color:C.muted,
                textDecoration:'none', transition:'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color=C.greenDk}
                onMouseLeave={e => e.currentTarget.style.color=C.muted}>
                For schools & tutors →
              </Link>
            </div>

            {/* Live exam badges */}
            <div style={{ display:'flex', gap:14, flexWrap:'wrap',
              animation:'reveal-up 0.5s ease 320ms both' }}>
              {[['JAMB',C.cta],['WAEC','#16A34A'],['BECE','#7C3AED']].map(([exam,color]) => (
                <span key={exam} style={{ display:'inline-flex', alignItems:'center', gap:7,
                  fontSize:13, fontWeight:700, color:C.ink2 }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:color }}/>{exam} · Live
                </span>
              ))}
              <span style={{ fontSize:13, color:C.faint, fontWeight:500 }}>No sign-up needed</span>
            </div>
          </div>

          {/* ── Illustration ── */}
          <div style={{ display:'flex', justifyContent:'center', animation:'reveal-fade 0.7s ease 200ms both' }}>
            <HeroIllustration/>
          </div>
        </div>
      </section>

      {/* ─────────────────── PROOF STRIP ─────────────────────── */}
      <section style={{ background:C.brand, padding:'clamp(22px,3.5vw,30px) 24px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,160px),1fr))', gap:0 }}>
          {PROOF.map((p,i) => (
            <div key={p.label} style={{ textAlign:'center', padding:'10px 16px',
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <p style={{ fontFamily:'var(--font-display)', fontWeight:800,
                fontSize:'clamp(20px,3vw,28px)', color:C.green, margin:'0 0 4px',
                letterSpacing:'-0.4px' }}>{p.value}</p>
              <p style={{ fontWeight:600, fontSize:11, color:'rgba(255,255,255,0.44)',
                margin:0, textTransform:'uppercase', letterSpacing:'0.08em' }}>{p.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────── THREE STEPS (compact) ─────────────────── */}
      <section style={{ background:C.white, padding:'clamp(48px,6vw,64px) 24px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:960, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,280px),1fr))', gap:32 }}>
          {[
            { n:'01', color:C.cta,   title:'Pick a subject & start answering',    body:'No account, no setup. Choose your exam and subject, type your name, and go. Under 30 seconds.' },
            { n:'02', color:C.green, title:'Get feedback on every single answer',  body:'Right or wrong — you see exactly why immediately. Step-by-step explanations, not just "B is correct."' },
            { n:'03', color:C.pop,   title:'See your topic-by-topic report',        body:'After 40 questions, get a full breakdown of every topic. Know your strengths and exactly where to focus next.' },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 70}>
              <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
                <div style={{ flexShrink:0, width:36, height:36, borderRadius:9, background:s.color,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, color:'#fff' }}>{s.n}</span>
                </div>
                <div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:C.ink, marginBottom:6, lineHeight:1.3 }}>{s.title}</h3>
                  <p style={{ fontSize:14, color:C.muted, lineHeight:1.7, margin:0 }}>{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─────────────────── BENEFITS ────────────────────────── */}
      <section style={{ background:C.surface, padding:'clamp(72px,8vw,96px) 24px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <Reveal>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.greenLt,
              borderRadius:99, padding:'5px 14px', marginBottom:20 }}>
              <span style={{ fontSize:13 }}>✨</span>
              <span style={{ fontWeight:700, fontSize:11, color:C.greenDk,
                textTransform:'uppercase', letterSpacing:'0.1em' }}>What you get</span>
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800,
              fontSize:'clamp(26px,4vw,38px)', color:C.ink, letterSpacing:'-0.5px',
              marginBottom:12, lineHeight:1.2, maxWidth:540 }}>
              Not just practice — preparation that actually works.
            </h2>
            <p style={{ fontSize:16, color:C.muted, maxWidth:440, margin:'0 0 52px',
              lineHeight:1.75 }}>
              The difference between students who pass and students who get the grade they want
              is understanding — not just time spent studying.
            </p>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,310px),1fr))', gap:16 }}>
            {BENEFITS.map((b,i) => (
              <Reveal key={b.headline} delay={i*45}>
                <div style={{ background:C.white, border:`1.5px solid ${C.border}`,
                  borderRadius:18, padding:'26px 22px', height:'100%', boxSizing:'border-box',
                  transition:'all 0.22s', cursor:'default', position:'relative', overflow:'hidden' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor=b.color+'55' }}
                  onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor=C.border }}>
                  {/* Top accent stripe */}
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:3,
                    background:b.color, borderRadius:'18px 18px 0 0' }}/>
                  {/* Icon box */}
                  <div style={{ width:46, height:46, borderRadius:13, background:b.bg,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    marginBottom:16, fontSize:22 }}>{b.emoji}</div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16,
                    color:C.ink, marginBottom:10, lineHeight:1.35 }}>{b.headline}</h3>
                  <p style={{ fontSize:14, color:C.muted, lineHeight:1.75, margin:0 }}>{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── SCHOOLS CALLOUT ─────────────────── */}
      <section style={{ background:C.white, padding:'clamp(56px,7vw,80px) 24px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <Reveal>
            <div style={{ background:C.brand, borderRadius:24,
              padding:'clamp(32px,5vw,52px)', position:'relative', overflow:'hidden',
              display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,280px),1fr))',
              gap:36, alignItems:'center' }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize:'24px 24px', pointerEvents:'none', borderRadius:24 }}/>


              <div style={{ position:'relative' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8,
                  background:`${C.green}18`, border:`1px solid ${C.green}44`,
                  borderRadius:99, padding:'5px 14px', marginBottom:20 }}>
                  <span style={{ fontSize:14 }}>🏫</span>
                  <span style={{ fontWeight:700, fontSize:11, color:C.green,
                    textTransform:'uppercase', letterSpacing:'0.1em' }}>For schools & tutorial centres</span>
                </div>
                <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800,
                  fontSize:'clamp(20px,3.5vw,32px)', color:'#fff', lineHeight:1.2,
                  letterSpacing:'-0.5px', marginBottom:14 }}>
                  Know exactly where your students need help — before exam day.
                </h2>
                <p style={{ fontSize:15, color:'rgba(255,255,255,0.52)', lineHeight:1.8, marginBottom:0 }}>
                  Real-time performance data, topic-level breakdowns, and one-click reports for tutors and parents.
                </p>
              </div>

              <div style={{ position:'relative', display:'flex', flexDirection:'column', gap:16 }}>
                {[
                  ['📊', "See every student's score and topic gaps"],
                  ['🎯', 'Spot which topics the whole class is struggling with'],
                  ['📄', 'Share detailed reports with tutors and parents'],
                  ['⚡', 'Students join in 60 seconds — one link, no accounts'],
                ].map(([emoji,text]) => (
                  <div key={text} style={{ display:'flex', alignItems:'flex-start', gap:13 }}>
                    <span style={{ fontSize:18, flexShrink:0, marginTop:1 }}>{emoji}</span>
                    <span style={{ fontSize:14, color:'rgba(255,255,255,0.75)', fontWeight:600, lineHeight:1.5 }}>{text}</span>
                  </div>
                ))}
                <div style={{ marginTop:8 }}>
                  <Link href="/schools" style={{ display:'inline-flex', alignItems:'center', gap:8,
                    fontFamily:'var(--font-display)', fontSize:14, fontWeight:700,
                    background:C.green, color:'#fff', padding:'12px 24px', borderRadius:10,
                    textDecoration:'none', transition:'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.background=C.greenDk; e.currentTarget.style.transform='translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background=C.green; e.currentTarget.style.transform='none' }}>
                    Learn more about Schools →
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────── COMMUNITY ───────────────────────── */}
      <CommunitySection/>

      {/* ─────────────────── FINAL CTA ───────────────────────── */}
      <section style={{ background:C.surface, padding:'clamp(72px,8vw,96px) 24px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:580, margin:'0 auto', textAlign:'center' }}>
          <Reveal>
            <div style={{ fontSize:56, lineHeight:1, marginBottom:4 }}>📚</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800,
              fontSize:'clamp(26px,5vw,42px)', color:C.ink, lineHeight:1.15,
              letterSpacing:'-0.6px', marginBottom:16 }}>
              Your exam is coming.<br/>Are you ready?
            </h2>
            <p style={{ fontSize:16, color:C.muted, marginBottom:36, lineHeight:1.75 }}>
              Find out right now. 40 real past questions. Your full topic report. No sign-up.
            </p>
            <Link href="/setup"
              style={{ display:'inline-flex', alignItems:'center', gap:10,
                fontFamily:'var(--font-display)', background:C.cta, color:'#fff',
                fontWeight:700, fontSize:16, padding:'16px 36px', borderRadius:12,
                textDecoration:'none',
                transition:'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.background=C.ctaDk; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='none' }}
              onMouseLeave={e => { e.currentTarget.style.background=C.cta; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
              Start practising now
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <p style={{ fontSize:13, color:C.faint, marginTop:16 }}>
              No account needed · Works on any phone · JAMB · WAEC · BECE
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────── PAST SESSIONS ───────────────────── */}
      <PastSessions sessions={sessions} onClear={() => { clearSessions(); setSessions([]) }}/>

      {/* ─────────────────── FOOTER ──────────────────────────── */}
      <footer style={{ background:C.brand, padding:'clamp(48px,6vw,64px) 24px 28px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,200px),1fr))',
            gap:40, marginBottom:48 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <AppLogo size={28}/>
                <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:15, color:'#fff' }}>ExamReady</span>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.7,
                margin:'0 0 6px', maxWidth:200 }}>
                Practice past questions.<br/>Understand every answer.<br/>Walk in ready.
              </p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.22)', margin:0 }}>
                A <a href="https://learniie.com" target="_blank" rel="noopener noreferrer"
                  style={{ color:C.green, textDecoration:'none' }}>Learniie</a> product
              </p>
            </div>
            {[
              ['Students', [['/setup','Practice now'],['/community','Community'],['/schools','For schools']]],
              ['Schools',  [['/schools','For schools'],['/schools/register','Register'],['/schools/login','Log in']]],
            ].map(([section,links]) => (
              <div key={section}>
                <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.28)',
                  textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:16 }}>{section}</p>
                {links.map(([h,l]) => (
                  <div key={l} style={{ marginBottom:11 }}>
                    <a href={h} style={{ fontSize:13, color:'rgba(255,255,255,0.44)',
                      textDecoration:'none', transition:'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color=C.green}
                      onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.44)'}>{l}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:22,
            display:'flex', justifyContent:'space-between', alignItems:'center',
            flexWrap:'wrap', gap:12 }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.24)', margin:0 }}>
              © 2025 ExamReady · Made for students who want to understand, not just pass
            </p>
            <button onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
              style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.4)',
                background:'none', border:'1px solid rgba(255,255,255,0.12)',
                borderRadius:7, padding:'5px 13px', cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color=C.green; e.currentTarget.style.borderColor=`${C.green}44` }}
              onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)' }}>
              ↑ Top
            </button>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes reveal-up  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        @keyframes reveal-fade { from { opacity:0; } to { opacity:1; } }
      `}</style>
    </div>
  )
}