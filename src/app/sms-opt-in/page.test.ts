import fs from 'node:fs'
import path from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import jsQR from 'jsqr'
import { describe, expect, it } from 'vitest'
import { metadata } from './page'
import { SmsOptInClient } from './SmsOptInClient'
import { SMS_OPT_IN_CANONICAL_URL } from '@/lib/sms-consent/constants'

describe('SMS opt-in route', () => {
  it('uses exact canonical metadata and remains noindex while disconnected', () => {
    expect(metadata.title).toBe('Transactional SMS Opt-In | MyMedVisit')
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
    const consent = staticDocument.querySelector<HTMLInputElement>('#sms-consent')
    const submit = staticDocument.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    )

    expect(form).not.toBeNull()
    expect(phone).not.toBeNull()
    expect(consent).not.toBeNull()
    expect(submit).not.toBeNull()
    expect(form?.hasAttribute('action')).toBe(false)
    expect(phone?.hasAttribute('name')).toBe(false)
    expect(consent?.hasAttribute('name')).toBe(false)
    expect(phone?.disabled).toBe(true)
    expect(consent?.disabled).toBe(true)
    expect(submit?.disabled).toBe(true)
    expect(
      staticDocument.getElementById('sms-form-unavailable')?.textContent,
    ).toContain('No consent has been sent or recorded.')

    phone!.disabled = false
    phone!.value = '+15555550123'
    consent!.disabled = false
    consent!.checked = true
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

    expect(svg).toContain(`<desc id="desc">Encodes ${SMS_OPT_IN_CANONICAL_URL}</desc>`)
    expect(decoded?.data).toBe(SMS_OPT_IN_CANONICAL_URL)
  })
})
