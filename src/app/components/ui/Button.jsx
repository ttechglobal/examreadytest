'use client'

const VARIANTS = {
  primary:   'bg-brand text-white hover:bg-brand-dark active:scale-[.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm hover:shadow-brand-glow',
  secondary: 'bg-white text-brand border-[1.5px] border-brand hover:bg-brand-light active:scale-[.98] disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed',
  ghost:     'bg-transparent text-muted hover:bg-slate-100 active:scale-[.98] disabled:text-slate-300 disabled:cursor-not-allowed',
  danger:    'bg-danger text-white hover:bg-red-700 active:scale-[.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed',
  'danger-outline': 'bg-transparent text-danger border-[1.5px] border-danger hover:bg-red-50 active:scale-[.98]',
}

const SIZES = {
  sm:  'px-3.5 py-2 text-[13px] font-semibold',
  md:  'px-5 py-3 text-[14px] font-bold',
  lg:  'px-7 py-4 text-[15px] font-bold',
  xl:  'px-8 py-5 text-[16px] font-bold',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'btn',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const roundedMap = { btn: 'rounded-[10px]', pill: 'rounded-full', card: 'rounded-card' }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-[150ms] ease-out
        select-none whitespace-nowrap
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${roundedMap[rounded] || 'rounded-[10px]'}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity=".3" strokeWidth="2"/>
            <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{typeof loading === 'string' ? loading : 'Loading…'}</span>
        </>
      ) : children}
    </button>
  )
}
