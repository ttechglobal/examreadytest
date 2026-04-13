'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SchoolRegisterPage() {
  const router = useRouter()
  const [step,     setStep]     = useState(1)
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'school', country: 'NG', city: '',
    contactName: '', contactEmail: '', contactPhone: '', password: '', confirmPassword: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const inp = { width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '11px 14px', fontSize: 14, fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#0A0A0A', background: '#fff' }
  const lbl = { display: 'block', fontWeight: 700, fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }

  async function handleSubmit() {
    setError(null)
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/schools/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }
      router.push('/schools/dashboard')
    } catch { setError('Network error. Please try again.') }
    finally   { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <Link href="/schools" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 28 }}>
          <div style={{ width: 28, height: 28, background: '#2D3CE6', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>E</div>
          <span style={{ fontWeight: 900, fontSize: 15, color: '#0A0A0A' }}>Exam Ready Test</span>
        </Link>

        <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 16, padding: 32 }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {[1,2].map(n => (
              <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: n <= step ? '#2D3CE6' : '#E2E8F0', transition: 'background 0.3s' }}/>
            ))}
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Step {step} of 2</p>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: '#0A0A0A', marginBottom: 24 }}>
            {step === 1 ? 'Institution details' : 'Contact & login'}
          </h1>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={lbl}>Institution name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Kings High School" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Institution type *</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[['school','School'],['tutorial_centre','Tutorial Centre']].map(([v,l]) => (
                    <button key={v} onClick={() => set('type', v)}
                      style={{ flex: 1, padding: '11px 0', border: `1.5px solid ${form.type === v ? '#2D3CE6' : '#E2E8F0'}`, borderRadius: 9, background: form.type === v ? '#EEF0FE' : '#fff', color: form.type === v ? '#2D3CE6' : '#64748B', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Country</label>
                  <select value={form.country} onChange={e => set('country', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="NG">Nigeria</option>
                    <option value="GH">Ghana</option>
                    <option value="KE">Kenya</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>City / State</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Lagos" style={inp}/>
                </div>
              </div>
              <button onClick={() => { if (form.name && form.type) setStep(2) }}
                disabled={!form.name}
                style={{ padding: '13px 0', border: 'none', borderRadius: 10, background: form.name ? '#2D3CE6' : '#E2E8F0', color: form.name ? '#fff' : '#94A3B8', fontWeight: 800, fontSize: 15, cursor: form.name ? 'pointer' : 'not-allowed', fontFamily: 'Nunito, sans-serif', marginTop: 6 }}>
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={lbl}>Contact person name *</label>
                <input value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="e.g. Mrs. Adeyemi" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Contact email *</label>
                <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="admin@school.ng" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Phone number <span style={{ fontWeight: 400, color: '#C4C4C4' }}>(optional)</span></label>
                <input value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+234..." style={inp}/>
              </div>
              <div>
                <label style={lbl}>Password *</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} style={inp}/>
              </div>
              <div>
                <label style={lbl}>Confirm password *</label>
                <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} style={inp}/>
              </div>
              {error && <p style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '13px 0', border: '1.5px solid #E2E8F0', borderRadius: 10, background: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', color: '#374151' }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading || !form.contactEmail || !form.password}
                  style={{ flex: 2, padding: '13px 0', border: 'none', borderRadius: 10, background: '#2D3CE6', color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'Nunito, sans-serif' }}>
                  {loading ? 'Creating account…' : 'Create account →'}
                </button>
              </div>
            </div>
          )}

          <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 20 }}>
            Already have an account?{' '}
            <Link href="/schools/login" style={{ color: '#2D3CE6', fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
