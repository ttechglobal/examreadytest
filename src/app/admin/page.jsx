'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Invalid credentials') }
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 font-inter">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 bg-brand rounded-[9px] flex items-center justify-center text-white font-black text-lg">L</div>
          <div>
            <p className="text-white font-bold text-[16px] leading-none">Learniie</p>
            <p className="text-slate-500 text-[11px] font-medium mt-0.5">Admin Portal</p>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-2xl border border-white/[0.06] p-6">
          <h1 className="text-white font-bold text-[18px] mb-1">Sign in</h1>
          <p className="text-slate-400 text-[13px] mb-6">Access the Learniie admin dashboard</p>

          {error && (
            <div className="bg-red-900/30 border border-red-800/50 text-red-400 text-[13px] px-3.5 py-2.5 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="admin@learniie.com"
                className="w-full bg-[#0F172A] border border-white/[0.08] rounded-xl px-3.5 py-3 text-[14px] text-white placeholder:text-slate-600 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full bg-[#0F172A] border border-white/[0.08] rounded-xl px-3.5 py-3 text-[14px] text-white placeholder:text-slate-600 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full mt-2 bg-brand text-white font-bold text-[14px] py-3.5 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
