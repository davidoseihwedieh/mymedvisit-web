import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const policy = JSON.parse(
  await readFile('security/development-audit-policy.json', 'utf8'),
)
const expiry = Date.parse(`${policy.expiresOn}T23:59:59.999Z`)
if (!Number.isFinite(expiry) || Date.now() > expiry) {
  throw new Error(`Development audit policy expired on ${policy.expiresOn}.`)
}

const audit = spawnSync('npm', ['audit', '--json'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
})
if (!audit.stdout) {
  throw new Error('npm audit returned no machine-readable report.')
}

const report = JSON.parse(audit.stdout)
const vulnerabilities = Object.values(report.vulnerabilities ?? {})
const actualPackages = [
  ...new Set(vulnerabilities.map(({ name }) => name)),
].sort()
const allowedPackages = [...policy.vulnerablePackages].sort()
if (JSON.stringify(actualPackages) !== JSON.stringify(allowedPackages)) {
  throw new Error(
    `Development audit package set changed. Expected ${allowedPackages.join(', ')}; received ${actualPackages.join(', ')}.`,
  )
}

const actualAdvisories = new Map()
for (const vulnerability of vulnerabilities) {
  for (const via of vulnerability.via ?? []) {
    if (typeof via !== 'object' || !via.url) {
      continue
    }
    const id = new URL(via.url).pathname.split('/').at(-1)
    actualAdvisories.set(id, via.dependency)
  }
}

const allowedAdvisories = new Map(
  policy.advisories.map(({ id, package: packageName, rationale }) => {
    if (!/^GHSA-[a-z0-9-]+$/.test(id) || !rationale) {
      throw new Error(`Invalid development audit policy entry: ${id}.`)
    }
    return [id, packageName]
  }),
)
if (
  JSON.stringify([...actualAdvisories].sort()) !==
  JSON.stringify([...allowedAdvisories].sort())
) {
  throw new Error('Development advisory IDs or package ownership changed.')
}

process.stdout.write(
  `Development audit policy accepted exactly ${actualAdvisories.size} advisories across ${actualPackages.length} packages through ${policy.expiresOn}.\n`,
)
