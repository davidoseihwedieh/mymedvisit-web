import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { RevealProvider } from '@/components/RevealProvider'

// Self-hosted at build time (static font files emitted under
// /_next/static/media), then served from this site's own origin - not
// fetched from fonts.googleapis.com/fonts.gstatic.com at runtime.
//
// Sitewide grep for every font-{weight} Tailwind utility (cross-checked
// against the computed default weight of 400 for unstyled headings/body
// text) shows only 400/500/600/700 are ever used, and no italic. Tried
// requesting that exact discrete weight list instead of 'variable' to
// shrink the payload - measured byte-for-byte identical output (same
// /_next/static/media file hashes, same 300,624-byte total): Google
// serves both Fraunces and Inter only as variable fonts, so every
// weight's @font-face rule already points at the same underlying
// variable-range files regardless of which weights are requested; no
// static-only subset exists to fetch instead. There is no italic
// @font-face at all already (the one 'font-style:italic' string in the
// built CSS is Tailwind's own .italic utility class, unrelated).
// Keeping 'variable' since it costs nothing extra over an explicit list
// and remains correct if a future page uses a weight not in that list.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-fraunces',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://mymedvisit.app'),
  title: 'MyMedVisit — Longitudinal clinical context',
  description:
    'A care-team platform that turns patient and caregiver reports, connected devices, and health-record context into reviewable clinical information between visits.',
  keywords: [
    'remote patient monitoring',
    'patient-reported outcomes',
    'caregiver reporting',
    'oncology symptom monitoring',
    'COPD',
    'clinical workflow',
    'FHIR',
  ],
  icons: {
    icon: '/mmv-icon.png',
    apple: '/mmv-icon.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyMedVisit — Longitudinal clinical context',
    description: 'Patient and caregiver observations, connected devices, and care-team review between visits.',
    images: ['/mmv-social.png'],
  },
  openGraph: {
    title: 'MyMedVisit — Longitudinal clinical context',
    description:
      'Patient and caregiver observations, connected devices, and care-team review between visits.',
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
    <html className={`${fraunces.variable} ${inter.variable}`} lang="en">
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
