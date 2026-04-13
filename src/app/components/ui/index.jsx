// Badge
export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    brand:   'bg-brand-light text-brand',
    green:   'bg-green-light text-green-dark',
    amber:   'bg-amber-100 text-amber-700',
    red:     'bg-red-100 text-red-700',
    dark:    'bg-dark text-white',
    jamb:    'bg-brand-light text-brand',
    waec:    'bg-green-light text-green-dark',
    neco:    'bg-amber-100 text-amber-700',
  }
  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-[11px] px-2.5 py-1',
    md: 'text-[13px] px-3 py-1.5',
  }
  return (
    <span className={`inline-flex items-center font-bold rounded-full ${variants[variant] || variants.default} ${sizes[size] || sizes.sm} ${className}`}>
      {children}
    </span>
  )
}

// Card
export function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-card border border-slate-100 shadow-card ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

// Input
export function Input({
  label, error, hint, id,
  className = '', containerClassName = '',
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="block text-[13px] font-bold text-dark mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full px-4 py-3 rounded-input border-[1.5px] text-[15px] font-nunito
          text-dark placeholder:text-slate-300
          transition-all duration-[150ms]
          outline-none
          ${error
            ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/10'
            : 'border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/10'
          }
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-[12px] text-danger font-medium">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-[12px] text-muted">{hint}</p>}
    </div>
  )
}

// Textarea
export function Textarea({ label, error, id, className = '', containerClassName = '', ...props }) {
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="block text-[13px] font-bold text-dark mb-1.5">{label}</label>
      )}
      <textarea
        id={id}
        className={`
          w-full px-4 py-3 rounded-input border-[1.5px] text-[14px] font-nunito
          text-dark placeholder:text-slate-300
          transition-all duration-[150ms] outline-none resize-y min-h-[80px]
          ${error
            ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/10'
            : 'border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/10'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-[12px] text-danger font-medium">{error}</p>}
    </div>
  )
}

// Modal
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-white rounded-card shadow-2xl w-full max-w-[400px] animate-scale-in">
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <p className="text-[16px] font-black text-dark">{title}</p>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 pb-5 flex gap-2.5">{footer}</div>}
      </div>
    </div>
  )
}

// Toast
export function Toast({ show, message, type = 'default' }) {
  const colors = {
    default: 'bg-dark text-white',
    success: 'bg-green-600 text-white',
    error:   'bg-danger text-white',
  }
  return (
    <div
      aria-live="polite"
      className={`
        fixed bottom-6 left-1/2 z-[100] px-5 py-2.5 rounded-full
        text-[13px] font-semibold whitespace-nowrap shadow-lg
        transition-all duration-300
        ${colors[type] || colors.default}
      `}
      style={{
        transform: `translateX(-50%) translateY(${show ? '0' : '80px'})`,
        opacity: show ? 1 : 0,
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  )
}

// Skeleton loaders
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-card border border-slate-100 p-5 ${className}`}>
      <Skeleton className="h-4 w-1/3 mb-3" />
      <SkeletonText lines={3} />
    </div>
  )
}

// Spinner
export function Spinner({ size = 24, color = '#2D3CE6' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.75s linear infinite' }}
    >
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="9" stroke="#E2E8F0" strokeWidth="2.5"/>
      <path d="M21 12a9 9 0 00-9-9" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

// Empty state
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <p className="text-[16px] font-bold text-dark mb-2">{title}</p>
      {description && <p className="text-[14px] text-muted max-w-xs leading-relaxed mb-6">{description}</p>}
      {action}
    </div>
  )
}

// Error state
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 6v5M10 14h.01" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M8.66 2.5L1.34 14.5A1.5 1.5 0 002.68 17h14.64a1.5 1.5 0 001.34-2.5L11.34 2.5a1.5 1.5 0 00-2.68 0z" stroke="#DC2626" strokeWidth="1.5"/>
        </svg>
      </div>
      <p className="text-[15px] font-bold text-dark mb-1.5">Something went wrong</p>
      <p className="text-[13px] text-muted mb-5 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-brand text-white px-5 py-2.5 rounded-[10px] font-bold text-[13px] hover:bg-brand-dark transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
