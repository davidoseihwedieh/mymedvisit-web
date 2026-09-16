import { createHash } from 'node:crypto'
import { mkdirSync, realpathSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path'

const PLUGIN_NAME = 'SmsConsentProductionModuleGraphPlugin'
const REPORT_SCHEMA = 'mymedvisit.sms-consent-production-module-graph.v1'
const SOURCE_EXTENSIONS = new Set([
  '.cjs',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
])
const FORBIDDEN_SOURCE_STEMS = new Map([
  ['src/lib/sms-consent/browsertestclient', 'MODULE_GRAPH_BROWSER_TEST_CLIENT'],
  ['src/lib/sms-consent/httptransport', 'MODULE_GRAPH_DISABLED_HTTP_TRANSPORT'],
  ['src/lib/sms-consent/recaptcha', 'MODULE_GRAPH_DISABLED_RECAPTCHA_BOUNDARY'],
])

export class SmsConsentProductionModuleGraphPlugin {
  constructor({ repositoryRoot, reportRoot, target }) {
    this.repositoryRoot = canonicalDirectory(repositoryRoot)
    this.reportRoot = resolve(reportRoot)
    this.target = target
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.finishModules.tapPromise(
        PLUGIN_NAME,
        async (modules) => {
          const repositoryModules = new Set()
          const violations = []
          let moduleCount = 0

          for (const compiledModule of modules) {
            moduleCount += 1
            for (const candidate of moduleCandidates(compiledModule)) {
              const result = classifyProductionModule(candidate, {
                repositoryRoot: this.repositoryRoot,
              })
              if (result.repositoryPath) {
                repositoryModules.add(result.repositoryPath)
              }
              if (result.violation) {
                violations.push(result.violation)
              }
            }
          }

          const uniqueViolations = uniqueSortedViolations(violations)
          if (uniqueViolations.length > 0) {
            for (const violation of uniqueViolations) {
              compilation.errors.push(
                new Error(`${violation.ruleId} [${violation.pathLabel}]`),
              )
            }
            return
          }

          const paths = [...repositoryModules].sort()
          const report = {
            schema: REPORT_SCHEMA,
            target: this.target,
            integrationEnabled: false,
            moduleCount,
            repositoryModuleCount: paths.length,
            repositoryModulePathDigest: digestPaths(paths),
            repositoryModules: paths,
            forbiddenModuleCount: 0,
          }
          writeReport(this.reportRoot, this.target, report)
        },
      )
    })
  }
}

export function classifyProductionModule(
  rawCandidate,
  { repositoryRoot = process.cwd() } = {},
) {
  const candidate = normalizeCandidate(rawCandidate)
  if (!candidate) return { repositoryPath: null, violation: null }

  const canonicalRoot = canonicalDirectory(repositoryRoot)
  const canonicalPath = canonicalResource(candidate.path)
  const repositoryPath = pathWithin(canonicalRoot, canonicalPath)
  const comparisonPath = (repositoryPath ?? candidate.path)
    .split(sep)
    .join('/')
    .toLowerCase()
  const extension = extname(comparisonPath)
  const sourceStem = SOURCE_EXTENSIONS.has(extension)
    ? comparisonPath.slice(0, -extension.length)
    : comparisonPath

  for (const [forbiddenStem, ruleId] of FORBIDDEN_SOURCE_STEMS) {
    if (
      sourceStem === forbiddenStem ||
      sourceStem.endsWith(`/${forbiddenStem}`)
    ) {
      return {
        repositoryPath,
        violation: {
          ruleId,
          pathLabel: repositoryPath ?? 'FORBIDDEN_MODULE',
        },
      }
    }
  }

  if (isTestOnlyPath(comparisonPath)) {
    return {
      repositoryPath,
      violation: {
        ruleId: 'MODULE_GRAPH_TEST_ONLY_MODULE',
        pathLabel: repositoryPath ?? 'TEST_ONLY_MODULE',
      },
    }
  }

  if (candidate.virtual && containsForbiddenVirtualHint(comparisonPath)) {
    return {
      repositoryPath,
      violation: {
        ruleId: 'MODULE_GRAPH_FORBIDDEN_VIRTUAL_MODULE',
        pathLabel: 'FORBIDDEN_VIRTUAL_MODULE',
      },
    }
  }

  return { repositoryPath, violation: null }
}

export function moduleGraphReportSchema() {
  return REPORT_SCHEMA
}

function moduleCandidates(compiledModule) {
  let identifier
  try {
    identifier = compiledModule.identifier?.()
  } catch {
    identifier = undefined
  }
  return new Set(
    [
      compiledModule.resource,
      compiledModule.matchResource,
      compiledModule.resourceResolveData?.path,
      compiledModule.rootModule?.resource,
      identifier,
    ].filter((value) => typeof value === 'string' && value.length > 0),
  )
}

function normalizeCandidate(value) {
  if (typeof value !== 'string' || value.length === 0) return null
  const virtual = value.includes('\0') || value.startsWith('virtual:')
  const identifierTail = value.split('|').at(-1) ?? value
  const loaderTail = identifierTail.split('!').at(-1) ?? identifierTail
  const withoutQuery = loaderTail.split('?')[0].split('#')[0]
  if (!withoutQuery) return null
  return { path: withoutQuery, virtual }
}

function canonicalDirectory(path) {
  const absolute = resolve(path)
  try {
    return realpathSync.native(absolute)
  } catch {
    return absolute
  }
}

function canonicalResource(path) {
  if (!isAbsolute(path)) return path
  try {
    return realpathSync.native(path)
  } catch {
    return resolve(path)
  }
}

function pathWithin(root, candidate) {
  if (!isAbsolute(candidate)) return null
  const pathFromRoot = relative(root, candidate)
  if (
    pathFromRoot === '' ||
    pathFromRoot === '..' ||
    pathFromRoot.startsWith(`..${sep}`) ||
    isAbsolute(pathFromRoot)
  ) {
    return null
  }
  return pathFromRoot.split(sep).join('/')
}

function isTestOnlyPath(path) {
  return (
    /(^|\/)(?:tests?|__tests__|test-utils?|playwright|vitest)(\/|$)/i.test(
      path,
    ) ||
    /\.(?:test|spec|mock|fixture)\.[cm]?[jt]sx?$/i.test(path) ||
    /\/node_modules\/(?:@playwright\/test|vitest)(\/|$)/i.test(path)
  )
}

function containsForbiddenVirtualHint(path) {
  return /(?:browsertestclient|httptransport|recaptcha|playwright|vitest|fixture|mock)/i.test(
    path,
  )
}

function digestPaths(paths) {
  return createHash('sha256').update(paths.join('\n')).digest('hex')
}

function uniqueSortedViolations(violations) {
  const byKey = new Map()
  for (const violation of violations) {
    byKey.set(`${violation.ruleId}:${violation.pathLabel}`, violation)
  }
  return [...byKey.values()].sort((left, right) =>
    `${left.ruleId}:${left.pathLabel}`.localeCompare(
      `${right.ruleId}:${right.pathLabel}`,
    ),
  )
}

function writeReport(reportRoot, target, report) {
  mkdirSync(reportRoot, { recursive: true })
  const destination = resolve(reportRoot, `${target}.json`)
  const temporary = `${destination}.${process.pid}.tmp`
  writeFileSync(temporary, `${JSON.stringify(report, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  })
  renameSync(temporary, destination)
}
