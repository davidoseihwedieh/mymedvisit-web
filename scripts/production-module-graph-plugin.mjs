import { createHash } from 'node:crypto'
import { builtinModules, createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { types as utilTypes } from 'node:util'
import { mkdirSync, realpathSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path'

const PLUGIN_NAME = 'SmsConsentProductionModuleGraphPlugin'
const REPORT_SCHEMA = 'mymedvisit.sms-consent-production-module-graph.v2'
const TEST_PACKAGE_DENYLIST = new Set([
  '@axe-core/playwright',
  '@jest/core',
  '@jest/environment',
  '@jest/globals',
  '@playwright/test',
  '@testing-library/dom',
  '@testing-library/jest-dom',
  '@testing-library/react',
  '@testing-library/user-event',
  '@vitest/browser',
  '@vitest/expect',
  '@vitest/mocker',
  '@vitest/runner',
  '@vitest/snapshot',
  'axe-core',
  'jest-axe',
  'jest-cli',
  'jest-environment-jsdom',
  'jest-mock',
  'mockdate',
  'msw',
  'nock',
  'playwright',
  'playwright-core',
  'sinon',
  'vitest',
  'vite',
  'vite-node',
  'vitest-mock-extended',
])
const EXTERNAL_PREFIXES = new Set([
  'commonjs',
  'commonjs2',
  'module',
  'import',
  'node-commonjs',
])
const EXTERNAL_TYPES = EXTERNAL_PREFIXES
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
    this.packagePolicy = productionPackagePolicy()
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.finishModules.tapPromise(
        PLUGIN_NAME,
        async (modules) => {
          const repositoryModules = new Set()
          const externalModules = new Map()
          const violations = []
          let moduleCount = 0

          for (const compiledModule of modules) {
            moduleCount += 1
            const external = inspectExternalModule(
              compiledModule,
              this.packagePolicy,
              this.repositoryRoot,
            )
            if (external.detected) {
              if (external.violation) violations.push(external.violation)
              for (const identity of external.identities ?? []) {
                const repositoryPath =
                  identity.kind === 'approved-local'
                    ? pathWithin(this.repositoryRoot, identity.identity)
                    : null
                if (identity.kind === 'approved-local' && !repositoryPath) {
                  violations.push({
                    ruleId: 'MODULE_GRAPH_UNAPPROVED_EXTERNAL',
                    pathLabel: 'EXTERNAL_MODULE',
                  })
                  continue
                }
                const sanitizedIdentity = repositoryPath ?? identity.identity
                externalModules.set(
                  `${identity.kind}:${identity.externalType}:${sanitizedIdentity}`,
                  { ...identity, identity: sanitizedIdentity },
                )
              }
            }
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
            externalModules: [...externalModules.values()].sort((a, b) =>
              `${a.kind}:${a.identity}`.localeCompare(
                `${b.kind}:${b.identity}`,
              ),
            ),
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

export function classifyExternalReportEntry(entry) {
  if (
    !entry ||
    Object.getPrototypeOf(entry) !== Object.prototype ||
    Object.keys(entry).sort().join(',') !== 'externalType,identity,kind' ||
    typeof entry.identity !== 'string' ||
    typeof entry.kind !== 'string' ||
    typeof entry.externalType !== 'string' ||
    !EXTERNAL_TYPES.has(entry.externalType)
  )
    return null
  if (entry.kind === 'approved-local') {
    if (
      entry.identity.startsWith('/') ||
      entry.identity.includes('\\') ||
      entry.identity
        .split('/')
        .some((part) => part === '' || part === '.' || part === '..')
    ) {
      return null
    }
    const result = classifyProductionModule(resolve(entry.identity), {
      repositoryRoot: resolve('.'),
    })
    return result.violation ? 'forbidden' : 'approved-local'
  }
  const request = normalizeExternalRequest(entry.identity)
  if (!request || request.identity !== entry.identity) return null
  return classifyExternalIdentity(request.identity, productionPackagePolicy())
}

export function moduleGraphReportSchema() {
  return REPORT_SCHEMA
}

function moduleCandidates(compiledModule) {
  const identifier = invokeModuleMethod(compiledModule, 'identifier')
  const readableIdentifier = invokeModuleMethod(
    compiledModule,
    'readableIdentifier',
    { shorten: (value) => value },
  )
  return new Set(
    [
      readDataProperty(compiledModule, 'resource'),
      readDataProperty(compiledModule, 'matchResource'),
      readNestedDataProperty(compiledModule, ['resourceResolveData', 'path']),
      readNestedDataProperty(compiledModule, ['rootModule', 'resource']),
      identifier,
      readableIdentifier,
    ].filter((value) => typeof value === 'string' && value.length > 0),
  )
}

function inspectExternalModule(
  compiledModule,
  packagePolicy,
  repositoryRoot = process.cwd(),
) {
  try {
    const externalType = readDataProperty(compiledModule, 'externalType')
    const identifier = invokeModuleMethodStrict(compiledModule, 'identifier')
    const externalByIdentifier =
      typeof identifier === 'string' && identifier.startsWith('external ')
    const detected = typeof externalType === 'string' || externalByIdentifier
    if (!detected) return { detected: false }
    if (
      typeof externalType !== 'string' ||
      !EXTERNAL_TYPES.has(externalType.toLowerCase())
    ) {
      throw new Error('UNSUPPORTED_EXTERNAL_TYPE')
    }

    const rawValues = []
    for (const key of ['request', 'userRequest']) {
      const value = readDataProperty(compiledModule, key)
      if (value !== undefined) {
        collectRequestStrings(value, rawValues, 0, new Set(), {
          allowRelativeUserRequest: key === 'userRequest',
        })
      }
    }
    const dependencies = readDataProperty(compiledModule, 'dependencies')
    if (dependencies !== undefined) {
      if (!Array.isArray(dependencies)) throw new Error('AMBIGUOUS')
      for (const dependency of dependencies) {
        for (const key of ['request', 'userRequest']) {
          const value = readDataProperty(dependency, key)
          if (value !== undefined) {
            collectRequestStrings(value, rawValues, 0, new Set(), {
              allowRelativeUserRequest: key === 'userRequest',
            })
          }
        }
      }
    }
    const dependencyMeta = readDataProperty(compiledModule, 'dependencyMeta')
    if (dependencyMeta !== undefined) {
      if (!dependencyMeta || typeof dependencyMeta !== 'object')
        throw new Error('AMBIGUOUS')
      for (const key of ['request', 'userRequest']) {
        const value = readDataProperty(dependencyMeta, key)
        if (value !== undefined) {
          collectRequestStrings(value, rawValues, 0, new Set(), {
            allowRelativeUserRequest: key === 'userRequest',
          })
        }
      }
    }
    if (typeof identifier === 'string') rawValues.push({ raw: identifier })
    const readable = invokeModuleMethodStrict(
      compiledModule,
      'readableIdentifier',
      {
        shorten: (value) => value,
      },
    )
    if (typeof readable === 'string') rawValues.push({ raw: readable })

    const normalized = new Map()
    const moduleContext = readDataProperty(compiledModule, 'context')
    for (const source of rawValues) {
      const request = normalizeExternalRequest(source.raw, {
        allowRelativeUserRequest: source.allowRelativeUserRequest === true,
        moduleContext,
      })
      if (!request) throw new Error('AMBIGUOUS')
      if (request.kind === 'path') {
        if (!isAbsolute(request.identity)) {
          if (typeof moduleContext === 'string' && isAbsolute(moduleContext)) {
            request.identity = resolve(moduleContext, request.identity)
          } else if (source.allowRelativeUserRequest === true) {
            request.identity = resolveRelativeExternalPath(
              request.identity,
              normalized,
            )
          } else {
            throw new Error('AMBIGUOUS')
          }
        }
        request.identity = canonicalResource(request.identity)
      }
      request.fromRelativeUserRequest =
        source.allowRelativeUserRequest === true && request.kind === 'path'
      normalized.set(`${request.kind}:${request.identity}`, request)
    }
    const classified = [...normalized.values()].map((request) => {
      const kind = classifyExternalIdentity(
        request.identity,
        packagePolicy,
        repositoryRoot,
      )
      return { request, kind }
    })
    if (!classified.length) {
      return {
        detected: true,
        violation: {
          ruleId: 'MODULE_GRAPH_UNAPPROVED_EXTERNAL',
          pathLabel: 'EXTERNAL_MODULE',
        },
      }
    }
    const records = classified
    if (records.some(({ kind }) => kind === 'development-only')) {
      return {
        detected: true,
        violation: {
          ruleId: 'MODULE_GRAPH_TEST_ONLY_EXTERNAL',
          pathLabel: 'TEST_ONLY_EXTERNAL',
        },
      }
    }
    const forbidden = records.find(({ kind }) => kind === 'forbidden')
    if (forbidden) {
      return {
        detected: true,
        violation:
          forbidden.request.kind === 'path'
            ? (classifyProductionModule(forbidden.request.identity)
                .violation ?? {
                ruleId: 'MODULE_GRAPH_INVALID_EXTERNAL',
                pathLabel: 'INVALID_EXTERNAL',
              })
            : {
                ruleId: 'MODULE_GRAPH_INVALID_EXTERNAL',
                pathLabel: 'INVALID_EXTERNAL',
              },
      }
    }
    const relativeUserRequests = records.filter(
      ({ request }) => request.fromRelativeUserRequest,
    )
    if (
      relativeUserRequests.some(
        ({ request }) =>
          !records.some(
            ({ request: source, kind }) =>
              !source.fromRelativeUserRequest &&
              source.kind === 'package' &&
              kind === 'production-package' &&
              pathBelongsToPackage(request.identity, source.identity),
          ),
      )
    ) {
      return {
        detected: true,
        violation: {
          ruleId: 'MODULE_GRAPH_INVALID_EXTERNAL',
          pathLabel: 'INVALID_EXTERNAL',
        },
      }
    }
    if (records.some(({ kind }) => kind === 'forbidden')) {
      return {
        detected: true,
        violation: {
          ruleId: 'MODULE_GRAPH_INVALID_EXTERNAL',
          pathLabel: 'INVALID_EXTERNAL',
        },
      }
    }
    if (records.some(({ kind }) => !kind)) {
      return {
        detected: true,
        violation: {
          ruleId: 'MODULE_GRAPH_UNAPPROVED_EXTERNAL',
          pathLabel: 'EXTERNAL_MODULE',
        },
      }
    }
    return {
      detected: true,
      identities: records.map(({ request, kind }) => ({
        externalType: externalType.toLowerCase(),
        identity: request.identity,
        kind,
      })),
    }
  } catch {
    return {
      detected: true,
      violation: {
        ruleId: 'MODULE_GRAPH_UNINSPECTABLE_EXTERNAL',
        pathLabel: 'EXTERNAL_MODULE',
      },
    }
  }
}

function productionPackagePolicy() {
  const manifest = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
  const dependencies = manifest.dependencies ?? {}
  const devDependencies = manifest.devDependencies ?? {}
  if (
    Object.keys(dependencies).some((name) =>
      Object.hasOwn(devDependencies, name),
    )
  ) {
    throw new Error('MODULE_GRAPH_PACKAGE_POLICY_DUPLICATE')
  }
  return {
    production: new Set(Object.keys(dependencies)),
    development: new Set([
      ...Object.keys(devDependencies),
      ...TEST_PACKAGE_DENYLIST,
    ]),
  }
}

function collectRequestStrings(
  value,
  output,
  depth = 0,
  seen = new Set(),
  options = {},
) {
  if (depth > 8 || seen.has(value)) throw new Error('AMBIGUOUS')
  if (typeof value === 'string') {
    if (!value) throw new Error('AMBIGUOUS')
    output.push({ raw: value, ...options })
    return
  }
  if (value && typeof value === 'object' && utilTypes.isProxy(value)) {
    throw new Error('AMBIGUOUS')
  }
  if (Array.isArray(value)) {
    if (value.length === 0) throw new Error('AMBIGUOUS')
    seen.add(value)
    if (
      value.length === 2 &&
      typeof value[0] === 'string' &&
      EXTERNAL_PREFIXES.has(value[0].toLowerCase()) &&
      typeof value[1] === 'string'
    ) {
      collectRequestStrings(
        `${value[0]} ${value[1]}`,
        output,
        depth + 1,
        seen,
        options,
      )
    } else {
      for (const item of value)
        collectRequestStrings(item, output, depth + 1, seen, options)
    }
    seen.delete(value)
    return
  }
  if (value && typeof value === 'object') {
    const descriptors = Object.getOwnPropertyDescriptors(value)
    const keys = Object.keys(descriptors).sort()
    if (!keys.length || keys.some((key) => !('value' in descriptors[key]))) {
      throw new Error('AMBIGUOUS')
    }
    seen.add(value)
    const externalKeys = keys.filter((key) =>
      EXTERNAL_PREFIXES.has(key.toLowerCase()),
    )
    if (externalKeys.length === 1 && keys.length === 1) {
      if (typeof descriptors[externalKeys[0]].value !== 'string')
        throw new Error('AMBIGUOUS')
      collectRequestStrings(
        `${externalKeys[0]} ${descriptors[externalKeys[0]].value}`,
        output,
        depth + 1,
        seen,
        options,
      )
    } else {
      for (const key of keys)
        collectRequestStrings(
          descriptors[key].value,
          output,
          depth + 1,
          seen,
          options,
        )
    }
    seen.delete(value)
    return
  }
  throw new Error('AMBIGUOUS')
}

function normalizeExternalRequest(
  raw,
  { allowRelativeUserRequest = false, moduleContext } = {},
) {
  if (typeof raw !== 'string' || !raw || raw.length > 4096) {
    return null
  }
  let value = raw
  if (value.startsWith('external ')) value = value.slice('external '.length)
  const prefix = value.match(/^([a-z0-9-]+)\s+(.+)$/i)
  if (prefix && EXTERNAL_PREFIXES.has(prefix[1].toLowerCase())) {
    value = prefix[2]
  }
  if (value.startsWith('[') || value.startsWith('{') || value.startsWith('"')) {
    let decoded
    try {
      decoded = JSON.parse(value)
    } catch {
      return null
    }
    if (typeof decoded === 'string') {
      if (decoded === value) return null
      return normalizeExternalRequest(decoded, {
        allowRelativeUserRequest,
        moduleContext,
      })
    }
    return normalizeExternalStructured(decoded)
  }
  if (/[\\\u0000-\u0020\u007f]/u.test(value)) return null
  if (
    allowRelativeUserRequest &&
    (value.startsWith('./') || value.startsWith('../')) &&
    !/%[0-9a-f]{2}/i.test(value) &&
    !value.includes('!')
  )
    return { identity: value, kind: 'path' }
  if (
    !value ||
    /[?#\\\u0000-\u0020\u007f]/u.test(value) ||
    /%[0-9a-f]{2}/i.test(value) ||
    value.includes('!') ||
    value.split('/').some((part) => part === '.' || part === '..')
  )
    return null

  if (value.startsWith('node:')) {
    const builtin = value.slice('node:'.length)
    const validBuiltins = new Set(
      builtinModules.map((entry) => entry.replace(/^node:/, '')),
    )
    return validBuiltins.has(builtin)
      ? { identity: `node:${builtin}`, kind: 'node' }
      : null
  }
  const builtins = new Set(
    builtinModules.map((entry) => entry.replace(/^node:/, '')),
  )
  if (builtins.has(value)) return { identity: `node:${value}`, kind: 'node' }
  if (isAbsolute(value) || value.startsWith('./') || value.startsWith('../')) {
    return { identity: value, kind: 'path' }
  }
  const packageName = packageRoot(value)
  if (!packageName || packageName.normalize('NFC') !== packageName) return null
  return { identity: packageName, kind: 'package', specifier: value }
}

function resolveRelativeExternalPath(requestPath, existingRequests) {
  const packageRequest = [...existingRequests.values()].find(
    (request) => request.kind === 'package' && request.specifier,
  )
  if (!packageRequest) throw new Error('AMBIGUOUS')
  const resolver = createRequire(resolve('package.json'))
  let basePath
  try {
    basePath = resolver.resolve(packageRequest.specifier)
  } catch {
    throw new Error('AMBIGUOUS')
  }
  const resolved = canonicalResource(resolve(dirname(basePath), requestPath))
  if (!pathBelongsToPackage(resolved, packageRequest.identity)) {
    throw new Error('AMBIGUOUS')
  }
  return resolved
}

function normalizeExternalStructured(value, depth = 0, seen = new Set()) {
  if (
    depth > 8 ||
    !value ||
    typeof value !== 'object' ||
    utilTypes.isProxy(value) ||
    seen.has(value)
  ) {
    return null
  }
  seen.add(value)
  let candidates = []
  if (Array.isArray(value)) {
    if (
      value.length === 2 &&
      typeof value[0] === 'string' &&
      EXTERNAL_PREFIXES.has(value[0].toLowerCase())
    ) {
      const candidate = normalizeExternalValue(value[1], depth + 1, seen)
      candidates = candidate ? [candidate] : []
    } else {
      candidates = value.map((item) =>
        normalizeExternalValue(item, depth + 1, seen),
      )
    }
  } else {
    const descriptors = Object.getOwnPropertyDescriptors(value)
    const keys = Object.keys(descriptors).sort()
    if (!keys.length || keys.some((key) => !('value' in descriptors[key])))
      return null
    const externalKeys = keys.filter((key) =>
      EXTERNAL_PREFIXES.has(key.toLowerCase()),
    )
    const values =
      externalKeys.length === 1 && keys.length === 1
        ? [descriptors[externalKeys[0]].value]
        : keys.map((key) => descriptors[key].value)
    candidates = values.map((item) =>
      normalizeExternalValue(item, depth + 1, seen),
    )
  }
  seen.delete(value)
  const valid = candidates.filter(Boolean)
  const unique = new Map(
    valid.map((candidate) => [
      `${candidate.kind}:${candidate.identity}`,
      candidate,
    ]),
  )
  return valid.length === candidates.length && unique.size === 1
    ? [...unique.values()][0]
    : null
}

function normalizeExternalValue(value, depth, seen) {
  if (typeof value === 'string') return normalizeExternalRequest(value)
  return normalizeExternalStructured(value, depth, seen)
}

function packageRoot(specifier) {
  const parts = specifier.split('/')
  if (specifier.startsWith('@')) {
    if (parts.length < 2 || !parts[0].slice(1) || !parts[1]) return null
    return `${parts[0]}/${parts[1]}`
  }
  return parts[0] || null
}

function pathBelongsToPackage(filePath, packageName) {
  const relativePackage = packageName.split('/').join(sep)
  return filePath.includes(`${sep}node_modules${sep}${relativePackage}${sep}`)
}

function classifyExternalIdentity(
  identity,
  policy,
  repositoryRoot = process.cwd(),
) {
  if (identity.startsWith('node:')) return 'node-builtin'
  if (
    identity.startsWith('/') ||
    identity.startsWith('./') ||
    identity.startsWith('../')
  ) {
    const local = classifyProductionModule(identity, { repositoryRoot })
    return local.violation ? 'forbidden' : 'approved-local'
  }
  const folded = identity.normalize('NFKC').toLowerCase()
  const allNames = new Set([...policy.production, ...policy.development])
  const alias = [...allNames].find(
    (name) => name.normalize('NFKC').toLowerCase() === folded,
  )
  if (alias && alias !== identity) return 'forbidden'
  if (
    policy.development.has(identity) ||
    identity.startsWith('@jest/') ||
    identity.startsWith('@vitest/') ||
    identity.startsWith('@testing-library/')
  ) {
    return 'development-only'
  }
  if (policy.production.has(identity)) return 'production-package'
  return null
}

function readDataProperty(object, key) {
  if (!object || (typeof object !== 'object' && typeof object !== 'function'))
    return undefined
  if (utilTypes.isProxy(object)) throw new Error('UNSAFE_PROXY')
  const descriptor = Object.getOwnPropertyDescriptor(object, key)
  if (descriptor)
    return 'value' in descriptor
      ? descriptor.value
      : (() => {
          throw new Error('UNSAFE_GETTER')
        })()
  const prototype = Object.getPrototypeOf(object)
  if (!prototype || prototype === Object.prototype) return undefined
  const inherited = Object.getOwnPropertyDescriptor(prototype, key)
  if (!inherited) return undefined
  if (!('value' in inherited)) throw new Error('UNSAFE_GETTER')
  return inherited.value
}

function readNestedDataProperty(object, path) {
  let value = object
  for (const key of path) value = readDataProperty(value, key)
  return value
}

function invokeModuleMethod(object, key, ...args) {
  const method = readDataProperty(object, key)
  if (method === undefined) return undefined
  if (typeof method !== 'function' || utilTypes.isProxy(method))
    throw new Error('INVALID_MODULE_METHOD')
  try {
    return method.apply(object, args)
  } catch {
    return undefined
  }
}

function invokeModuleMethodStrict(object, key, ...args) {
  const method = readDataProperty(object, key)
  if (method === undefined) return undefined
  if (typeof method !== 'function' || utilTypes.isProxy(method)) {
    throw new Error('INVALID_MODULE_METHOD')
  }
  return method.apply(object, args)
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
