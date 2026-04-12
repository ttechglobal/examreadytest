import AdminSidebarWrapper from '@/components/layout/AdminSidebarWrapper'

export const metadata = { title: 'Admin — Learniie Exam Prep' }

export default function AdminLayout({ children }) {
  return (
    <div data-admin="true" className="flex min-h-screen bg-slate-50">
      <AdminSidebarWrapper />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
