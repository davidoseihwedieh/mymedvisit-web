import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { RevealProvider } from '@/components/RevealProvider'

export const metadata: Metadata = {
  metadataBase: new URL('https://mymedvisit.app'),
  title: 'MyMedVisit — Your health, remembered by voice',
  description:
    'MyMedVisit captures doctor visits and daily health metrics through voice, then turns them into clear, shareable insights for families.',
  keywords: [
    'health',
    'medical visits',
    'voice summarization',
    'AI',
    'family health',
    'caregiving',
    'senior health',
  ],
  icons: {
    icon: '/mmv-icon.png',
    apple: '/mmv-icon.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyMedVisit — Your health, remembered by voice',
    description: 'Capture doctor visits and daily health metrics through voice. Clear, shareable insights for families.',
    images: ['/mmv-social.png'],
  },
  openGraph: {
    title: 'MyMedVisit — Your health, remembered by voice',
    description:
      'Capture doctor visits and daily health metrics through voice. Clear, shareable insights for families.',
    type: 'website',
    url: 'https://mymedvisit.app',
    images: [
      {
        url: '/mmv-social.png',
        width: 2009,
        height: 783,
        alt: 'MyMedVisit — The patient voice between visits.',
      },
    ],
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
        <RevealProvider>
          <Navbar />
          {children}
          <Footer />
        </RevealProvider>
      </body>
    </html>
  )
}
