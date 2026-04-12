import { Nunito } from 'next/font/google'
import './globals.css'
import 'katex/dist/katex.min.css'

const nunito = Nunito({
  subsets:  ['latin'],
  weight:   ['400','500','600','700','800','900'],
  display:  'swap',
  variable: '--font-nunito',
})

export const metadata = {
  title:       'Learniie Exam Prep — Know Exactly Where You Stand',
  description: 'Take 40 past questions. Get a personalised topic-by-topic breakdown. Free, instant, no sign-up.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>{children}</body>
    </html>
  )
}
