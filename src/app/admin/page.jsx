'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router   = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Invalid credentials')
        return
      }
      router.push('/admin/dashboard')
    } catch (err) {
      setError('Network error — check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', padding: '12px 14px', fontSize: 14,
    background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#fff', outline: 'none',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  }
  const lbl = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: '#64748B', textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: 7,
  }

  return (
    <main style={{
      minHeight: '100vh', background: '#0F172A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, background: '#2D3CE6', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16 }}>L</div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>Learniie</p>
            <p style={{ color: '#475569', fontSize: 11, margin: 0 }}>Admin Portal</p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Sign in</h1>
          <p style={{ color: '#64748B', fontSize: 13, marginBottom: 24 }}>Access the admin dashboard</p>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 13, padding: '10px 14px', borderRadius: 9, marginBottom: 18 }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="admin@learniie.com"
              style={inp}
              onFocus={e => e.target.style.borderColor = '#2D3CE6'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={lbl}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={inp}
              onFocus={e => e.target.style.borderColor = '#2D3CE6'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '13px 0', border: 'none',
              borderRadius: 10, background: loading ? '#1e2cc0' : '#2D3CE6',
              color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', opacity: loading ? 0.7 : 1,
              transition: 'all 0.15s',
            }}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </div>
      </div>
    </main>
  )
}