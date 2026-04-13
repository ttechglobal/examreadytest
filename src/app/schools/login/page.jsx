'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SchoolLoginPage() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error,  setError]    = useState(null)
  const [loading, setLoading] = useState(false)

  const inp = { width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '11px 14px', fontSize: 14, fontFamily: 'Nunito, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#0A0A0A', background: '#fff' }
  const lbl = { display: 'block', fontWeight: 700, fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }

  async function handleLogin() {
    setError(null); setLoading(true)
    try {
      const res  = await fetch('/api/schools/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      router.push('/schools/dashboard')
    } catch { setError('Network error. Please try again.') }
    finally   { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link href="/schools" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 28 }}>
          <div style={{ width: 28, height: 28, background: '#2D3CE6', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>E</div>
          <span style={{ fontWeight: 900, fontSize: 15, color: '#0A0A0A' }}>Exam Ready Test</span>
        </Link>
        <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 16, padding: 32 }}>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: '#0A0A0A', marginBottom: 6 }}>School login</h1>
          <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 28 }}>Log in to your institution dashboard.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div><label style={lbl}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@school.ng" style={inp}/></div>
            <div><label style={lbl}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={inp}/></div>
            {error && <p style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>{error}</p>}
            <button onClick={handleLogin} disabled={loading || !email || !password}
              style={{ padding: '13px 0', border: 'none', borderRadius: 10, background: '#2D3CE6', color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'Nunito, sans-serif' }}>
              {loading ? 'Logging in…' : 'Log in →'}
            </button>
          </div>
          <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 20 }}>
            Don't have an account?{' '}
            <Link href="/schools/register" style={{ color: '#2D3CE6', fontWeight: 700, textDecoration: 'none' }}>Register your school</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
