export function AdminTopbar({ title, action }) {
  return (
    <div className="bg-white border-b border-slate-100 px-6 h-[52px] flex items-center justify-between shrink-0">
      <p className="text-[15px] font-bold text-dark">{title}</p>
      <div className="flex items-center gap-3">
        {action}
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted hidden sm:block">admin@learniie.com</span>
          <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand text-[12px] font-bold">A</div>
        </div>
      </div>
    </div>
  )
}
