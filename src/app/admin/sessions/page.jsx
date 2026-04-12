import { Suspense } from 'react'
import SessionsInner from './SessionsInner'

export default function SessionsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-brand border-t-transparent animate-spin"/>
      </div>
    }>
      <SessionsInner />
    </Suspense>
  )
}
