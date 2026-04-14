'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inp = {
  width: '100%', padding: '12px 14px', fontSize: 15,
  border: '1.5px solid #E2E8F0', borderRadius: 10,
  fontFamily: 'Nunito, sans-serif', fontWeight: 500,
  color: '#0A0A0A', background: '#fff', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
}
const lbl = {
  display: 'block', fontSize: 12, fontWeight: 700,
  color: '#374151', textTransform: 'uppercase',
  letterSpacing: '0.07em', marginBottom: 7,
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  )
}

export default function SchoolRegisterPage() {
  const router  = useRouter()
  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [form,    setForm]    = useState({
    name: '', type: 'school', country: 'NG', city: '',
    contactName: '', contactEmail: '', contactPhone: '',
    password: '', confirmPassword: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function validateStep1() {
    if (!form.name.trim()) { setError('Institution name is required.'); return false }
    setError(null); return true
  }

  async function handleSubmit() {
    if (!form.contactName.trim()) { setError('Contact name is required.'); return }
    if (!form.contactEmail.trim()) { setError('Email address is required.'); return }
    if (!form.password) { setError('Password is required.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }

    setLoading(true); setError(null)

    try {
      const res  = await fetch('/api/schools/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.')
        return
      }

      router.push('/schools/dashboard')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F8F9FA',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px', fontFamily: 'Nunito, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Logo */}
        <Link href="/schools" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 32 }}>
          <div style={{ width: 30, height: 30, background: '#2D3CE6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>E</div>
          <span style={{ fontWeight: 900, fontSize: 16, color: '#0A0A0A' }}>Exam Ready Test</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#2D3CE6', background: '#EEF0FE', padding: '2px 9px', borderRadius: 99 }}>Schools</span>
        </Link>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 18, padding: '36px 32px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {[1, 2].map(n => (
              <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: n <= step ? '#2D3CE6' : '#E2E8F0', transition: 'background 0.3s' }} />
            ))}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Step {step} of 2
          </p>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: '#0A0A0A', marginBottom: 24, letterSpacing: '-0.3px' }}>
            {step === 1 ? 'About your institution' : 'Contact & password'}
          </h1>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <Field label="Institution name *">
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Kings High School"
                  style={inp}
                  onFocus={e => e.target.style.borderColor = '#2D3CE6'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </Field>

              <Field label="Type *">
                <div style={{ display: 'flex', gap: 10 }}>
                  {[['school', 'School'], ['tutorial_centre', 'Tutorial Centre']].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => set('type', val)}
                      style={{
                        flex: 1, padding: '11px 0', borderRadius: 10, cursor: 'pointer',
                        fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14,
                        border: `1.5px solid ${form.type === val ? '#2D3CE6' : '#E2E8F0'}`,
                        background: form.type === val ? '#EEF0FE' : '#fff',
                        color: form.type === val ? '#2D3CE6' : '#64748B',
                        transition: 'all 0.15s',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Country">
                  <select value={form.country} onChange={e => set('country', e.target.value)}
                    style={{ ...inp, cursor: 'pointer' }}>
                    <option value="NG">Nigeria</option>
                    <option value="GH">Ghana</option>
                    <option value="KE">Kenya</option>
                    <option value="ZA">South Africa</option>
                    <option value="OTHER">Other</option>
                  </select>
                </Field>
                <Field label="City / State">
                  <input value={form.city} onChange={e => set('city', e.target.value)}
                    placeholder="e.g. Lagos" style={inp}
                    onFocus={e => e.target.style.borderColor = '#2D3CE6'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  />
                </Field>
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 16, fontWeight: 600 }}>{error}</p>
              )}

              <button type="button"
                onClick={() => { if (validateStep1()) setStep(2) }}
                style={{
                  width: '100%', padding: '14px 0', border: 'none', borderRadius: 10,
                  background: form.name.trim() ? '#2D3CE6' : '#E2E8F0',
                  color: form.name.trim() ? '#fff' : '#94A3B8',
                  fontWeight: 800, fontSize: 15, cursor: form.name.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'Nunito, sans-serif', transition: 'all 0.15s',
                }}>
                Continue →
              </button>
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <Field label="Contact person name *">
                <input value={form.contactName} onChange={e => set('contactName', e.target.value)}
                  placeholder="e.g. Mrs. Adeyemi" style={inp}
                  onFocus={e => e.target.style.borderColor = '#2D3CE6'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </Field>

              <Field label="Email address *">
                <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)}
                  placeholder="admin@school.ng" style={inp}
                  onFocus={e => e.target.style.borderColor = '#2D3CE6'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </Field>

              <Field label="Phone number (optional)">
                <input value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)}
                  placeholder="+234 800 000 0000" style={inp}
                  onFocus={e => e.target.style.borderColor = '#2D3CE6'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </Field>

              <Field label="Password *">
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Minimum 8 characters" style={inp}
                  onFocus={e => e.target.style.borderColor = '#2D3CE6'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </Field>

              <Field label="Confirm password *">
                <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Re-enter your password" style={inp}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  onFocus={e => e.target.style.borderColor = '#2D3CE6'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </Field>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', marginBottom: 18 }}>
                  <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 600, margin: 0 }}>{error}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => { setStep(1); setError(null) }}
                  style={{
                    flex: 1, padding: '14px 0', border: '1.5px solid #E2E8F0',
                    borderRadius: 10, background: '#fff', fontWeight: 700,
                    fontSize: 14, cursor: 'pointer', color: '#374151',
                    fontFamily: 'Nunito, sans-serif',
                  }}>
                  ← Back
                </button>
                <button type="button" onClick={handleSubmit} disabled={loading}
                  style={{
                    flex: 2, padding: '14px 0', border: 'none', borderRadius: 10,
                    background: loading ? '#93A3D8' : '#2D3CE6',
                    color: '#fff', fontWeight: 800, fontSize: 15,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Nunito, sans-serif', transition: 'all 0.15s',
                  }}>
                  {loading ? 'Creating account…' : 'Create account →'}
                </button>
              </div>
            </>
          )}

          <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 22 }}>
            Already have an account?{' '}
            <Link href="/schools/login" style={{ color: '#2D3CE6', fontWeight: 700, textDecoration: 'none' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
