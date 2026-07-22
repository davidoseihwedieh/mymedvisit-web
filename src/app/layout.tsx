import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { RevealProvider } from '@/components/RevealProvider'
import SchemaMarkup from '@/components/SchemaMarkup'

export const metadata: Metadata = {
  title: 'MyMedVisit — Your health, remembered by voice',
  description: 'MyMedVisit captures doctor visits and daily health metrics through voice, then turns them into clear, shareable insights for families.',
  keywords: ['health', 'medical visits', 'voice summarization', 'AI', 'family health', 'caregiving', 'senior health'],
  openGraph: {
    title: 'MyMedVisit — Your health, remembered by voice',
    description: 'Capture doctor visits and daily health metrics through voice. Clear, shareable insights for families.',
    type: 'website',
    url: 'https://mymedvisit.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <SchemaMarkup />
        <RevealProvider>
          <Navbar />
          {children}
          <Footer />
        </RevealProvider>
      </body>
    </html>
  )
}
