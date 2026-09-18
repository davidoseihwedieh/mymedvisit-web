import { createHash } from 'node:crypto'
import { opendir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  classifyProductionModule,
  classifyExternalReportEntry,
  moduleGraphReportSchema,
} from './production-module-graph-plugin.mjs'

const reportRoot = resolve('.next/sms-consent-module-graph')
const allowedTargets = new Set(['client', 'server', 'edge-server'])
const requiredTargets = new Set(['client', 'server'])
const seenTargets = new Set()
let directory

const disableGateSource = await readFile(
  resolve('src/lib/sms-consent/constants.ts'),
  'utf8',
)
if (
  !/^export const SMS_CONSENT_INTEGRATION_ENABLED = false as const$/m.test(
    disableGateSource,
  )
) {
  throw new Error('MODULE_GRAPH_DISABLE_GATE_CHANGED')
}

try {
  directory = await opendir(reportRoot)
} catch {
  throw new Error('MODULE_GRAPH_REPORT_DIRECTORY_MISSING')
}

for await (const entry of directory) {
  if (!entry.isFile() || !entry.name.endsWith('.json')) {
    throw new Error('MODULE_GRAPH_REPORT_UNEXPECTED_ENTRY')
  }
  const target = entry.name.slice(0, -'.json'.length)
  if (!allowedTargets.has(target) || seenTargets.has(target)) {
    throw new Error('MODULE_GRAPH_REPORT_UNEXPECTED_TARGET')
  }
  seenTargets.add(target)
  const report = JSON.parse(
    await readFile(resolve(reportRoot, entry.name), 'utf8'),
  )
  verifyReport(report, target)
}

for (const target of requiredTargets) {
  if (!seenTargets.has(target)) {
    throw new Error('MODULE_GRAPH_REPORT_REQUIRED_TARGET_MISSING')
  }
}

process.stdout.write(
  `Authoritative production module graphs verified (${[...seenTargets].sort().join(', ')}).\n`,
)

function verifyReport(report, target) {
  const exactKeys = [
    'schema',
    'target',
    'integrationEnabled',
    'moduleCount',
    'repositoryModuleCount',
    'repositoryModulePathDigest',
    'repositoryModules',
    'externalModules',
    'forbiddenModuleCount',
  ]
  if (
    !isPlainRecord(report) ||
    !hasExactKeys(report, exactKeys) ||
    report.schema !== moduleGraphReportSchema() ||
    report.target !== target ||
    report.integrationEnabled !== false ||
    report.forbiddenModuleCount !== 0 ||
    !Number.isSafeInteger(report.moduleCount) ||
    report.moduleCount < (requiredTargets.has(target) ? 1 : 0) ||
    !Array.isArray(report.repositoryModules) ||
    !Array.isArray(report.externalModules) ||
    !report.repositoryModules.every(isApprovedRepositoryPath) ||
    report.repositoryModuleCount !== report.repositoryModules.length ||
    !isStrictlySortedUnique(report.repositoryModules) ||
    !isStrictlySortedUnique(
      report.externalModules.map(
        ({ kind, externalType, identity }) =>
          `${kind}:${externalType}:${identity}`,
      ),
    ) ||
    report.externalModules.some((entry) => {
      const policy = classifyExternalReportEntry(entry)
      return (
        !policy || policy !== entry.kind || !isApprovedExternalKind(entry.kind)
      )
    }) ||
    report.repositoryModulePathDigest !==
      digestPaths(report.repositoryModules) ||
    report.repositoryModules.some(
      (path) =>
        classifyProductionModule(resolve(path), {
          repositoryRoot: resolve('.'),
        }).violation !== null,
    )
  ) {
    throw new Error('MODULE_GRAPH_REPORT_INVALID')
  }
}

function isApprovedExternalKind(kind) {
  return ['approved-local', 'node-builtin', 'production-package'].includes(kind)
}

function isApprovedRepositoryPath(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.startsWith('/') &&
    !value.startsWith('../') &&
    !value.includes('\\') &&
    !value.includes('\0')
  )
}

function isStrictlySortedUnique(values) {
  return values.every(
    (value, index) => index === 0 || values[index - 1] < value,
  )
}

function digestPaths(paths) {
  return createHash('sha256').update(paths.join('\n')).digest('hex')
}

function isPlainRecord(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

function hasExactKeys(value, expected) {
  const actual = Object.keys(value).sort()
  return (
    actual.length === expected.length &&
    expected
      .slice()
      .sort()
      .every((key, index) => actual[index] === key)
  )
}
