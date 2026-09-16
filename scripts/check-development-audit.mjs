import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

export const MAX_POLICY_EXPIRY = '2026-10-31'

export class AuditPolicyError extends Error {
  constructor(rule) {
    super(rule)
    this.name = 'AuditPolicyError'
    this.rule = rule
  }
}

export function validateDevelopmentAudit({
  report,
  lockfile,
  policy,
  now = new Date(),
}) {
  requireRule(
    report?.metadata?.vulnerabilities?.critical === 0,
    'AUDIT_CRITICAL_PRESENT',
  )
  requireRule(policy?.schemaVersion === 1, 'AUDIT_POLICY_SCHEMA')
  requireRule(Array.isArray(policy.entries), 'AUDIT_POLICY_SCHEMA')

  const policyKeys = new Set()
  const policyIdentities = new Set()
  for (const entry of policy.entries) {
    validatePolicyEntry(entry, now)
    const key = tupleKey(entry)
    const identity = tupleIdentity(entry)
    requireRule(!policyKeys.has(key), 'AUDIT_POLICY_DUPLICATE')
    requireRule(!policyIdentities.has(identity), 'AUDIT_POLICY_DUPLICATE')
    policyKeys.add(key)
    policyIdentities.add(identity)
  }

  const actual = extractAuditTuples(report, lockfile)
  const actualKeys = new Set()
  const actualIdentities = new Set()
  for (const tuple of actual) {
    requireRule(tuple.severity !== 'critical', 'AUDIT_CRITICAL_PRESENT')
    requireRule(tuple.developmentOnly === true, 'AUDIT_PRODUCTION_REACHABLE')
    const key = tupleKey(tuple)
    const identity = tupleIdentity(tuple)
    requireRule(!actualKeys.has(key), 'AUDIT_FINDING_DUPLICATE')
    requireRule(!actualIdentities.has(identity), 'AUDIT_FINDING_DUPLICATE')
    actualKeys.add(key)
    actualIdentities.add(identity)
  }

  requireRule(actualKeys.size === policyKeys.size, 'AUDIT_TUPLE_SET_CHANGED')
  for (const key of actualKeys) {
    requireRule(policyKeys.has(key), 'AUDIT_TUPLE_SET_CHANGED')
  }

  return { advisoryTupleCount: actualKeys.size }
}

export function extractAuditTuples(report, lockfile) {
  const tuples = []
  for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
    for (const via of vulnerability.via ?? []) {
      if (typeof via !== 'object' || typeof via.url !== 'string') continue
      let advisoryId
      try {
        advisoryId = new URL(via.url).pathname.split('/').at(-1)
      } catch {
        throw new AuditPolicyError('AUDIT_ADVISORY_ID_INVALID')
      }
      requireRule(
        /^GHSA-[a-z0-9-]+$/.test(advisoryId),
        'AUDIT_ADVISORY_ID_INVALID',
      )
      for (const nodePath of vulnerability.nodes ?? []) {
        const locked = lockfile.packages?.[nodePath]
        requireRule(
          locked && typeof locked.version === 'string',
          'AUDIT_LOCK_NODE_MISSING',
        )
        tuples.push({
          advisoryId,
          packageName: via.dependency,
          installedVersion: locked.version,
          nodePath,
          affectedRange: via.range,
          severity: via.severity,
          developmentOnly: locked.dev === true,
        })
      }
    }
  }
  return tuples
}

function validatePolicyEntry(entry, now) {
  requireRule(
    /^GHSA-[a-z0-9-]+$/.test(entry.advisoryId ?? ''),
    'AUDIT_POLICY_ENTRY_INVALID',
  )
  for (const field of [
    'packageName',
    'installedVersion',
    'nodePath',
    'affectedRange',
    'severity',
    'rationale',
    'expiresOn',
  ]) {
    requireRule(
      typeof entry[field] === 'string' && entry[field].length > 0,
      'AUDIT_POLICY_ENTRY_INVALID',
    )
  }
  requireRule(entry.developmentOnly === true, 'AUDIT_POLICY_ENTRY_INVALID')
  requireRule(
    /^\d{4}-\d{2}-\d{2}$/.test(entry.expiresOn),
    'AUDIT_POLICY_EXPIRY_INVALID',
  )
  requireRule(
    entry.expiresOn <= MAX_POLICY_EXPIRY,
    'AUDIT_POLICY_EXPIRY_TOO_LATE',
  )
  const expiry = Date.parse(`${entry.expiresOn}T23:59:59.999Z`)
  requireRule(Number.isFinite(expiry), 'AUDIT_POLICY_EXPIRY_INVALID')
  requireRule(now.getTime() <= expiry, 'AUDIT_POLICY_EXPIRED')
}

function tupleIdentity(tuple) {
  return [tuple.advisoryId, tuple.packageName, tuple.nodePath].join('\u0000')
}

function tupleKey(tuple) {
  return [
    tuple.advisoryId,
    tuple.packageName,
    tuple.installedVersion,
    tuple.nodePath,
    tuple.affectedRange,
    tuple.severity,
    String(tuple.developmentOnly),
  ].join('\u0000')
}

function requireRule(condition, rule) {
  if (!condition) throw new AuditPolicyError(rule)
}

const isCli =
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
if (isCli) {
  const [policy, lockfile] = await Promise.all([
    readFile('security/development-audit-policy.json', 'utf8').then(JSON.parse),
    readFile('package-lock.json', 'utf8').then(JSON.parse),
  ])
  const audit = spawnSync('npm', ['audit', '--json'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (!audit.stdout) throw new AuditPolicyError('AUDIT_REPORT_MISSING')

  let report
  try {
    report = JSON.parse(audit.stdout)
  } catch {
    throw new AuditPolicyError('AUDIT_REPORT_INVALID')
  }
  const result = validateDevelopmentAudit({ report, lockfile, policy })
  process.stdout.write(
    `Development audit accepted exactly ${result.advisoryTupleCount} development-only advisory tuples; each entry expires no later than ${MAX_POLICY_EXPIRY}.\n`,
  )
}
