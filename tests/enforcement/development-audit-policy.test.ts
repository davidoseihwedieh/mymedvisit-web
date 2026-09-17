import { describe, expect, it } from 'vitest'
import {
  AuditPolicyError,
  validateDevelopmentAudit,
} from '../../scripts/check-development-audit.mjs'

const now = new Date('2026-09-16T12:00:00.000Z')

describe('exact development advisory policy', () => {
  it('accepts one exact development-only tuple', () => {
    expect(validateDevelopmentAudit(fixture())).toEqual({
      advisoryTupleCount: 1,
    })
  })

  it.each([
    [
      'severity escalation',
      (f: Fixture) => (f.report.vulnerabilities.tool.via[0].severity = 'high'),
    ],
    [
      'installed version change',
      (f: Fixture) =>
        (f.lockfile.packages['node_modules/tool'].version = '1.2.4'),
    ],
    [
      'node path change',
      (f: Fixture) => (f.policy.entries[0].nodePath = 'node_modules/other'),
    ],
    [
      'affected range change',
      (f: Fixture) => (f.report.vulnerabilities.tool.via[0].range = '<2.1.0'),
    ],
  ])('rejects %s', (_label, mutate) => {
    const value = fixture()
    mutate(value)
    expectRule(() => validateDevelopmentAudit(value), 'AUDIT_TUPLE_SET_CHANGED')
  })

  it('rejects production-reachable findings before policy matching', () => {
    const value = fixture()
    value.lockfile.packages['node_modules/tool'].dev = false
    expectRule(
      () => validateDevelopmentAudit(value),
      'AUDIT_PRODUCTION_REACHABLE',
    )
  })

  it('rejects duplicate findings', () => {
    const value = fixture()
    value.report.vulnerabilities.duplicate = structuredClone(
      value.report.vulnerabilities.tool,
    )
    expectRule(() => validateDevelopmentAudit(value), 'AUDIT_FINDING_DUPLICATE')
  })

  it('rejects duplicate policy entries', () => {
    const value = fixture()
    value.policy.entries.push(structuredClone(value.policy.entries[0]))
    expectRule(() => validateDevelopmentAudit(value), 'AUDIT_POLICY_DUPLICATE')
  })

  it('rejects an expired individual entry', () => {
    const value = fixture()
    value.policy.entries[0].expiresOn = '2026-09-15'
    expectRule(() => validateDevelopmentAudit(value), 'AUDIT_POLICY_EXPIRED')
  })

  it('rejects a new finding', () => {
    const value = fixture()
    const added = structuredClone(value.report.vulnerabilities.tool)
    added.via[0].url = 'https://github.com/advisories/GHSA-bbbb-2222-cccc'
    value.report.vulnerabilities.added = added
    expectRule(() => validateDevelopmentAudit(value), 'AUDIT_TUPLE_SET_CHANGED')
  })

  it('rejects a resolved finding while its policy entry remains', () => {
    const value = fixture()
    value.report.vulnerabilities = {}
    expectRule(() => validateDevelopmentAudit(value), 'AUDIT_TUPLE_SET_CHANGED')
  })

  it('rejects critical findings unconditionally', () => {
    const value = fixture()
    value.report.metadata.vulnerabilities.critical = 1
    value.report.vulnerabilities.tool.via[0].severity = 'critical'
    value.policy.entries[0].severity = 'critical'
    expectRule(() => validateDevelopmentAudit(value), 'AUDIT_CRITICAL_PRESENT')
  })
})

interface Fixture {
  report: {
    metadata: { vulnerabilities: { critical: number } }
    vulnerabilities: Record<string, Vulnerability>
  }
  lockfile: {
    packages: Record<string, { version: string; dev: boolean }>
  }
  policy: {
    schemaVersion: number
    entries: PolicyEntry[]
  }
  now: Date
}

interface Vulnerability {
  nodes: string[]
  via: Array<{
    dependency: string
    url: string
    range: string
    severity: string
  }>
}

interface PolicyEntry {
  advisoryId: string
  packageName: string
  installedVersion: string
  nodePath: string
  affectedRange: string
  severity: string
  developmentOnly: boolean
  rationale: string
  expiresOn: string
}

function fixture(): Fixture {
  return {
    report: {
      metadata: { vulnerabilities: { critical: 0 } },
      vulnerabilities: {
        tool: {
          nodes: ['node_modules/tool'],
          via: [
            {
              dependency: 'tool',
              url: 'https://github.com/advisories/GHSA-aaaa-1111-bbbb',
              range: '<2.0.0',
              severity: 'moderate',
            },
          ],
        },
      },
    },
    lockfile: {
      packages: {
        'node_modules/tool': { version: '1.2.3', dev: true },
      },
    },
    policy: {
      schemaVersion: 1,
      entries: [
        {
          advisoryId: 'GHSA-aaaa-1111-bbbb',
          packageName: 'tool',
          installedVersion: '1.2.3',
          nodePath: 'node_modules/tool',
          affectedRange: '<2.0.0',
          severity: 'moderate',
          developmentOnly: true,
          rationale: 'Development-only fixture.',
          expiresOn: '2026-10-31',
        },
      ],
    },
    now,
  }
}

function expectRule(run: () => unknown, rule: string): void {
  try {
    run()
    throw new Error('expected enforcement failure')
  } catch (error) {
    expect(error).toBeInstanceOf(AuditPolicyError)
    expect((error as Error).message).toBe(rule)
    expect((error as Error).message).not.toContain('GHSA-')
    expect((error as Error).message).not.toContain('node_modules')
  }
}
