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

export default function SchoolLoginPage() {
  const router    = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.'); return
    }

    setLoading(true); setError(null)

    try {
      const res  = await fetch('/api/schools/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.')
        return
      }

      router.push('/schools/dashboard')
      router.refresh()
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
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <Link href="/schools" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 32 }}>
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="9" fill="#0B1120"/><path d="M18 9v18" stroke="#E6A817" strokeWidth="1.4" strokeLinecap="round"/><path d="M18 10C14 10 9 12 9 18s5 8 9 8" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7"/><path d="M18 10c4 0 9 2 9 8s-5 8-9 8" stroke="#E6A817" strokeWidth="1.6" strokeLinecap="round" fill="none"/></svg>
          <span style={{ fontWeight: 900, fontSize: 16, color: '#0A0A0A' }}>Exam Ready Test</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#1B4FD8', background: '#EEF0FE', padding: '2px 9px', borderRadius: 99 }}>Schools</span>
        </Link>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 18, padding: '36px 32px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

          <h1 style={{ fontWeight: 900, fontSize: 24, color: '#0A0A0A', marginBottom: 6, letterSpacing: '-0.4px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500, marginBottom: 28 }}>
            Log in to your school dashboard.
          </p>

          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@school.ng"
              style={inp}
              onFocus={e => e.target.style.borderColor = '#1B4FD8'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={lbl}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              style={inp}
              onFocus={e => e.target.style.borderColor = '#1B4FD8'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', marginBottom: 18 }}>
              <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 600, margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading || !email.trim() || !password}
            style={{
              width: '100%', padding: '14px 0', border: 'none', borderRadius: 10,
              background: (!email.trim() || !password) ? '#E2E8F0' : loading ? '#93A3D8' : '#1B4FD8',
              color: (!email.trim() || !password) ? '#94A3B8' : '#fff',
              fontWeight: 800, fontSize: 15,
              cursor: (!email.trim() || !password || loading) ? 'not-allowed' : 'pointer',
              fontFamily: 'Nunito, sans-serif', transition: 'all 0.15s',
            }}>
            {loading ? 'Logging in…' : 'Log in →'}
          </button>

          <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 22 }}>
            Don't have an account?{' '}
            <Link href="/schools/register" style={{ color: '#1B4FD8', fontWeight: 700, textDecoration: 'none' }}>
              Register your school
            </Link>
          </p>
        </div>

        <p style={{ fontSize: 12, color: '#CBD5E1', textAlign: 'center', marginTop: 20 }}>
          Student?{' '}
          <Link href="/" style={{ color: '#94A3B8', textDecoration: 'none', fontWeight: 600 }}>
            Go to the student platform →
          </Link>
        </p>
      </div>
    </div>
  )
}