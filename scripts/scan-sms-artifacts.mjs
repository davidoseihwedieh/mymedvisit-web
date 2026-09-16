import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative, resolve } from 'node:path'

const outputRoot = resolve('out')
const source = await readFile(
  resolve('src/lib/sms-consent/constants.ts'),
  'utf8',
)

if (
  !/^export const SMS_CONSENT_INTEGRATION_ENABLED = false as const$/m.test(
    source,
  )
) {
  throw new Error('The literal production-disable gate is missing or changed.')
}

const files = await collectTextArtifacts(outputRoot)
if (!files.some((file) => file.endsWith('sms-opt-in.html'))) {
  throw new Error('The generated sms-opt-in HTML artifact is missing.')
}

const forbidden = [
  {
    label: 'phone-like NANP 555 test number',
    pattern:
      /(?:\+?1[ .-]*)?\(?[2-9]\d{2}\)?[ .-]*555[ .-]*\d{4}|\(?555\)?[ .-]*555[ .-]*\d{4}/i,
  },
  { label: 'reserved .invalid hostname', pattern: /\.invalid\b/i },
  {
    label: 'capture or reCAPTCHA API origin',
    pattern: /https?:\/\/(?:api|capture|recaptcha)[a-z0-9.-]*/i,
  },
  { label: 'reCAPTCHA action', pattern: /sms_consent_submit/i },
  {
    label: 'reCAPTCHA or API environment key',
    pattern: /NEXT_PUBLIC_SMS_CONSENT_(?:API_BASE_URL|RECAPTCHA_SITE_KEY)/,
  },
  {
    label: 'reCAPTCHA token material or wire field',
    pattern: /recaptchaToken|synthetic-token|attempt-local-token/i,
  },
  {
    label: 'browser-test switch or test-only client',
    pattern:
      /NEXT_PUBLIC_SMS_CONSENT_BROWSER_TEST_MODE|local-mock|createLocalBrowserTestClient/i,
  },
]

const violations = []
for (const file of files) {
  const contents = await readFile(file, 'utf8')
  for (const rule of forbidden) {
    if (rule.pattern.test(contents)) {
      violations.push(`${rule.label}: ${relative(outputRoot, file)}`)
    }
  }
}

if (violations.length > 0) {
  throw new Error(
    `Unsafe SMS production artifact content found:\n${violations.join('\n')}`,
  )
}

process.stdout.write(
  `SMS artifact/privacy scan passed for ${files.length} HTML, JavaScript, JSON, and text artifacts.\n`,
)

async function collectTextArtifacts(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const results = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      results.push(...(await collectTextArtifacts(path)))
    } else if (
      ['.html', '.js', '.json', '.txt'].includes(extname(entry.name))
    ) {
      results.push(path)
    }
  }
  return results
}
