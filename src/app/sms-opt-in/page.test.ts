import fs from 'node:fs'
import path from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import jsQR from 'jsqr'
import { describe, expect, it } from 'vitest'
import { metadata } from './page'
import { SmsOptInClient } from './SmsOptInClient'
import TermsAndConditions from '../terms/page'
import PrivacyPolicy from '../privacy/page'
import { SMS_OPT_IN_CANONICAL_URL } from '@/lib/sms-consent/constants'

describe('SMS opt-in route', () => {
  it('uses exact canonical metadata and remains noindex while disconnected', () => {
    expect(metadata.title).toBe('One-Time Verification SMS Opt-In | MyMedVisit')
    expect(metadata.description).toBeTruthy()
    expect(metadata.alternates).toMatchObject({
      canonical: SMS_OPT_IN_CANONICAL_URL,
    })
    expect(metadata.robots).toMatchObject({ index: false, follow: true })
  })

  it('renders an inert native form that cannot serialize consent into a URL', () => {
    const markup = renderToStaticMarkup(createElement(SmsOptInClient))
    const staticDocument = new DOMParser().parseFromString(
      `<!doctype html>${markup}`,
      'text/html',
    )
    const form = staticDocument.querySelector('form')
    const phone = staticDocument.querySelector<HTMLInputElement>('#sms-phone')
    const consent =
      staticDocument.querySelector<HTMLInputElement>('#sms-consent')
    const attestation = staticDocument.querySelector<HTMLInputElement>(
      '#authorized-number-attestation',
    )
    const submit = staticDocument.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    )

    expect(form).not.toBeNull()
    expect(phone).not.toBeNull()
    expect(consent).not.toBeNull()
    expect(attestation).not.toBeNull()
    expect(submit).not.toBeNull()
    expect(form?.hasAttribute('action')).toBe(false)
    expect(phone?.hasAttribute('name')).toBe(false)
    expect(consent?.hasAttribute('name')).toBe(false)
    expect(attestation?.hasAttribute('name')).toBe(false)
    expect(phone?.disabled).toBe(true)
    expect(consent?.disabled).toBe(true)
    expect(attestation?.disabled).toBe(true)
    expect(submit?.disabled).toBe(true)
    expect(
      staticDocument.getElementById('sms-form-unavailable')?.textContent,
    ).toContain('No consent has been sent or recorded.')

    phone!.disabled = false
    phone!.value = '+15555550123'
    consent!.disabled = false
    consent!.checked = true
    attestation!.disabled = false
    attestation!.checked = true
    submit!.disabled = false

    const params = new URLSearchParams()
    for (const [name, value] of new FormData(form!).entries()) {
      params.append(name, String(value))
    }
    const nativeSubmissionUrl = new URL(SMS_OPT_IN_CANONICAL_URL)
    nativeSubmissionUrl.search = params.toString()

    expect(params.toString()).toBe('')
    expect(nativeSubmissionUrl.search).toBe('')
    expect(nativeSubmissionUrl.href).not.toContain('phone=')
    expect(nativeSubmissionUrl.href).not.toContain('sms-consent=')
    expect(nativeSubmissionUrl.href).not.toContain(
      'authorized-number-attestation=',
    )
    expect(nativeSubmissionUrl.href).not.toContain('15555550123')
    expect(nativeSubmissionUrl.href).not.toContain('=on')
  })

  it('encodes only the exact canonical URL in the QR module matrix', () => {
    const svg = fs.readFileSync(
      path.resolve(process.cwd(), 'public/sms-opt-in-qr.svg'),
      'utf8',
    )
    const viewBoxMatch = svg.match(/viewBox="0 0 (\d+) (\d+)"/)
    expect(viewBoxMatch).not.toBeNull()
    const moduleWidth = Number(viewBoxMatch?.[1])
    const moduleHeight = Number(viewBoxMatch?.[2])
    const scale = 10
    const pixels = new Uint8ClampedArray(
      moduleWidth * scale * moduleHeight * scale * 4,
    )
    pixels.fill(255)

    const modulePattern = /M(\d+) (\d+)h1v1h-1z/g
    let match = modulePattern.exec(svg)
    while (match) {
      const moduleX = Number(match[1])
      const moduleY = Number(match[2])
      for (let y = moduleY * scale; y < (moduleY + 1) * scale; y += 1) {
        for (let x = moduleX * scale; x < (moduleX + 1) * scale; x += 1) {
          const pixel = (y * moduleWidth * scale + x) * 4
          pixels[pixel] = 0
          pixels[pixel + 1] = 0
          pixels[pixel + 2] = 0
        }
      }
      match = modulePattern.exec(svg)
    }

    const decoded = jsQR(pixels, moduleWidth * scale, moduleHeight * scale)

    expect(svg).toContain(
      `<desc id="desc">Encodes ${SMS_OPT_IN_CANONICAL_URL}</desc>`,
    )
    expect(decoded?.data).toBe(SMS_OPT_IN_CANONICAL_URL)
  })

  it('declares safe route headers without guessing a reCAPTCHA CSP host', () => {
    const vercelConfig = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'vercel.json'), 'utf8'),
    ) as {
      headers: Array<{
        source: string
        headers: Array<{ key: string; value: string }>
      }>
    }
    const routeHeaders = vercelConfig.headers.find(
      (entry) => entry.source === '/sms-opt-in',
    )?.headers

    expect(routeHeaders).toEqual(
      expect.arrayContaining([
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Cache-Control', value: 'no-store' },
        { key: 'X-Frame-Options', value: 'DENY' },
        {
          key: 'Content-Security-Policy',
          value: "base-uri 'none'; frame-ancestors 'none'; object-src 'none'",
        },
      ]),
    )
    const serialized = JSON.stringify(routeHeaders)
    expect(serialized).not.toMatch(/google|recaptcha|\*/i)
  })
})

describe('OTP-only legal-page contract', () => {
  it('keeps Terms and Privacy aligned to the OTP-only program and effective date', () => {
    const terms = renderToStaticMarkup(createElement(TermsAndConditions))
    const privacy = renderToStaticMarkup(createElement(PrivacyPolicy))
    for (const markup of [terms, privacy]) {
      expect(markup).toContain('September 24, 2026')
      expect(markup).toContain('one-time verification code')
      expect(markup).toContain(
        'Message frequency varies based on verification requests',
      )
      expect(markup).toContain('Reply STOP to opt out or HELP for help')
      expect(markup).toContain('SUGARCANEHAYES')
      expect(markup).toContain(
        'does not authorize marketing, reminders, symptom check-ins, or care-workflow notifications',
      )
    }
  })
})

describe('OTP-only public evidence assets', () => {
  it('contains desktop and mobile screenshots with no phone or contact PII', () => {
    const assets = [
      ['otp-only-desktop.png', 1440, 2035],
      ['otp-only-mobile.png', 390, 3099],
    ] as const
    for (const [filename, width, height] of assets) {
      const bytes = fs.readFileSync(
        path.resolve(process.cwd(), 'public/sms-opt-in-evidence', filename),
      )
      expect(bytes.subarray(0, 8)).toEqual(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      )
      expect(bytes.readUInt32BE(16)).toBe(width)
      expect(bytes.readUInt32BE(20)).toBe(height)
      for (const forbidden of [
        '+12025550123',
        '+15555550123',
        'admin@mymedvisit.app',
        'legal@mymedvisit.app',
        'privacy@mymedvisit.app',
      ]) {
        expect(bytes.includes(Buffer.from(forbidden))).toBe(false)
      }
    }
  })
})
