import { Suspense } from 'react'
import QuestionsInner from './QuestionsInner'

export default function QuestionsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-brand border-t-transparent animate-spin"/>
      </div>
    }>
      <QuestionsInner />
    </Suspense>
  )
}