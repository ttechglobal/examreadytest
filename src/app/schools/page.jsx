import Link from 'next/link'

const FEATURES = [
  { icon: '📊', title: 'Test readiness across all subjects', desc: 'Students take past questions. You see exactly which topics need more teaching before the real exam.' },
  { icon: '🎯', title: 'Topic-level analytics', desc: 'Not just overall scores — a heatmap of every topic across every subject, ranked by class weakness.' },
  { icon: '⚡', title: 'Real-time dashboard', desc: 'Watch students complete tests as they happen. See results the moment they submit.' },
  { icon: '📅', title: 'Year-on-year tracking', desc: 'Create a new cohort each academic year. Compare this year\'s SS3 to last year\'s at a glance.' },
]

const HOW = [
  { step: '01', title: 'Register your institution', desc: 'Takes 2 minutes. No lengthy onboarding. You\'re live immediately.' },
  { step: '02', title: 'Share your unique link', desc: 'Copy your cohort link and paste it into your WhatsApp group. Students click, enter their name, and start.' },
  { step: '03', title: 'Watch results come in', desc: 'Your dashboard updates in real time. At a glance, see who\'s tested, who hasn\'t, and where the class is struggling.' },
]

const s = {
  page:    { fontFamily: 'Nunito, sans-serif', background: '#F8F9FA', color: '#1A1A1A', minHeight: '100vh' },
  mw:      { maxWidth: 1100, margin: '0 auto', padding: '0 24px' },
  mwNarrow: { maxWidth: 780, margin: '0 auto', padding: '0 24px' },
}

export const metadata = { title: 'For Schools & Tutorial Centres — Exam Ready Test' }

export default function SchoolsPage() {
  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #E8EAED', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ ...s.mw, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#2D3CE6', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>E</div>
            <span style={{ fontWeight: 900, fontSize: 15, color: '#0A0A0A' }}>Exam Ready Test</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2D3CE6', background: '#EEF0FE', padding: '2px 8px', borderRadius: 99 }}>For Schools</span>
          </Link>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/schools/login" style={{ fontSize: 14, fontWeight: 600, color: '#374151', textDecoration: 'none' }}>Log in</Link>
            <Link href="/schools/register" style={{ fontSize: 14, fontWeight: 700, background: '#2D3CE6', color: '#fff', padding: '8px 18px', borderRadius: 8, textDecoration: 'none' }}>Register your school →</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: '#fff', padding: '100px 24px 80px' }}>
        <div style={s.mwNarrow}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#2D3CE6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>For Schools & Tutorial Centres</p>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(36px,6vw,58px)', lineHeight: 1.05, letterSpacing: '-1.5px', color: '#0A0A0A', marginBottom: 20 }}>
            Prepare your students<br/>
            <span style={{ color: '#2D3CE6' }}>for exam success.</span>
          </h1>
          <p style={{ fontWeight: 500, fontSize: 18, color: '#52525B', lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
            Know exactly which topics need more teaching — before the real exam. Comprehensive readiness testing for WAEC, JAMB and more. Real-time analytics for teachers. Zero setup for students.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/schools/register" style={{ fontSize: 15, fontWeight: 800, background: '#2D3CE6', color: '#fff', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', letterSpacing: '-0.2px' }}>
              Register your school →
            </Link>
            <Link href="#how" style={{ fontSize: 14, fontWeight: 600, color: '#64748B', textDecoration: 'none' }}>
              See how it works ↓
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '90px 24px' }}>
        <div style={s.mw}>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(26px,4vw,36px)', letterSpacing: '-0.5px', color: '#0A0A0A', marginBottom: 48, textAlign: 'center' }}>
            Everything your school needs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#fff', border: '1.5px solid #E8EAED', borderRadius: 14, padding: '28px 24px' }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#0A0A0A', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontWeight: 500, fontSize: 14, color: '#52525B', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ background: '#fff', padding: '90px 24px' }}>
        <div style={s.mwNarrow}>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(26px,4vw,36px)', letterSpacing: '-0.5px', color: '#0A0A0A', marginBottom: 56, textAlign: 'center' }}>
            Up and running in 5 minutes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {HOW.map(h => (
              <div key={h.step} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div style={{ width: 52, height: 52, background: '#EEF0FE', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900, fontSize: 18, color: '#2D3CE6' }}>{h.step}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 18, color: '#0A0A0A', marginBottom: 6 }}>{h.title}</h3>
                  <p style={{ fontWeight: 500, fontSize: 15, color: '#52525B', lineHeight: 1.7, margin: 0 }}>{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported exams */}
      <section style={{ padding: '90px 24px', background: '#F5F7FF' }}>
        <div style={s.mw}>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(26px,4vw,36px)', letterSpacing: '-0.5px', color: '#0A0A0A', marginBottom: 12, textAlign: 'center' }}>Supported examinations</h2>
          <p style={{ fontWeight: 500, fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 48 }}>Live now and coming soon</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, maxWidth: 720, margin: '0 auto' }}>
            {[
              { name: 'JAMB', status: 'live',         full: 'Joint Admissions & Matriculation Board' },
              { name: 'WAEC', status: 'live',         full: 'West African Examinations Council' },
              { name: 'IGCSE', status: 'coming_soon', full: 'International GCSE (Cambridge)' },
              { name: 'SAT',   status: 'coming_soon', full: 'Scholastic Assessment Test' },
            ].map(e => (
              <div key={e.name} style={{ background: '#fff', border: `1.5px solid ${e.status === 'live' ? '#C7D2FE' : '#E2E8F0'}`, borderRadius: 12, padding: '18px 20px', opacity: e.status === 'live' ? 1 : 0.65 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 900, fontSize: 18, color: e.status === 'live' ? '#2D3CE6' : '#94A3B8' }}>{e.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: e.status === 'live' ? '#DCFCE7' : '#F1F5F9', color: e.status === 'live' ? '#15803D' : '#94A3B8' }}>
                    {e.status === 'live' ? 'Live now' : 'Coming soon'}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontWeight: 500 }}>{e.full}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0F172A', padding: '90px 24px' }}>
        <div style={{ ...s.mwNarrow, textAlign: 'center' }}>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(28px,5vw,44px)', color: '#fff', letterSpacing: '-0.7px', marginBottom: 16 }}>
            Ready to improve exam performance?
          </h2>
          <p style={{ fontWeight: 500, fontSize: 16, color: '#94A3B8', marginBottom: 36 }}>
            Join schools and tutorial centres already using Exam Ready Test.
          </p>
          <Link href="/schools/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, background: '#2D3CE6', color: '#fff', padding: '15px 32px', borderRadius: 10, textDecoration: 'none' }}>
            Register your institution →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0F172A', borderTop: '1px solid #1E293B', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
          © 2025 Exam Ready Test · A Learniie product ·{' '}
          <Link href="/" style={{ color: '#2D3CE6', textDecoration: 'none' }}>Back to student platform</Link>
        </p>
      </footer>
    </div>
  )
}
