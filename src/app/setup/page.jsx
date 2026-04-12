import { Suspense } from 'react'
import SetupInner from './SetupInner'

export default function SetupPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-surface font-nunito flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin"/>
      </main>
    }>
      <SetupInner />
    </Suspense>
  )
}
