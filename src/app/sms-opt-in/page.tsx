import type { Metadata } from 'next'
import { SmsOptInClient } from './SmsOptInClient'
import { SMS_OPT_IN_CANONICAL_URL } from '@/lib/sms-consent/constants'

export const metadata: Metadata = {
  title: 'Transactional SMS Opt-In | MyMedVisit',
  description:
    'Choose whether to receive transactional MyMedVisit text messages for verification, account security, and requested service notifications.',
  alternates: {
    canonical: SMS_OPT_IN_CANONICAL_URL,
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  openGraph: {
    title: 'Transactional SMS Opt-In | MyMedVisit',
    description:
      'Choose whether to receive transactional MyMedVisit text messages.',
    type: 'website',
    url: SMS_OPT_IN_CANONICAL_URL,
  },
}

export default function SmsOptInPage() {
  return <SmsOptInClient />
}
