'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const C = {
  brand:    '#1A2B5E',
  cta:      '#1D6FEF',
  ctaDk:    '#1558CC',
  ctaLt:    '#EBF2FE',
  green:    '#19A96B',
  greenLt:  '#E8FAF2',
  greenDk:  '#0E8653',
  pop:      '#FF6B35',
  popLt:    '#FFF0EB',
  ink:      '#0F172A',
  ink2:     '#1E293B',
  muted:    '#64748B',
  faint:    '#94A3B8',
  border:   '#E2E8F0',
  surface:  '#F8FAFF',
}

function AppLogo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <rect width="38" height="38" rx="10" fill={C.brand}/>
      <path d="M19 11v16" stroke={C.green} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M19 12C15 12 9 14 9 19s6 7 10 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8"/>
      <path d="M19 12c4 0 10 2 10 7s-6 7-10 7" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M14 23l5-4 5 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.45"/>
    </svg>
  )
}

function useReveal() {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.disconnect() } }, { threshold: 0.1 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return [ref, v]
}
function Reveal({ children, delay = 0 }) {
  const [ref, v] = useReveal()
  return (
    <div ref={ref} style={{ transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`, opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(22px)' }}>
      {children}
    </div>
  )
}

// Dashboard preview SVG
function DashPreview() {
  return (
    <svg viewBox="0 0 540 380" fill="none" style={{ width: '100%', borderRadius: 16, filter: 'drop-shadow(0 20px 48px rgba(26,43,94,0.18))' }}>
      {/* Chrome */}
      <rect width="540" height="380" rx="14" fill="#F8FAFF"/>
      <rect width="540" height="40" rx="14" fill="#EEF2FA"/>
      <rect y="34" width="540" height="6" fill="#EEF2FA"/>
      {[14,26,38].map((x,i) => <circle key={i} cx={x} cy="20" r="5.5" fill={['#FF5F57','#FEBC2E','#28C840'][i]}/>)}
      <text x="270" y="25" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="Nunito" fontWeight="600">ExamReady — School Dashboard</text>

      {/* Sidebar */}
      <rect y="40" width="118" height="340" fill={C.brand}/>
      <rect x="10" y="54" width="24" height="24" rx="6" fill="#243575"/>
      <path d="M22 57v14M22 58C19.5 58 16 59.8 16 63.5s3.5 5.5 6 5.5M22 58c2.5 0 6 1.8 6 5.5s-3.5 5.5-6 5.5" stroke={C.green} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <text x="40" y="69" fill="white" fontSize="9" fontWeight="800" fontFamily="Nunito">ExamReady</text>
      {[['Overview',92,true],['Students',110,false],['Subjects',128,false],['Reports',146,false]].map(([l,y,act]) => (
        <g key={l}>
          {act && <rect x="0" y={y-10} width="118" height="20" fill={`${C.green}18`}/>}
          <circle cx="20" cy={y} r="3" fill={act ? C.green : '#4A6080'}/>
          <text x="30" y={y+4} fill={act ? C.green : '#6A89A8'} fontSize="8.5" fontFamily="Nunito" fontWeight={act?'700':'500'}>{l}</text>
        </g>
      ))}

      {/* Stat cards */}
      {[[0,'28','Students'],[1,'94','Tests done'],[2,'71%','Class avg'],[3,'4','Cohorts']].map(([i,v,l]) => {
        const x = 128 + i * 103
        return (
          <g key={l}>
            <rect x={x} y="52" width="96" height="48" rx="9" fill="white" stroke={C.border} strokeWidth="1"/>
            <text x={x+10} y="68" fill="#94A3B8" fontSize="7" fontFamily="Nunito" fontWeight="700">{l.toUpperCase()}</text>
            <text x={x+10} y="90" fill={C.ink} fontSize="18" fontFamily="Nunito" fontWeight="900">{v}</text>
          </g>
        )
      })}

      {/* Top performers */}
      <rect x="128" y="112" width="194" height="140" rx="9" fill="white" stroke={C.border} strokeWidth="1"/>
      <text x="142" y="130" fill={C.ink} fontSize="9" fontFamily="Nunito" fontWeight="800">Top Performers</text>
      {[['Chidera O.','92%',0],['Amara I.','88%',1],['Kola A.','83%',2],['Temi F.','79%',3]].map(([name,score,i]) => (
        <g key={name}>
          <circle cx="148" cy={150+i*22} r="8" fill={i===0 ? '#FEF3C7' : '#F1F5F9'}/>
          <text x="148" y={154+i*22} textAnchor="middle" fill={i===0?'#D97706':'#94A3B8'} fontSize="7" fontFamily="Nunito" fontWeight="800">{i+1}</text>
          <text x="163" y={154+i*22} fill={C.ink} fontSize="8.5" fontFamily="Nunito" fontWeight="600">{name}</text>
          <text x="315" y={154+i*22} textAnchor="end" fill={i===0?C.greenDk:C.muted} fontSize="8.5" fontFamily="Nunito" fontWeight="800">{score}</text>
        </g>
      ))}

      {/* Subject bars */}
      <rect x="332" y="112" width="196" height="140" rx="9" fill="white" stroke={C.border} strokeWidth="1"/>
      <text x="346" y="130" fill={C.ink} fontSize="9" fontFamily="Nunito" fontWeight="800">Subject Performance</text>
      {[['Physics','72%',106,C.cta],['Maths','58%',86,C.green],['Chemistry','44%',65,'#FF6B35'],['Biology','81%',120,C.greenDk]].map(([s,p,w,col],i) => (
        <g key={s}>
          <text x="346" y={152+i*22} fill="#475569" fontSize="8" fontFamily="Nunito" fontWeight="600">{s}</text>
          <rect x="346" y={156+i*22} width="162" height="5" rx="2.5" fill="#F1F5F9"/>
          <rect x="346" y={156+i*22} width={w} height="5" rx="2.5" fill={col}/>
          <text x="514" y={161+i*22} textAnchor="end" fill={C.ink} fontSize="7.5" fontFamily="Nunito" fontWeight="800">{p}</text>
        </g>
      ))}

      {/* Areas to improve */}
      <rect x="128" y="264" width="400" height="50" rx="9" fill="white" stroke={C.border} strokeWidth="1"/>
      <text x="142" y="280" fill={C.ink} fontSize="9" fontFamily="Nunito" fontWeight="800">Needs Attention</text>
      {[['Thermodynamics · Physics','28%','#FEE2E2','#DC2626',142],['Quadratic Equations · Maths','39%','#FEF3C7','#D97706',300]].map(([t,p,bg,col,x]) => (
        <g key={t}>
          <rect x={x} y="284" width="148" height="16" rx="4" fill={bg}/>
          <text x={x+6} y="296" fill={col} fontSize="7.5" fontFamily="Nunito" fontWeight="600">{t}</text>
          <text x={x+142} y="296" textAnchor="end" fill={col} fontSize="7.5" fontFamily="Nunito" fontWeight="800">{p}</text>
        </g>
      ))}
    </svg>
  )
}

const OUTCOMES = [
  { icon:'📊', color:C.cta,   bg:C.ctaLt,
    headline:'See every student\'s performance — by topic, not just score',
    body:'Know exactly which topics each student is struggling with, not just their final grade. Spot problems before the exam, not after.' },
  { icon:'🎯', color:C.green, bg:C.greenLt,
    headline:'Identify the weak spots your whole class shares',
    body:'Class-wide analytics show you which topics most students are getting wrong — so you know exactly where to spend teaching time.' },
  { icon:'📄', color:C.pop,   bg:C.popLt,
    headline:'Generate reports tutors and parents actually read',
    body:'One click creates a clear, professional report for each student. Share with parents, tutors, or school leadership in seconds.' },
  { icon:'⚡', color:C.cta,   bg:C.ctaLt,
    headline:'Students start in 60 seconds — one link, no accounts',
    body:'Share one link to your class. Students click it, type their name, and start answering. No app download, no passwords, no IT setup.' },
]

const HOW = [
  { n:'1', title:'Register your school or centre', body:'Enter your name, email, and institution. You\'re live in under 2 minutes — no IT department needed.' },
  { n:'2', title:'Share your class link',           body:'Paste one link into your WhatsApp group. Students tap it, enter their name, and start. No accounts, no friction.' },
  { n:'3', title:'Watch results appear in real time', body:'Your dashboard updates the moment each student submits. See scores, topic breakdowns, and class-wide patterns instantly.' },
  { n:'4', title:'Generate and share reports',      body:'Download polished PDF reports for each student or export class-wide data — ready to share with parents and management.' },
]

const EXAMS = [
  { name:'JAMB',  full:'Joint Admissions & Matriculation Board', live:true },
  { name:'WAEC',  full:'West African Examinations Council',       live:true },
  { name:'IGCSE', full:'International GCSE (Cambridge)',          live:false },
  { name:'GCSE',  full:'General Certificate of Secondary Edu.',  live:false },
  { name:'SAT',   full:'Scholastic Assessment Test',             live:false },
  { name:'IELTS', full:'International English Language Testing', live:false },
]

export default function SchoolsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const mw = { maxWidth:1160, margin:'0 auto', padding:'0 24px' }

  return (
    <div style={{ fontFamily:'Nunito, var(--font-nunito), sans-serif', background:C.surface, color:C.ink, minHeight:'100vh', overflowX:'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ background:'rgba(248,250,255,0.97)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${C.border}`, position:'sticky', top:0, zIndex:50 }}>
        <div style={{ ...mw, height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
            <AppLogo size={30}/>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:15, color:C.ink, letterSpacing:'-0.3px' }}>ExamReady</span>
            <span style={{ fontSize:11, fontWeight:700, color:C.muted, background:'#EEF2FA', padding:'2px 9px', borderRadius:99, marginLeft:2 }}>Schools</span>
          </Link>
          <div className="snav-desk" style={{ display:'flex', gap:4, alignItems:'center' }}>
            <Link href="/" style={{ fontSize:14, fontWeight:600, color:C.muted, textDecoration:'none', padding:'8px 13px', borderRadius:8, transition:'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.color=C.ink;e.currentTarget.style.background=C.ctaLt}} onMouseLeave={e=>{e.currentTarget.style.color=C.muted;e.currentTarget.style.background='none'}}>
              ← For students
            </Link>
            <Link href="/schools/login" style={{ fontSize:14, fontWeight:600, color:C.muted, textDecoration:'none', padding:'8px 13px', borderRadius:8, transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color=C.ink} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>Log in</Link>
            <Link href="/schools/register" style={{ fontSize:14, fontFamily:'var(--font-display)', fontWeight:700, background:C.cta, color:'#fff', padding:'10px 22px', borderRadius:10, textDecoration:'none', transition:'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background=C.ctaDk;e.currentTarget.style.transform='translateY(-1px)'}} onMouseLeave={e=>{e.currentTarget.style.background=C.cta;e.currentTarget.style.transform='none'}}>
              Register →
            </Link>
          </div>
          <button onClick={() => setMenuOpen(o => !o)} className="snav-mob" style={{ background:'none', border:'none', cursor:'pointer', padding:8, color:C.ink }}>
            {menuOpen ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>}
          </button>
        </div>
        {menuOpen && (
          <div className="snav-mob" style={{ background:'#fff', borderTop:`1px solid ${C.border}`, padding:'12px 24px 24px' }}>
            {[['/', '← For students'],['/schools/login','Log in']].map(([h,l]) => (
              <a key={l} href={h} onClick={() => setMenuOpen(false)} style={{ display:'block', fontSize:16, fontWeight:600, color:C.ink2, textDecoration:'none', padding:'13px 0', borderBottom:`1px solid ${C.border}` }}>{l}</a>
            ))}
            <Link href="/schools/register" onClick={() => setMenuOpen(false)} style={{ display:'block', marginTop:16, textAlign:'center', fontSize:16, fontFamily:'var(--font-display)', fontWeight:700, color:'#fff', background:C.cta, padding:'14px 0', borderRadius:10, textDecoration:'none' }}>
              Register your institution →
            </Link>
          </div>
        )}
        <style>{`@media(min-width:640px){.snav-mob{display:none!important}.snav-desk{display:flex!important}}@media(max-width:639px){.snav-desk{display:none!important}.snav-mob{display:block!important}}`}</style>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background:C.brand, padding:'clamp(72px,10vw,112px) 24px clamp(64px,8vw,88px)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize:'28px 28px', pointerEvents:'none' }}/>


        <div style={{ ...mw, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,360px),1fr))', gap:'clamp(48px,6vw,80px)', alignItems:'center', position:'relative', zIndex:1 }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:`${C.green}18`, border:`1px solid ${C.green}44`, borderRadius:99, padding:'5px 14px', marginBottom:28 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:C.green, flexShrink:0 }}/>
              <span style={{ fontWeight:700, fontSize:11, color:C.green, letterSpacing:'0.08em', textTransform:'uppercase' }}>For schools & tutorial centres</span>
            </div>

            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(36px,5.5vw,56px)', lineHeight:1.1, letterSpacing:'-1px', color:'#fff', marginBottom:22 }}>
              Track how your students<br/>
              are preparing —<br/>
              <span style={{ color:C.green }}>and where they need help.</span>
            </h1>

            <p style={{ fontSize:'clamp(15px,2vw,17px)', color:'rgba(255,255,255,0.58)', lineHeight:1.8, maxWidth:520, marginBottom:40 }}>
              ExamReady gives schools and tutorial centres real-time visibility into how every student
              is performing — topic by topic, not just by overall score. Know exactly what to teach next.
            </p>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', marginBottom:48 }}>
              <Link href="/schools/register"
                style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, background:C.green, color:'#fff', padding:'15px 30px', borderRadius:12, textDecoration:'none', transition:'all 0.18s' }}
                onMouseEnter={e=>{e.currentTarget.style.background=C.greenDk;e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.background=C.green;e.currentTarget.style.transform='none'}}>
                Register your institution
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <a href="#how" style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.45)', textDecoration:'none', transition:'color 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.75)'}
                onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
                See how it works ↓
              </a>
            </div>

            <div style={{ display:'flex', gap:0, flexWrap:'wrap' }}>
              {[['40+','questions per test'],['< 1 min','to onboard a class'],['100%','topic-level data']].map((s,i) => (
                <div key={s[1]} style={{ padding:'0 clamp(14px,2vw,22px)', borderLeft: i>0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                  <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:C.green, margin:'0 0 3px' }}>{s[0]}</p>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.38)', margin:0, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em' }}>{s[1]}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <DashPreview/>
          </div>
        </div>
      </section>

      {/* ── OUTCOMES ── */}
      <section style={{ background:'#fff', padding:'clamp(72px,8vw,96px) 24px' }}>
        <div style={mw}>
          <Reveal>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.ctaLt, borderRadius:99, padding:'5px 14px', marginBottom:20 }}>
              <span style={{ fontWeight:700, fontSize:11, color:C.cta, textTransform:'uppercase', letterSpacing:'0.1em' }}>What you get</span>
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(26px,4vw,38px)', color:C.ink, letterSpacing:'-0.5px', marginBottom:12, lineHeight:1.2, maxWidth:520 }}>
              Stop guessing what your students don't know.
            </h2>
            <p style={{ fontSize:16, color:C.muted, marginBottom:52, lineHeight:1.75, maxWidth:480 }}>
              ExamReady gives you the data to teach more effectively — topic gaps, class-wide patterns,
              and individual student reports, all in one place.
            </p>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,280px),1fr))', gap:16 }}>
            {OUTCOMES.map((o,i) => (
              <Reveal key={o.headline} delay={i*55}>
                <div style={{ padding:'26px 24px', borderRadius:18, background: i%2===0 ? C.brand : C.surface,
                  border: i%2===0 ? 'none' : `1.5px solid ${C.border}`,
                  transition:'all 0.2s', height:'100%', boxSizing:'border-box' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='none'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
                  <div style={{ width:46, height:46, borderRadius:13, background: i%2===0 ? 'rgba(255,255,255,0.1)' : o.bg,
                    display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, fontSize:22 }}>
                    {o.icon}
                  </div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color: i%2===0 ? '#fff' : C.ink, marginBottom:10, lineHeight:1.35 }}>{o.headline}</h3>
                  <p style={{ fontSize:14, color: i%2===0 ? 'rgba(255,255,255,0.55)' : C.muted, lineHeight:1.75, margin:0 }}>{o.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section style={{ background:C.surface, padding:'clamp(56px,7vw,72px) 24px' }}>
        <div style={{ maxWidth:820, margin:'0 auto' }}>
          <Reveal>
            <div style={{ background:C.brand, borderRadius:20, padding:'clamp(32px,5vw,52px)', position:'relative', overflow:'hidden' }}>

              <div style={{ position:'relative' }}>
                <p style={{ fontFamily:'var(--font-display)', fontStyle:'italic', fontSize:'clamp(17px,2.5vw,24px)', fontWeight:600, color:'#fff', lineHeight:1.6, margin:'0 0 28px', maxWidth:560 }}>
                  "We used to spend hours reviewing each student's work. Now we open the dashboard and know exactly who needs help with what — before the exam, not after."
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:13 }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', background:`${C.green}25`, border:`2px solid ${C.green}55`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:17, fontWeight:800, color:C.green }}>A</div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:14, color:'#fff', margin:0 }}>Adaeze O.</p>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', margin:0 }}>Head of Academics, Lagos Tutorial Centre</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ background:'#fff', padding:'clamp(72px,8vw,96px) 24px' }}>
        <div style={mw}>
          <Reveal>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.greenLt, borderRadius:99, padding:'5px 14px', marginBottom:20 }}>
              <span style={{ fontWeight:700, fontSize:11, color:C.greenDk, textTransform:'uppercase', letterSpacing:'0.1em' }}>How it works</span>
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(26px,4vw,38px)', color:C.ink, letterSpacing:'-0.5px', marginBottom:12, lineHeight:1.2 }}>
              Up and running in under 5 minutes.
            </h2>
            <p style={{ fontSize:16, color:C.muted, marginBottom:52, lineHeight:1.75, maxWidth:400 }}>
              No IT setup. No student accounts. Just a link.
            </p>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,240px),1fr))', gap:32 }}>
            {HOW.map((h,i) => (
              <Reveal key={h.n} delay={i*65}>
                <div>
                  <div style={{ width:48, height:48, borderRadius:14, background:C.ctaLt, border:`2px solid ${C.cta}33`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, color:C.cta }}>{h.n}</span>
                  </div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:C.ink, marginBottom:10 }}>{h.title}</h3>
                  <p style={{ fontSize:14, color:C.muted, lineHeight:1.75, margin:0 }}>{h.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXAMS ── */}
      <section style={{ background:C.surface, padding:'clamp(56px,7vw,80px) 24px' }}>
        <div style={mw}>
          <Reveal>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(22px,3.5vw,32px)', color:C.ink, textAlign:'center', marginBottom:12, letterSpacing:'-0.4px' }}>
              Built to grow with your curriculum.
            </h2>
            <p style={{ fontSize:15, color:C.muted, textAlign:'center', maxWidth:420, margin:'0 auto 44px', lineHeight:1.75 }}>
              Starting with JAMB and WAEC — expanding to every major qualification worldwide.
            </p>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,168px),1fr))', gap:12, maxWidth:820, margin:'0 auto' }}>
            {EXAMS.map(e => (
              <div key={e.name} style={{ background:'#fff', border:`1.5px solid ${e.live ? `${C.cta}33` : C.border}`, borderRadius:13, padding:'17px 18px', opacity: e.live ? 1 : 0.6, transition:'all 0.18s' }}
                onMouseEnter={el => { if(e.live){el.currentTarget.style.transform='translateY(-2px)';el.currentTarget.style.borderColor=`${C.cta}66`}}}
                onMouseLeave={el => {el.currentTarget.style.transform='none';el.currentTarget.style.borderColor=e.live?`${C.cta}33`:C.border}}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:17, color: e.live ? C.cta : C.faint }}>{e.name}</span>
                  <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:99, background: e.live ? C.greenLt : '#F1F5F9', color: e.live ? C.greenDk : C.faint }}>
                    {e.live ? '● Live' : 'Coming'}
                  </span>
                </div>
                <p style={{ fontSize:11, color:C.faint, margin:0, lineHeight:1.5 }}>{e.full}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:C.brand, padding:'clamp(72px,8vw,96px) 24px' }}>
        <div style={{ maxWidth:600, margin:'0 auto', textAlign:'center' }}>
          <Reveal>
            <div style={{ fontSize:52, marginBottom:4 }}>🏫</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(26px,5vw,42px)', color:'#fff', letterSpacing:'-0.7px', lineHeight:1.12, marginBottom:16 }}>
              Help your students prepare.<br/>Know exactly who needs help.
            </h2>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.52)', marginBottom:40, lineHeight:1.75 }}>
              Set up in minutes. No contracts, no IT overhead, no student accounts.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/schools/register"
                style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, background:C.green, color:'#fff', padding:'15px 32px', borderRadius:12, textDecoration:'none', transition:'all 0.18s' }}
                onMouseEnter={e=>{e.currentTarget.style.background=C.greenDk;e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.background=C.green;e.currentTarget.style.transform='none'}}>
                Register your institution →
              </Link>
              <Link href="/schools/login"
                style={{ display:'inline-flex', alignItems:'center', fontSize:15, fontWeight:600, color:'rgba(255,255,255,0.6)', textDecoration:'none', padding:'15px 24px', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, transition:'all 0.18s' }}
                onMouseEnter={e=>{e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor='rgba(255,255,255,0.4)'}}
                onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.6)';e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}}>
                Log in
              </Link>
            </div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.28)', marginTop:20 }}>No credit card · No setup fees · Cancel anytime</p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#0D1B3E', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'28px 24px' }}>
        <div style={{ ...mw, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <AppLogo size={24}/>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', margin:0 }}>© 2025 ExamReady · A Learniie product</p>
          </div>
          <div style={{ display:'flex', gap:20 }}>
            {[['/', 'For students'],['/setup','Take a test'],['/community','Community']].map(([h,l]) => (
              <a key={l} href={h} style={{ fontSize:13, color:'rgba(255,255,255,0.35)', textDecoration:'none', transition:'color 0.15s' }}
                onMouseEnter={e=>e.target.style.color=C.green} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.35)'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}