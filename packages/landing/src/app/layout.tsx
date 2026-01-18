import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quolar - AI-Powered Test Automation',
  description: 'Convert Linear tickets to self-healing Playwright tests. Part of the AttorneyShare ecosystem.',
  keywords: ['test automation', 'playwright', 'linear', 'AI', 'e2e testing', 'claude code'],
  authors: [{ name: 'Montinou' }],
  openGraph: {
    title: 'Quolar - AI-Powered Test Automation',
    description: 'Convert Linear tickets to self-healing Playwright tests',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-void min-h-screen">
        {children}
      </body>
    </html>
  )
}
