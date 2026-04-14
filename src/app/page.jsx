'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getSessions, clearSessions } from '@/lib/storage/sessions'
import { formatDate } from '@/lib/utils/format'
import { getReadiness } from '@/lib/utils/constants'

// ─── Logo (consistent across all pages) ───────────────────────
export function AppLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#2D3CE6"/>
      <path d="M8 20V8l6 8 6-8v12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Scroll reveal ─────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}
function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} style={{ transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)' }}>
      {children}
    </div>
  )
}

// ─── Nav ───────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { href: '#features', label: 'Features' },
    { href: '/schools',  label: 'Schools' },
    { href: '/community',label: 'Community' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #E8EAED',
      boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
      transition: 'box-shadow 0.25s',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <AppLogo/>
          <span style={{ fontWeight: 900, fontSize: 15, color: '#0A0A0A', letterSpacing: '-0.2px' }}>Exam Ready Test</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden-mobile">
          {links.map(l => (
            <a key={l.href} href={l.href} style={{ fontSize: 14, fontWeight: 600, color: '#52525B', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#0A0A0A'} onMouseLeave={e => e.target.style.color = '#52525B'}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden-mobile">
          <Link href="/setup" style={{ fontSize: 14, fontWeight: 800, color: '#fff', background: '#2D3CE6', padding: '9px 20px', borderRadius: 9, textDecoration: 'none', letterSpacing: '-0.1px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e2cc0'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2D3CE6'; e.currentTarget.style.transform = 'none' }}>
            Start Test →
          </Link>
        </div>

        {/* Hamburger */}
        <button onClick={() => setOpen(o => !o)} className="show-mobile"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#374151' }}
          aria-label="Menu">
          {open
            ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: '#fff', borderTop: '1px solid #F1F5F9', padding: '16px 20px 20px' }} className="show-mobile">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', textDecoration: 'none', padding: '11px 0', borderBottom: '1px solid #F8FAFC' }}>
              {l.label}
            </a>
          ))}
          <Link href="/setup" onClick={() => setOpen(false)}
            style={{ display: 'block', marginTop: 14, textAlign: 'center', fontSize: 15, fontWeight: 800, color: '#fff', background: '#2D3CE6', padding: '13px 0', borderRadius: 10, textDecoration: 'none' }}>
            Start Test →
          </Link>
        </div>
      )}

      <style>{`
        @media (min-width: 640px) { .hidden-mobile { display: flex !important; } .show-mobile { display: none !important; } }
        @media (max-width: 639px) { .hidden-mobile { display: none !important; } .show-mobile { display: block !important; } }
      `}</style>
    </nav>
  )
}

// ─── Product illustration ──────────────────────────────────────
function Illustration() {
  return (
    <div style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
      <svg viewBox="0 0 480 440" fill="none" style={{ width: '100%', display: 'block' }}>
        <defs>
          <style>{`.fa{animation:floatA 5s ease-in-out infinite}.fb{animation:floatB 6.5s ease-in-out infinite 1s}.fc{animation:floatC 4.8s ease-in-out infinite 0.5s}@keyframes floatA{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes floatC{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
          <filter id="sh"><feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#00000012"/></filter>
        </defs>
        <ellipse cx="240" cy="220" rx="192" ry="178" fill="#EEF0FE" opacity="0.5"/>
        {/* Question card */}
        <g className="fa" filter="url(#sh)">
          <rect x="60" y="50" width="240" height="186" rx="18" fill="white"/>
          <rect x="60" y="50" width="240" height="42" rx="18" fill="#2D3CE6"/>
          <rect x="60" y="74" width="240" height="18" fill="#2D3CE6"/>
          <text x="180" y="76" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9" fontWeight="700" fontFamily="Nunito" letterSpacing="1">PHYSICS · JAMB</text>
          <text x="80" y="118" fill="#0A0A0A" fontSize="9.5" fontWeight="700" fontFamily="Nunito">Which wave requires a medium</text>
          <text x="80" y="132" fill="#0A0A0A" fontSize="9.5" fontWeight="700" fontFamily="Nunito">to propagate?</text>
          {[['A','Electromagnetic',false,152],['B','Longitudinal waves',true,172],['C','Transverse waves',false,192],['D','Radio waves',false,212]].map(([l,t,sel,y]) => (
            <g key={l}>
              <rect x="76" y={y-10} width="206" height="16" rx="8" fill={sel ? '#2D3CE6' : '#F8FAFC'}/>
              <rect x="79" y={y-8} width="12" height="12" rx="6" fill={sel ? 'rgba(255,255,255,0.2)' : '#E2E8F0'}/>
              <text x="84.5" y={y+1} textAnchor="middle" fill={sel ? 'white' : '#94A3B8'} fontSize="6.5" fontWeight="800" fontFamily="Nunito">{l}</text>
              <text x="98" y={y+1} fill={sel ? 'white' : '#52525B'} fontSize="7.5" fontFamily="Nunito" fontWeight={sel ? '700' : '400'}>{t}</text>
            </g>
          ))}
        </g>
        {/* Score card */}
        <g className="fb" filter="url(#sh)">
          <rect x="266" y="38" width="178" height="140" rx="16" fill="white"/>
          <rect x="266" y="38" width="178" height="34" rx="16" fill="#0F172A"/>
          <rect x="266" y="58" width="178" height="14" fill="#0F172A"/>
          <text x="355" y="60" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7.5" fontWeight="700" fontFamily="Nunito" letterSpacing="0.8">YOUR RESULT</text>
          <circle cx="355" cy="125" r="38" fill="none" stroke="#F1F5F9" strokeWidth="7"/>
          <circle cx="355" cy="125" r="38" fill="none" stroke="#2D3CE6" strokeWidth="7" strokeLinecap="round" strokeDasharray="239" strokeDashoffset="72" style={{transformOrigin:'355px 125px',transform:'rotate(-90deg)'}}/>
          <text x="355" y="121" textAnchor="middle" fill="#0A0A0A" fontSize="20" fontWeight="900" fontFamily="Nunito">72%</text>
          <text x="355" y="135" textAnchor="middle" fill="#94A3B8" fontSize="7" fontWeight="700" fontFamily="Nunito" letterSpacing="0.5">SCORE</text>
          <rect x="308" y="155" width="94" height="18" rx="9" fill="#EEF0FE"/>
          <text x="355" y="168" textAnchor="middle" fill="#2D3CE6" fontSize="8" fontWeight="800" fontFamily="Nunito">Almost Ready</text>
        </g>
        {/* Topic card */}
        <g className="fc" filter="url(#sh)">
          <rect x="30" y="254" width="200" height="162" rx="16" fill="white"/>
          <text x="50" y="280" fill="#0A0A0A" fontSize="11" fontWeight="800" fontFamily="Nunito">Topic Breakdown</text>
          {[['Mechanics',85,128,'#22C55E',298],['Waves',62,94,'#2D3CE6',322],['Thermodynamics',43,68,'#F59E0B',346],['Electricity',24,38,'#EF4444',370]].map(([t,p,w,c,y])=>(
            <g key={t}>
              <text x="50" y={y-4} fill="#374151" fontSize="8" fontWeight="600" fontFamily="Nunito">{t}</text>
              <rect x="50" y={y+2} width="140" height="5" rx="2.5" fill="#F1F5F9"/>
              <rect x="50" y={y+2} width={w} height="5" rx="2.5" fill={c}/>
              <text x="198" y={y+7} fill="#0A0A0A" fontSize="7.5" fontWeight="800" fontFamily="Nunito">{p}%</text>
            </g>
          ))}
        </g>
        {/* Exam badges */}
        <g style={{animation:'floatA 4s ease-in-out infinite 1.2s'}}>
          <rect x="24" y="196" width="52" height="26" rx="13" fill="#2D3CE6"/>
          <text x="50" y="213" textAnchor="middle" fill="white" fontSize="10" fontWeight="800" fontFamily="Nunito">JAMB</text>
        </g>
        <g style={{animation:'floatB 4.5s ease-in-out infinite 0.4s'}}>
          <rect x="376" y="206" width="56" height="26" rx="13" fill="#22C55E"/>
          <text x="404" y="223" textAnchor="middle" fill="white" fontSize="10" fontWeight="800" fontFamily="Nunito">WAEC</text>
        </g>
      </svg>
    </div>
  )
}

// ─── Features ──────────────────────────────────────────────────
const FEATURES = [
  { icon: '📝', title: 'Real past questions',        body: 'Actual JAMB and WAEC questions from previous years — not generated or paraphrased.' },
  { icon: '🎯', title: 'Topic-level breakdown',      body: 'See exactly which topics need work, ranked by your performance.' },
  { icon: '💡', title: 'Step-by-step explanations',  body: 'Every answer comes with a full worked explanation so you understand why.' },
  { icon: '📊', title: 'Study recommendations',      body: 'Personalised list of what to revise next, based on your weakest topics.' },
  { icon: '📤', title: 'Shareable results',           body: 'Send your result link to friends, teachers, or parents.' },
  { icon: '⚡', title: 'No account needed',           body: 'Just your name. Start in 10 seconds. Free forever.' },
]

// ─── Community section ─────────────────────────────────────────
function CommunitySection() {
  const [feed, setFeed]       = useState([])
  const [message, setMessage] = useState('')
  const [name, setName]       = useState('')
  const [room, setRoom]       = useState('jamb')
  const [posting, setPosting] = useState(false)
  const [posted, setPosted]   = useState(false)

  useEffect(() => {
    fetch('/api/community/feed').then(r => r.json()).then(d => setFeed((d.posts || []).slice(0, 2))).catch(() => {})
  }, [])

  async function handlePost(e) {
    e.preventDefault()
    if (!message.trim()) return
    setPosting(true)
    try {
      const res = await fetch(`/api/community/${room}/posts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name || 'Anonymous', content: message, postType: 'general' }),
      })
      if (res.ok) { setPosted(true); setMessage(''); setTimeout(() => { window.location.href = `/community/${room}` }, 900) }
    } catch {}
    finally { setPosting(false) }
  }

  return (
    <section style={{ background: '#F5F7FF', padding: '80px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(24px,4vw,36px)', color: '#0A0A0A', letterSpacing: '-0.5px', marginBottom: 10 }}>
            You're not studying alone.
          </h2>
          <p style={{ fontWeight: 500, fontSize: 16, color: '#52525B', maxWidth: 460, marginBottom: 48, lineHeight: 1.7 }}>
            Thousands of students preparing for the same exams. Share tips, ask questions, swap strategies.
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {[['jamb','JAMB','#2D3CE6'],['waec','WAEC','#16A34A']].map(([id,label,color])=>(
                <Link key={id} href={`/community/${id}`} style={{ flex: 1, textAlign: 'center', padding: '12px 0', border: `1.5px solid ${color}33`, borderRadius: 11, background: '#fff', fontWeight: 800, fontSize: 14, color, textDecoration: 'none' }}
                  onMouseEnter={e=>{e.currentTarget.style.background=color+'18'}} onMouseLeave={e=>{e.currentTarget.style.background='#fff'}}>
                  {label} Community →
                </Link>
              ))}
            </div>
            {feed.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 12, overflow: 'hidden' }}>
                {feed.map((post, i) => (
                  <div key={post.id} style={{ padding: '13px 16px', borderBottom: i < feed.length-1 ? '1px solid #F8FAFC' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#0A0A0A' }}>{post.display_name}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{post.content?.slice(0, 100)}{post.content?.length > 100 ? '…' : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ background: '#fff', border: '1.5px solid #DDE2FF', borderRadius: 14, padding: 24 }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: '#0A0A0A', marginBottom: 16 }}>Share something with the community</p>
            {posted ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 22, marginBottom: 8 }}>🎉</p>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#15803D' }}>Posted! Redirecting…</p>
              </div>
            ) : (
              <form onSubmit={handlePost}>
                <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, 500))} placeholder="Share a tip, ask a question…" rows={3}
                  style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', fontFamily: 'Nunito, sans-serif', fontSize: 14, lineHeight: 1.6, resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}/>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <select value={room} onChange={e => setRoom(e.target.value)}
                    style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 10px', outline: 'none', background: '#fff', cursor: 'pointer' }}>
                    <option value="jamb">JAMB</option>
                    <option value="waec">WAEC</option>
                  </select>
                  <input value={name} onChange={e => setName(e.target.value.slice(0, 40))} placeholder="Your name (optional)"
                    style={{ flex: 1, fontFamily: 'Nunito, sans-serif', fontSize: 13, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 10px', outline: 'none' }}/>
                </div>
                <button type="submit" disabled={!message.trim() || posting}
                  style={{ width: '100%', padding: '12px 0', border: 'none', borderRadius: 10, background: message.trim() ? '#2D3CE6' : '#E2E8F0', color: message.trim() ? '#fff' : '#94A3B8', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, cursor: message.trim() ? 'pointer' : 'not-allowed' }}>
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

// ─── Main page ─────────────────────────────────────────────────
export default function LandingPage() {
  const [sessions, setSessions] = useState([])
  useEffect(() => { getSessions().then(setSessions).catch(() => {}) }, [])

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', background: '#FAFAFA', minHeight: '100vh', overflowX: 'hidden' }}>
      <Nav/>

      {/* ── HERO ── */}
      <section style={{ background: '#fff', paddingTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))', gap: '48px 64px', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(36px,6vw,58px)', lineHeight: 1.04, letterSpacing: '-1.5px', color: '#0A0A0A', marginBottom: 20 }}>
              Know exactly<br/>
              <span style={{ color: '#2D3CE6' }}>where you stand.</span>
            </h1>
            <p style={{ fontWeight: 500, fontSize: 17, color: '#52525B', lineHeight: 1.75, maxWidth: 400, marginBottom: 32 }}>
              Take 40 past questions. Get a topic-by-topic breakdown of what you know and what needs work. Free. No sign-up.
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: 13, padding: '5px 12px', borderRadius: 8, background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }}/>JAMB — Live
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: 13, padding: '5px 12px', borderRadius: 8, background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }}/>WAEC — Live
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, background: '#2D3CE6', color: '#fff', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 20px rgba(45,60,230,0.22)' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(45,60,230,0.28)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 20px rgba(45,60,230,0.22)'}}>
                Start your test →
              </Link>
              <Link href="/schools" style={{ fontSize: 14, fontWeight: 600, color: '#2D3CE6', textDecoration: 'none' }}>
                For schools →
              </Link>
            </div>
            <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 16 }}>Free · No sign-up · Results in minutes</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Illustration/>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '80px 20px', background: '#F8F9FA' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(24px,4vw,36px)', color: '#0A0A0A', letterSpacing: '-0.4px', textAlign: 'center', marginBottom: 12 }}>
              Everything that helps.
            </h2>
            <p style={{ fontWeight: 500, fontSize: 16, color: '#64748B', textAlign: 'center', maxWidth: 440, margin: '0 auto 48px', lineHeight: 1.7 }}>
              Built for one purpose — helping Nigerian students know exactly where they stand before their exams.
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 50}>
                <div style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: '24px 22px', height: '100%', boxSizing: 'border-box', transition: 'all 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';e.currentTarget.style.borderColor='#C7D2FE'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor='#E8EAED'}}>
                  <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0A0A0A', marginBottom: 7 }}>{f.title}</h3>
                  <p style={{ fontWeight: 500, fontSize: 14, color: '#64748B', lineHeight: 1.65, margin: 0 }}>{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ── */}
      <CommunitySection/>

      {/* ── CTA ── */}
      <section style={{ background: '#0F172A', padding: '80px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(26px,5vw,42px)', color: '#fff', lineHeight: 1.1, letterSpacing: '-0.7px', marginBottom: 14 }}>
              Ready to find out where you stand?
            </h2>
            <p style={{ fontWeight: 500, fontSize: 16, color: '#6B7DB3', marginBottom: 36 }}>Free. No sign-up. Works on any phone.</p>
            <Link href="/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fff', color: '#2D3CE6', fontWeight: 800, fontSize: 15, padding: '15px 32px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 32px rgba(0,0,0,0.28)' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#EEF0FE';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.transform='none'}}>
              Start my test — it's free →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── PAST SESSIONS ── */}
      {sessions.length > 0 && (
        <section style={{ background: '#fff', padding: '64px 20px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ fontWeight: 900, fontSize: 18, color: '#0A0A0A', margin: '0 0 3px' }}>Welcome back</p>
                <p style={{ fontSize: 13, color: '#71717A', margin: 0 }}>Your recent sessions</p>
              </div>
              <button onClick={() => { clearSessions(); setSessions([]) }} style={{ fontSize: 13, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sessions.slice(0, 3).map(s => {
                const r = getReadiness(s.percentage)
                const colors = { green: ['#DCFCE7','#16A34A'], blue: ['#EEF0FE','#2D3CE6'], amber: ['#FEF3C7','#D97706'], red: ['#FEE2E2','#DC2626'] }
                const [bg, fg] = colors[r.color] || colors.blue
                return (
                  <Link key={s.shareToken} href={`/results/${s.shareToken}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1.5px solid #EBEBEB', borderRadius: 12, padding: '14px 16px', textDecoration: 'none', transition: 'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#2D3CE6';e.currentTarget.style.transform='translateY(-1px)'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#EBEBEB';e.currentTarget.style.transform='none'}}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: '#0A0A0A', margin: '0 0 3px' }}>{s.studentName}</p>
                      <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{s.examType} · {s.subject} · {formatDate(s.createdAt)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 900, fontSize: 18, color: '#0A0A0A', margin: '0 0 3px' }}>{Math.round(s.percentage)}%</p>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: bg, color: fg }}>{r.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0F172A', padding: '56px 20px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                <AppLogo size={26}/>
                <span style={{ fontWeight: 900, fontSize: 14, color: '#fff' }}>Exam Ready Test</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65, margin: '0 0 14px', maxWidth: 200 }}>
                Free exam readiness testing for every Nigerian student.
              </p>
              <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>
                A <a href="https://learniie.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2D3CE6', textDecoration: 'none' }}>Learniie</a> product
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14 }}>Students</p>
              {[['/#features','How it works'],['/setup','Take a test'],['/community','Community']].map(([h,l]) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href={h} style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}
                    onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#64748B'}>{l}</a>
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14 }}>Schools</p>
              {[['/schools','For schools'],['/schools/register','Register'],['/schools/login','Log in']].map(([h,l]) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href={h} style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}
                    onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#64748B'}>{l}</a>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1E293B', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>© 2025 Exam Ready Test · Made with care for Nigerian students</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ fontSize: 12, fontWeight: 700, color: '#64748B', background: 'none', border: '1px solid #334155', borderRadius: 7, padding: '5px 12px', cursor: 'pointer' }}
              onMouseEnter={e=>{e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor='#64748B'}}
              onMouseLeave={e=>{e.currentTarget.style.color='#64748B';e.currentTarget.style.borderColor='#334155'}}>
              ↑ Top
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}