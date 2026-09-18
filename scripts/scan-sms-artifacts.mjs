import { lstat, opendir, readFile } from 'node:fs/promises'
import { relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'acorn'
import * as walk from 'acorn-walk'

export const MAX_ARTIFACT_BYTES = 5 * 1024 * 1024

const forbiddenRules = [
  {
    id: 'ARTIFACT_PHONE_TEST_NUMBER',
    pattern:
      /(?:\+?1[ .-]*)?\(?[2-9]\d{2}\)?[ .-]*555[ .-]*\d{4}|\(?555\)?[ .-]*555[ .-]*\d{4}/i,
  },
  { id: 'ARTIFACT_INVALID_HOSTNAME', pattern: /\.invalid\b/i },
  {
    id: 'ARTIFACT_CAPTURE_OR_PROVIDER_ORIGIN',
    pattern: /https?:\/\/(?:api|capture|recaptcha)[a-z0-9.-]*/i,
  },
  { id: 'ARTIFACT_RECAPTCHA_ACTION', pattern: /sms_consent_submit/i },
  {
    id: 'ARTIFACT_RUNTIME_CONFIGURATION',
    pattern: /NEXT_PUBLIC_SMS_CONSENT_(?:API_BASE_URL|RECAPTCHA_SITE_KEY)/,
  },
  {
    id: 'ARTIFACT_TOKEN_MATERIAL',
    pattern: /recaptchaToken|synthetic-token|attempt-local-token/i,
  },
  {
    id: 'ARTIFACT_BROWSER_TEST_BOUNDARY',
    pattern:
      /NEXT_PUBLIC_SMS_CONSENT_BROWSER_TEST_MODE|local-mock|createLocalBrowserTestClient/i,
  },
]

export class ArtifactScanError extends Error {
  constructor(violations) {
    const sorted = violations.sort()
    super(sorted.join('\n'))
    this.name = 'ArtifactScanError'
    this.violations = sorted
  }
}

export async function scanArtifacts({
  outputRoot = resolve('out'),
  disableGateSource = resolve('src/lib/sms-consent/constants.ts'),
} = {}) {
  const root = resolve(outputRoot)
  const violations = []
  let source
  try {
    source = await readFile(disableGateSource, 'utf8')
  } catch {
    throw new ArtifactScanError(['DISABLE_GATE_UNREADABLE [source]'])
  }
  if (
    !/^export const SMS_CONSENT_INTEGRATION_ENABLED = false as const$/m.test(
      source,
    )
  ) {
    throw new ArtifactScanError(['DISABLE_GATE_CHANGED [source]'])
  }

  const files = []
  await enumerate(root, root, files, violations)
  if (!files.some(({ relativePath }) => relativePath === 'sms-opt-in.html')) {
    violations.push('ARTIFACT_ROUTE_MISSING sms-opt-in.html')
  }

  let textCount = 0
  let binaryCount = 0
  let javascriptCount = 0
  for (const artifact of files) {
    let bytes
    try {
      bytes = await readFile(artifact.absolutePath)
    } catch {
      violations.push(`ARTIFACT_UNREADABLE ${artifact.relativePath}`)
      continue
    }

    if (bytes.length > MAX_ARTIFACT_BYTES) {
      violations.push(`ARTIFACT_OVERSIZED ${artifact.relativePath}`)
      continue
    }

    if (classifyExpectedBinary(bytes)) {
      binaryCount += 1
      inspectStrings(
        [bytes.toString('latin1')],
        artifact.relativePath,
        violations,
      )
      continue
    }

    let text
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    } catch {
      violations.push(`ARTIFACT_UNEXPECTED_BINARY ${artifact.relativePath}`)
      continue
    }
    if (hasDisallowedTextControls(text)) {
      violations.push(`ARTIFACT_INVALID_TEXT_ENCODING ${artifact.relativePath}`)
      continue
    }

    textCount += 1
    inspectStrings(
      expandEncodedStrings([text]),
      artifact.relativePath,
      violations,
    )
    inspectEmbeddedContent(text, artifact.relativePath, violations)

    const astResult = inspectJavaScript(text, artifact.relativePath, violations)
    if (astResult.parsed) {
      javascriptCount += 1
      inspectStrings(
        expandEncodedStrings(astResult.constants),
        artifact.relativePath,
        violations,
      )
    } else if (
      artifact.relativePath.startsWith('_next/static/') &&
      artifact.relativePath.endsWith('.js')
    ) {
      violations.push(`ARTIFACT_JAVASCRIPT_PARSE ${artifact.relativePath}`)
    }
  }

  if (violations.length > 0) {
    throw new ArtifactScanError([...new Set(violations)])
  }

  return {
    binaryCount,
    fileCount: files.length,
    javascriptCount,
    textCount,
  }
}

async function enumerate(root, directory, files, violations) {
  let handle
  try {
    handle = await opendir(directory)
  } catch {
    violations.push(
      `ARTIFACT_DIRECTORY_UNREADABLE ${redactPath(root, directory)}`,
    )
    return
  }

  for await (const entry of handle) {
    const absolutePath = resolve(directory, entry.name)
    const relativePath = redactPath(root, absolutePath)
    if (!absolutePath.startsWith(`${root}${sep}`)) {
      violations.push(`ARTIFACT_PATH_ESCAPE ${relativePath}`)
      continue
    }

    let details
    try {
      details = await lstat(absolutePath)
    } catch {
      violations.push(`ARTIFACT_STAT_FAILED ${relativePath}`)
      continue
    }
    if (details.isSymbolicLink()) {
      violations.push(`ARTIFACT_SYMLINK ${relativePath}`)
    } else if (details.isDirectory()) {
      await enumerate(root, absolutePath, files, violations)
    } else if (details.isFile()) {
      files.push({ absolutePath, relativePath })
    } else {
      violations.push(`ARTIFACT_NON_REGULAR ${relativePath}`)
    }
  }
}

function classifyExpectedBinary(bytes) {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'png'
  }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return 'jpeg'
  }
  if (startsWith(bytes, [0x00, 0x00, 0x01, 0x00])) {
    return 'ico'
  }
  if (bytes.subarray(0, 4).toString('ascii') === 'wOF2') {
    return 'woff2'
  }
  if (
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp'
  }
  return null
}

function startsWith(bytes, signature) {
  return signature.every((value, index) => bytes[index] === value)
}

function hasDisallowedTextControls(value) {
  return /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
}

function inspectStrings(values, relativePath, violations) {
  for (const value of values) {
    for (const rule of forbiddenRules) {
      rule.pattern.lastIndex = 0
      if (rule.pattern.test(value)) {
        violations.push(`${rule.id} ${relativePath}`)
      }
    }
  }
}

function inspectJavaScript(source, relativePath, violations) {
  let ast
  try {
    ast = parse(source, {
      allowHashBang: true,
      ecmaVersion: 'latest',
      sourceType: 'script',
    })
  } catch {
    try {
      ast = parse(source, {
        allowHashBang: true,
        ecmaVersion: 'latest',
        sourceType: 'module',
      })
    } catch {
      return { constants: [], parsed: false }
    }
  }

  const bindings = new Map()
  const constants = []
  walk.simple(ast, {
    VariableDeclarator(node) {
      if (node.id.type === 'Identifier' && node.init) {
        bindings.set(node.id.name, node.init)
      }
    },
  })
  walk.full(ast, (node) => {
    const value = evaluateConstant(node, bindings, new Set())
    collectStrings(value, constants)
  })
  return { constants, parsed: true }
}

function evaluateConstant(node, bindings, seen) {
  if (!node) return undefined
  if (
    node.type === 'Literal' &&
    (typeof node.value === 'string' ||
      typeof node.value === 'number' ||
      typeof node.value === 'boolean' ||
      node.value === null)
  ) {
    return node.value
  }
  if (node.type === 'ArrayExpression') {
    const values = node.elements.map((element) =>
      element ? evaluateConstant(element, bindings, seen) : undefined,
    )
    return values.some((value) => value === undefined) ? undefined : values
  }
  if (node.type === 'ObjectExpression') {
    const result = {}
    for (const property of node.properties) {
      if (
        property.type !== 'Property' ||
        property.kind !== 'init' ||
        property.method ||
        property.shorthand
      ) {
        return undefined
      }
      const key = property.computed
        ? evaluateConstant(property.key, bindings, seen)
        : property.key.type === 'Identifier'
          ? property.key.name
          : property.key.value
      const value = evaluateConstant(property.value, bindings, seen)
      if (typeof key !== 'string' || value === undefined) return undefined
      result[key] = value
    }
    return result
  }
  if (node.type === 'TemplateLiteral') {
    let value = ''
    for (let index = 0; index < node.quasis.length; index += 1) {
      value += node.quasis[index].value.cooked ?? node.quasis[index].value.raw
      if (index < node.expressions.length) {
        const expression = evaluateConstant(
          node.expressions[index],
          bindings,
          seen,
        )
        if (typeof expression !== 'string' && typeof expression !== 'number') {
          return undefined
        }
        value += String(expression)
      }
    }
    return value
  }
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const left = evaluateConstant(node.left, bindings, seen)
    const right = evaluateConstant(node.right, bindings, seen)
    if (
      (typeof left === 'string' || typeof left === 'number') &&
      (typeof right === 'string' || typeof right === 'number')
    ) {
      return left + right
    }
  }
  if (node.type === 'Identifier' && bindings.has(node.name)) {
    if (seen.has(node.name)) return undefined
    const nextSeen = new Set(seen)
    nextSeen.add(node.name)
    return evaluateConstant(bindings.get(node.name), bindings, nextSeen)
  }
  if (node.type === 'CallExpression') {
    const args = node.arguments.map((argument) =>
      evaluateConstant(argument, bindings, seen),
    )
    if (node.callee.type === 'Identifier' && args.length === 1) {
      if (node.callee.name === 'atob' && typeof args[0] === 'string') {
        try {
          return Buffer.from(args[0], 'base64').toString('utf8')
        } catch {
          return undefined
        }
      }
      if (
        node.callee.name === 'decodeURIComponent' &&
        typeof args[0] === 'string'
      ) {
        try {
          return decodeURIComponent(args[0])
        } catch {
          return undefined
        }
      }
    }
    if (
      node.callee.type === 'MemberExpression' &&
      !node.callee.computed &&
      node.callee.object.type === 'Identifier' &&
      node.callee.object.name === 'JSON' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'parse' &&
      typeof args[0] === 'string'
    ) {
      try {
        return JSON.parse(args[0])
      } catch {
        return undefined
      }
    }
    if (
      node.callee.type === 'MemberExpression' &&
      !node.callee.computed &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'join'
    ) {
      const object = evaluateConstant(node.callee.object, bindings, seen)
      const separator = args.length === 0 ? ',' : args[0]
      if (
        Array.isArray(object) &&
        typeof separator === 'string' &&
        object.every(
          (value) =>
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value === null,
        )
      ) {
        return object.join(separator)
      }
    }
    if (
      node.callee.type === 'MemberExpression' &&
      !node.callee.computed &&
      node.callee.object.type === 'Identifier' &&
      node.callee.object.name === 'String' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'fromCharCode' &&
      args.every((value) => typeof value === 'number')
    ) {
      return String.fromCharCode(...args)
    }
  }
  if (node.type === 'MemberExpression') {
    const object = evaluateConstant(node.object, bindings, seen)
    const property = node.computed
      ? evaluateConstant(node.property, bindings, seen)
      : node.property.type === 'Identifier'
        ? node.property.name
        : undefined
    if (
      (Array.isArray(object) || isPlainObject(object)) &&
      (typeof property === 'string' || typeof property === 'number')
    ) {
      return object[property]
    }
  }
  return undefined
}

function inspectEmbeddedContent(source, relativePath, violations) {
  for (const match of source.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,
  )) {
    const attributes = match[1]
    const body = match[2]
    const typeMatch = attributes.match(
      /\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
    )
    const type = (typeMatch?.[1] ?? typeMatch?.[2] ?? typeMatch?.[3] ?? '')
      .trim()
      .toLowerCase()
    if (type === 'application/json' || type === 'application/ld+json') {
      inspectJson(body, relativePath, violations)
    } else if (
      type === '' ||
      type === 'module' ||
      type === 'text/javascript' ||
      type === 'application/javascript'
    ) {
      const result = inspectJavaScript(body, relativePath, violations)
      inspectStrings(
        expandEncodedStrings(result.constants),
        relativePath,
        violations,
      )
    }
  }

  const trimmed = source.trim()
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    inspectJson(trimmed, relativePath, violations)
  }
}

function inspectJson(source, relativePath, violations) {
  try {
    const values = []
    collectStrings(JSON.parse(source), values)
    inspectStrings(expandEncodedStrings(values), relativePath, violations)
  } catch {
    // Invalid embedded JSON is not interpreted as trusted structured data. Its
    // literal text remains covered by the complete-artifact string scan.
  }
}

function collectStrings(value, output, seen = new Set()) {
  if (typeof value === 'string') {
    output.push(value)
    return
  }
  if (value === null || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, output, seen)
  } else {
    for (const item of Object.values(value)) collectStrings(item, output, seen)
  }
}

function isPlainObject(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

function expandEncodedStrings(initialValues) {
  const values = new Set(initialValues)
  let frontier = [...initialValues]
  for (let depth = 0; depth < 3; depth += 1) {
    const next = []
    for (const value of frontier) {
      const decoded = [decodeEscapes(value), decodePercent(value)]
      for (const token of value.matchAll(/[A-Za-z0-9+/]{16,}={0,2}/g)) {
        const base64 = decodeBase64(token[0])
        if (base64 !== null) decoded.push(base64)
      }
      for (const candidate of decoded) {
        if (
          candidate !== null &&
          candidate !== value &&
          !values.has(candidate)
        ) {
          values.add(candidate)
          next.push(candidate)
        }
      }
    }
    frontier = next
  }
  return [...values]
}

function decodeEscapes(value) {
  return value
    .replace(/\\x([0-9a-f]{2})/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/\\u\{([0-9a-f]{1,6})\}/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/\\u([0-9a-f]{4})/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
}

function decodePercent(value) {
  if (!/%[0-9a-f]{2}/i.test(value)) return null
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

function decodeBase64(value) {
  try {
    const bytes = Buffer.from(value, 'base64')
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return /^[\t\n\r\x20-\x7e]+$/.test(decoded) ? decoded : null
  } catch {
    return null
  }
}

function redactPath(root, path) {
  const pathFromRoot = relative(root, path)
  return pathFromRoot || '.'
}

const isCli =
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
if (isCli) {
  const result = await scanArtifacts()
  process.stdout.write(
    `Structural privacy artifact scan passed: ${result.fileCount} files (${result.textCount} text, ${result.binaryCount} approved binary), ${result.javascriptCount} top-level JavaScript artifacts AST-parsed.\n`,
  )
}
