import { Nunito, DM_Sans } from 'next/font/google'
import './globals.css'
import 'katex/dist/katex.min.css'

// Body/UI font: Nunito — warm, friendly, legible at all sizes
const nunito = Nunito({
  subsets:  ['latin'],
  weight:   ['400','500','600','700','800','900'],
  display:  'swap',
  variable: '--font-nunito',
})

// Headline font: DM Sans — confident, editorial, used by education platforms
// Clean without being cold; serious without being corporate
const dmSans = DM_Sans({
  subsets:  ['latin'],
  weight:   ['400','500','600','700','800'],
  display:  'swap',
  variable: '--font-display',
})

export const metadata = {
  title:       'ExamReady — Practice Past Questions & Ace Your Exams',
  description: 'Practice real past exam questions, get step-by-step explanations, and know exactly which topics to study. Exam prep for JAMB, WAEC, BECE and beyond — no sign-up needed.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nunito.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}