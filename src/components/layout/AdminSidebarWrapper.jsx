'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.2" fill="currentColor"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".5"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".5"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".5"/></svg> },
  { href: '/admin/questions', label: 'Questions', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 4h11M2 7.5h7M2 11h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { href: '/admin/upload',    label: 'Upload',    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 9.5V2.5M4.5 5.5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { href: '/admin/sessions',  label: 'Sessions',  icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 12V8.5M5.5 12V5M9 12V7M12.5 12V2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { href: '/admin/community', label: 'Community', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="5" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.3"/><circle cx="10.5" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.3"/><path d="M1 13c0-2.2 1.8-4 4-4s4 1.8 4 4M8 10.5c.6-.3 1.2-.5 2-.5 2.2 0 4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
]

function Sidebar({ onClose }) {
  const pathname = usePathname()
  const active = href => pathname.startsWith(href)

  return (
    <aside className="w-[220px] bg-[#0F172A] flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-[18px] border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-[28px] h-[28px] bg-brand rounded-[7px] flex items-center justify-center text-white font-black text-sm shrink-0">L</div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Learniie</p>
            <p className="text-slate-500 text-[10px] font-medium mt-[3px]">Admin Portal</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-white lg:hidden ml-2">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 pt-3 pb-2">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.08em] px-2 pb-1.5">Main</p>
        {NAV.slice(0, 3).map(item => (
          <Link
            key={item.href} href={item.href} onClick={onClose}
            className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-[8px] text-[13px] font-semibold w-full transition-colors mb-0.5
              ${active(item.href) ? 'bg-[#1E293B] text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'}`}
          >
            <span className={active(item.href) ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.08em] px-2 pb-1.5 mt-4">Analytics</p>
        {NAV.slice(3, 4).map(item => (
          <Link
            key={item.href} href={item.href} onClick={onClose}
            className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-[8px] text-[13px] font-semibold w-full transition-colors mb-0.5
              ${active(item.href) ? 'bg-[#1E293B] text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'}`}
          >
            <span className={active(item.href) ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.08em] px-2 pb-1.5 mt-4">Community</p>
        {NAV.slice(4).map(item => (
          <Link
            key={item.href} href={item.href} onClick={onClose}
            className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-[8px] text-[13px] font-semibold w-full transition-colors mb-0.5
              ${active(item.href) ? 'bg-[#1E293B] text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'}`}
          >
            <span className={active(item.href) ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-2 pb-3 border-t border-white/[0.07] pt-2">
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className="flex items-center gap-2.5 px-2.5 py-[9px] rounded-[8px] text-[13px] font-semibold text-slate-500 hover:text-slate-400 hover:bg-white/[0.04] transition-colors w-full">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M5.5 13H3a1 1 0 01-1-1V3a1 1 0 011-1h2.5M10 10.5l3-3-3-3M13 7.5H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}

export default function AdminSidebarWrapper() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-30 w-9 h-9 bg-[#0F172A] rounded-lg flex items-center justify-center text-white"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="flex-shrink-0">
            <Sidebar onClose={() => setOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
