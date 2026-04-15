'use client'
import { useState } from 'react'
import Link from 'next/link'

function AppLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#2D3CE6"/>
      <path d="M8 20V8l6 8 6-8v12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Stat cards for hero ───────────────────────────────────────
const STATS = [
  { value: '40+',   label: 'questions per test' },
  { value: '100%',  label: 'topic-level detail' },
  { value: '< 1min', label: 'to share with class' },
]

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="3" width="18" height="16" rx="3" stroke="white" strokeWidth="1.6"/>
        <path d="M7 8h8M7 12h5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Test across all subjects',
    desc:  'Run readiness tests in Physics, Maths, Chemistry, Biology, English and more — all from one dashboard.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="1.6"/>
        <path d="M11 7v4l3 3" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: 'See every weak topic',
    desc:  'A class-wide breakdown showing exactly which topics students struggle with — ranked by severity.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" stroke="white" strokeWidth="1.6"/>
        <path d="M4 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Track every student',
    desc:  'Individual performance for each student — scores, topic gaps, and progress over time.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 12l4 4 10-10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Share in seconds',
    desc:  'One link. Students tap it, enter their name, start testing. No app, no passwords, no friction.',
  },
]

const HOW = [
  { n: '1', title: 'Register your institution', desc: 'Takes 2 minutes. Name, email, done. You\'re live immediately.' },
  { n: '2', title: 'Share your unique link',    desc: 'Paste it into your WhatsApp group. Students click and start.' },
  { n: '3', title: 'Watch results come in',     desc: 'Real-time performance data the moment each student submits.' },
]

export default function SchoolsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const mw = { maxWidth: 1100, margin: '0 auto', padding: '0 20px' }

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', background: '#F8FAFB', color: '#0A0A0A', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E8EAED', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ ...mw, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <AppLogo/>
            <span style={{ fontWeight: 900, fontSize: 15, color: '#0A0A0A' }}>Exam Ready Test</span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} className="schools-nav-desktop">
            <Link href="/" style={{ fontSize: 14, fontWeight: 600, color: '#52525B', textDecoration: 'none', padding: '7px 12px', borderRadius: 8, transition: 'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.color='#2D3CE6';e.currentTarget.style.background='#EEF0FD'}} onMouseLeave={e=>{e.currentTarget.style.color='#52525B';e.currentTarget.style.background='none'}}>
              ← For students
            </Link>
            <Link href="/schools/login" style={{ fontSize: 14, fontWeight: 600, color: '#52525B', textDecoration: 'none', padding: '7px 12px', borderRadius: 8, transition: 'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.color='#0A0A0A'}} onMouseLeave={e=>{e.currentTarget.style.color='#52525B'}}>
              Log in
            </Link>
            <Link href="/schools/register" style={{ fontSize: 14, fontWeight: 800, background: '#0F172A', color: '#fff', padding: '9px 20px', borderRadius: 9, textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#1E293B';e.currentTarget.style.transform='translateY(-1px)'}} onMouseLeave={e=>{e.currentTarget.style.background='#0F172A';e.currentTarget.style.transform='none'}}>
              Register →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(o => !o)} className="schools-nav-mobile"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#374151' }} aria-label="Menu">
            {menuOpen
              ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            }
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #F1F5F9', padding: '12px 20px 20px' }} className="schools-nav-mobile">
            {[['/', '← For students'], ['/schools/login', 'Log in']].map(([h, l]) => (
              <a key={l} href={h} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#374151', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid #F8FAFC' }}>{l}</a>
            ))}
            <Link href="/schools/register" onClick={() => setMenuOpen(false)}
              style={{ display: 'block', marginTop: 14, textAlign: 'center', fontSize: 15, fontWeight: 800, color: '#fff', background: '#0F172A', padding: '13px 0', borderRadius: 10, textDecoration: 'none' }}>
              Register your institution →
            </Link>
          </div>
        )}

        <style>{`@media(min-width:640px){.schools-nav-mobile{display:none!important}.schools-nav-desktop{display:flex!important}}@media(max-width:639px){.schools-nav-desktop{display:none!important}.schools-nav-mobile{display:block!important}}`}</style>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: '#0F172A', padding: 'clamp(80px, 10vw, 120px) 20px clamp(64px, 8vw, 96px)', position: 'relative', overflow: 'hidden' }}>
        {/* Background grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '32px 32px', pointerEvents: 'none' }}/>
        {/* Gradient blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,60,230,0.25) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ ...mw, position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(45,60,230,0.2)', border: '1px solid rgba(45,60,230,0.4)', borderRadius: 99, padding: '5px 14px', marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }}/>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#A5B4FC', letterSpacing: '0.06em' }}>FOR SCHOOLS & TUTORIAL CENTRES</span>
            </div>

            <h1 style={{ fontWeight: 900, fontSize: 'clamp(38px,6vw,62px)', lineHeight: 1.04, letterSpacing: '-1.5px', color: '#fff', marginBottom: 22 }}>
              Know which topics your<br/>
              <span style={{ color: '#818CF8' }}>
                students need most.
              </span>
            </h1>

            <p style={{ fontWeight: 400, fontSize: 'clamp(16px,2vw,18px)', color: '#94A3B8', lineHeight: 1.75, maxWidth: 540, marginBottom: 40 }}>
              Run exam readiness tests across all your subjects. Get real-time, topic-by-topic analytics on every student — so you teach where it matters most.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 52 }}>
              <Link href="/schools/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 800, background: '#2D3CE6', color: '#fff', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 0 0 1px rgba(45,60,230,0.6), 0 8px 32px rgba(45,60,230,0.4)', transition: 'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='#1e2cc0';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.background='#2D3CE6';e.currentTarget.style.transform='none'}}>
                Register your institution →
              </Link>
              <Link href="#how" style={{ fontSize: 14, fontWeight: 600, color: '#64748B', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#94A3B8'} onMouseLeave={e=>e.currentTarget.style.color='#64748B'}>
                See how it works ↓
              </Link>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
              {STATS.map((s, i) => (
                <div key={s.label} style={{ padding: '0 24px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                  <p style={{ fontWeight: 900, fontSize: 26, color: '#fff', margin: '0 0 3px', letterSpacing: '-0.5px' }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0, fontWeight: 500 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: 'clamp(64px,8vw,96px) 20px', background: '#fff' }}>
        <div style={mw}>
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 56px' }}>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(26px,4vw,38px)', letterSpacing: '-0.6px', color: '#0A0A0A', marginBottom: 12 }}>
              Built for how schools actually prepare students.
            </h2>
            <p style={{ fontWeight: 400, fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>
              Designed with teachers in mind. Zero technical setup. Works on any device.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,260px), 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{ borderRadius: 16, padding: '28px 24px', background: i % 2 === 0 ? '#0F172A' : '#F8FAFB', border: i % 2 === 0 ? 'none' : '1.5px solid #E8EAED', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.12)'}} onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: i % 2 === 0 ? '#2D3CE6' : '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: i % 2 === 0 ? '#fff' : '#0A0A0A', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontWeight: 400, fontSize: 14, color: i % 2 === 0 ? '#94A3B8' : '#52525B', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ background: '#F8FAFB', padding: 'clamp(64px,8vw,96px) 20px' }}>
        <div style={{ ...mw, maxWidth: 860 }}>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(26px,4vw,36px)', letterSpacing: '-0.5px', color: '#0A0A0A', textAlign: 'center', marginBottom: 56 }}>
            Up and running in 5 minutes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,240px), 1fr))', gap: 32 }}>
            {HOW.map((h, i) => (
              <div key={h.n} style={{ position: 'relative' }}>
                {/* Connector line on desktop */}
                {i < HOW.length - 1 && (
                  <div style={{ position: 'absolute', top: 22, left: 'calc(50% + 28px)', width: 'calc(100% - 20px)', height: 1, background: 'linear-gradient(90deg, #E2E8F0 0%, transparent 100%)', display: 'none' }} className="how-connector"/>
                )}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0F172A', color: '#fff', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 4px 16px rgba(15,23,42,0.2)' }}>{h.n}</div>
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#0A0A0A', marginBottom: 8 }}>{h.title}</h3>
                  <p style={{ fontWeight: 400, fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL / SOCIAL PROOF ── */}
      <section style={{ background: '#fff', padding: 'clamp(64px,8vw,80px) 20px' }}>
        <div style={{ ...mw, maxWidth: 860 }}>
          <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: 20, padding: 'clamp(32px,5vw,56px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,60,230,0.2) 0%, transparent 70%)' }}/>
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 700, color: '#fff', lineHeight: 1.5, margin: '0 0 24px', maxWidth: 580 }}>
                "We used to spend hours reviewing each student. Now we see the whole class picture in 30 seconds."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2D3CE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#fff' }}>A</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#fff', margin: 0 }}>Adaeze O.</p>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Head of Academics, Lagos Tutorial Centre</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXAMS ── */}
      <section style={{ background: '#F8FAFB', padding: 'clamp(56px,7vw,80px) 20px' }}>
        <div style={mw}>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(22px,3vw,30px)', color: '#0A0A0A', textAlign: 'center', marginBottom: 40 }}>Supported examinations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,200px), 1fr))', gap: 12, maxWidth: 720, margin: '0 auto' }}>
            {[
              { name: 'JAMB', live: true,  full: 'Joint Admissions & Matriculation Board' },
              { name: 'WAEC', live: true,  full: 'West African Examinations Council' },
              { name: 'IGCSE', live: false, full: 'International GCSE (Cambridge)' },
              { name: 'SAT',   live: false, full: 'Scholastic Assessment Test' },
            ].map(e => (
              <div key={e.name} style={{ background: '#fff', border: `1.5px solid ${e.live ? '#C7D2FE' : '#E2E8F0'}`, borderRadius: 12, padding: '18px 20px', opacity: e.live ? 1 : 0.6, transition: 'transform 0.15s' }}
                onMouseEnter={el=>{ if(e.live) el.currentTarget.style.transform='translateY(-2px)' }} onMouseLeave={el=>el.currentTarget.style.transform='none'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 900, fontSize: 18, color: e.live ? '#2D3CE6' : '#94A3B8' }}>{e.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: e.live ? '#DCFCE7' : '#F1F5F9', color: e.live ? '#15803D' : '#94A3B8' }}>
                    {e.live ? '● Live' : 'Soon'}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{e.full}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#0F172A', padding: 'clamp(64px,8vw,96px) 20px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(28px,5vw,44px)', color: '#fff', letterSpacing: '-0.7px', lineHeight: 1.1, marginBottom: 16 }}>
            Ready to see your students improve?
          </h2>
          <p style={{ fontWeight: 400, fontSize: 16, color: '#64748B', marginBottom: 40, lineHeight: 1.7 }}>
            Join schools and tutorial centres already using Exam Ready Test. Free to start — no contracts, no setup fees.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/schools/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 800, background: '#2D3CE6', color: '#fff', padding: '15px 32px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 24px rgba(45,60,230,0.35)', transition: 'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#1e2cc0';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.background='#2D3CE6';e.currentTarget.style.transform='none'}}>
              Register your institution — free →
            </Link>
            <Link href="/schools/login" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 600, color: '#64748B', textDecoration: 'none', padding: '15px 24px', border: '1px solid #334155', borderRadius: 10, transition: 'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor='#475569'}} onMouseLeave={e=>{e.currentTarget.style.color='#64748B';e.currentTarget.style.borderColor='#334155'}}>
              Log in →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0A0F1A', borderTop: '1px solid #1E293B', padding: '28px 20px' }}>
        <div style={{ ...mw, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AppLogo size={20}/>
            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>© 2025 Exam Ready Test · A Learniie product</p>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['/', 'For students'], ['/setup', 'Practice test'], ['/community', 'Community']].map(([h, l]) => (
              <a key={l} href={h} style={{ fontSize: 13, color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e=>e.target.style.color='#94A3B8'} onMouseLeave={e=>e.target.style.color='#475569'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}