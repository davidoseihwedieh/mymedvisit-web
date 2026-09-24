import type { Metadata } from 'next'
import { SmsOptInClient } from './SmsOptInClient'
import { SMS_OPT_IN_CANONICAL_URL } from '@/lib/sms-consent/constants'

export const metadata: Metadata = {
  title: 'One-Time Verification SMS Opt-In | MyMedVisit',
  description:
    'Choose whether to receive one-time verification code text messages from MyMedVisit, operated by SUGARCANEHAYES.',
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
    title: 'One-Time Verification SMS Opt-In | MyMedVisit',
    description:
      'Choose whether to receive one-time verification code text messages from MyMedVisit, operated by SUGARCANEHAYES.',
    type: 'website',
    url: SMS_OPT_IN_CANONICAL_URL,
  },
}

export default function SmsOptInPage() {
  return <SmsOptInClient />
}
