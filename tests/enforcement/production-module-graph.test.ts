import { createRequire } from 'node:module'
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  SmsConsentProductionModuleGraphPlugin,
  classifyExternalReportEntry,
  classifyProductionModule,
} from '../../scripts/production-module-graph-plugin.mjs'

const require = createRequire(import.meta.url)
const { webpack } = require('next/dist/compiled/webpack/webpack') as {
  webpack: (
    configuration: unknown,
    callback: (error?: Error, stats?: Stats) => void,
  ) => void
}

interface Stats {
  hasErrors(): boolean
  toJson(options: unknown): { errors?: Array<{ message?: string }> }
}

interface ExternalModuleFixture {
  externalType?: unknown
  request?: unknown
  userRequest?: unknown
  identifier?: () => string
  readableIdentifier?: (shortener: unknown) => string
}

interface CompilerFixture {
  hooks: {
    compilation: {
      tap: (
        name: string,
        callback: (compilation: {
          hooks: {
            finishModules: {
              tap: (
                name: string,
                callback: (modules: Iterable<ExternalModuleFixture>) => void,
              ) => void
            }
          }
        }) => void,
      ) => void
    }
  }
}

const roots: string[] = []

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  )
})

describe('authoritative production compiler graph enforcement', () => {
  it.each(['commonjs', 'commonjs2'])(
    'rejects external %s vitest during an actual production compilation',
    async (externalType) => {
      const root = await fixtureRoot()
      await writeFile(join(root, 'entry.js'), `import 'vitest'\n`)
      const result = await compile(root, {
        externals: { vitest: `${externalType} vitest` },
      })
      expect(result.hasErrors).toBe(true)
      expect(result.rules).toContain('MODULE_GRAPH_TEST_ONLY_EXTERNAL')
    },
  )

  it('rejects an external package even when its identifier looks benign', async () => {
    const root = await fixtureRoot()
    await writeFile(join(root, 'entry.js'), `import 'vitest'\n`)
    const result = await compile(root, {
      externals: ({ request }: { request: string }, callback: Function) => {
        callback(null, request === 'vitest' ? 'commonjs vitest' : undefined)
      },
    })
    expect(result.hasErrors).toBe(true)
    expect(result.rules).toContain('MODULE_GRAPH_TEST_ONLY_EXTERNAL')
  })

  it('classifies the actual request even when an ExternalModule identifier is benign', async () => {
    const root = await fixtureRoot()
    await writeFile(join(root, 'entry.js'), `import 'vitest'\n`)
    const result = await compile(root, {
      externals: { vitest: 'commonjs vitest' },
      mutateExternal: (module) => {
        module.identifier = () => 'external commonjs "harmless-production-name"'
        module.readableIdentifier = () => 'external "harmless-production-name"'
      },
    })
    expect(result.hasErrors).toBe(true)
    expect(result.rules).toContain('MODULE_GRAPH_TEST_ONLY_EXTERNAL')
  })

  it('classifies userRequest-only forbidden external metadata', async () => {
    const root = await fixtureRoot()
    await writeFile(join(root, 'entry.js'), `import 'vitest'\n`)
    const result = await compile(root, {
      externals: { vitest: 'commonjs harmless-production-name' },
      mutateExternal: (module) => {
        module.request = undefined
        module.userRequest = 'vitest'
        module.identifier = () => 'external commonjs "harmless-production-name"'
        module.readableIdentifier = () => 'external "harmless-production-name"'
      },
    })
    expect(result.hasErrors).toBe(true)
    expect(result.rules).toContain('MODULE_GRAPH_TEST_ONLY_EXTERNAL')
  })

  it('fails closed when external request metadata cannot be safely inspected', async () => {
    const root = await fixtureRoot()
    await writeFile(join(root, 'entry.js'), `import 'vitest'\n`)
    const result = await compile(root, {
      externals: { vitest: 'commonjs vitest' },
      mutateExternal: (module) => {
        Object.defineProperty(module, 'userRequest', {
          configurable: true,
          get() {
            throw new Error('fixture getter')
          },
        })
      },
    })
    expect(result.hasErrors).toBe(true)
    expect(result.rules).toContain('MODULE_GRAPH_UNINSPECTABLE_EXTERNAL')
  })

  it('rejects an external module with an unsupported external type', async () => {
    const root = await fixtureRoot()
    await writeFile(join(root, 'entry.js'), `import 'resend'\n`)
    const result = await compile(root, {
      externals: { resend: 'commonjs resend' },
      mutateExternal: (webpackModule) => {
        webpackModule.externalType = 'unrecognized-external-kind'
      },
    })
    expect(result.hasErrors).toBe(true)
    expect(result.rules).toContain('MODULE_GRAPH_UNINSPECTABLE_EXTERNAL')
  })

  it('rejects an externalized forbidden local path', async () => {
    const root = await fixtureRoot()
    const forbidden = join(root, 'src/lib/sms-consent/browserTestClient.js')
    await mkdir(dirname(forbidden), { recursive: true })
    await writeFile(forbidden, 'export default 1\n')
    await writeFile(
      join(root, 'entry.js'),
      `import ${JSON.stringify(forbidden)}\n`,
    )
    const result = await compile(root, {
      externals: { [forbidden]: `commonjs ${forbidden}` },
    })
    expect(result.hasErrors).toBe(true)
    expect(result.rules).toContain('MODULE_GRAPH_BROWSER_TEST_CLIENT')
  })

  it('rejects a computed dynamic import that Webpack externalizes', async () => {
    const root = await fixtureRoot()
    await writeFile(join(root, 'entry.js'), `void import('vit' + 'est')\n`)
    const result = await compile(root, {
      externals: { vitest: 'commonjs vitest' },
    })
    expect(result.hasErrors).toBe(true)
    expect(result.rules).toContain('MODULE_GRAPH_TEST_ONLY_EXTERNAL')
  })

  it.each(['vitest/subpath', '@playwright/test', '@playwright/test/runner'])(
    'rejects scoped and package-subpath external %s',
    async (request) => {
      const root = await fixtureRoot()
      await writeFile(
        join(root, 'entry.js'),
        `import ${JSON.stringify(request)}\n`,
      )
      const result = await compile(root, {
        externals: { [request]: `commonjs ${request}` },
      })
      expect(result.hasErrors).toBe(true)
      expect(result.rules).toContain('MODULE_GRAPH_TEST_ONLY_EXTERNAL')
    },
  )

  it.each([
    '@vitest/runner',
    '@testing-library/dom',
    'jest-mock',
    'playwright-core',
  ])('rejects transitive test tooling external %s', async (request) => {
    const root = await fixtureRoot()
    await writeFile(
      join(root, 'entry.js'),
      `import ${JSON.stringify(request)}\n`,
    )
    const result = await compile(root, {
      externals: { [request]: `commonjs ${request}` },
    })
    expect(result.hasErrors).toBe(true)
    expect(result.rules).toContain('MODULE_GRAPH_TEST_ONLY_EXTERNAL')
  })

  it.each([
    ['array', ['commonjs', 'vitest']],
    ['nested array', [['commonjs', 'vitest']]],
    ['object', { commonjs: 'vitest' }],
    ['nested object', { metadata: { commonjs: 'vitest' } }],
  ])(
    'fails external %s request representations closed',
    async (_label, request) => {
      const root = await fixtureRoot()
      await writeFile(join(root, 'entry.js'), `import 'trigger'\n`)
      const result = await compile(root, {
        externals: (
          _: unknown,
          callback: (error: null, value: unknown) => void,
        ) => {
          callback(null, request)
        },
      })
      expect(result.hasErrors).toBe(true)
      expect(
        result.rules.some((rule) => rule.startsWith('MODULE_GRAPH_')),
      ).toBe(true)
    },
  )

  it('accepts approved production externals and node built-ins in the report', async () => {
    const root = await fixtureRoot()
    await writeFile(
      join(root, 'entry.js'),
      `import 'resend'; import 'react-dom'; import 'node:path'\n`,
    )
    const result = await compile(root, {
      externals: {
        resend: 'commonjs resend',
        'react-dom': 'commonjs react-dom',
        'node:path': 'node-commonjs node:path',
      },
    })
    expect(result.hasErrors).toBe(false)
    const report = JSON.parse(
      await readFile(join(root, '.reports/client.json'), 'utf8'),
    )
    expect(report.externalModules).toEqual([
      {
        externalType: 'node-commonjs',
        identity: 'node:path',
        kind: 'node-builtin',
      },
      {
        externalType: 'commonjs',
        identity: 'react-dom',
        kind: 'production-package',
      },
      {
        externalType: 'commonjs',
        identity: 'resend',
        kind: 'production-package',
      },
    ])
  })

  it('rejects an unknown bare external package', async () => {
    const root = await fixtureRoot()
    await writeFile(join(root, 'entry.js'), `import 'unlisted-runtime'\n`)
    const result = await compile(root, {
      externals: { 'unlisted-runtime': 'commonjs unlisted-runtime' },
    })
    expect(result.hasErrors).toBe(true)
    expect(result.rules).toContain('MODULE_GRAPH_UNAPPROVED_EXTERNAL')
  })

  it.each([
    'Vitest',
    'vitest/../vitest',
    'vitest?mode=private',
    'vitest#private',
    'vitest\\subpath',
    'vitest\u007f',
    'vitest%2fsubpath',
    '!!loader!vitest',
    'vi test',
    'v\u0456test',
  ])(
    'fails closed for malformed or aliased external request %s',
    async (request) => {
      const root = await fixtureRoot()
      await writeFile(join(root, 'entry.js'), `import 'trigger'\n`)
      const result = await compile(root, {
        externals: {
          trigger: `commonjs ${JSON.stringify(request)}`,
        },
      })
      expect(result.hasErrors).toBe(true)
      expect(
        result.rules.some((rule) => rule.startsWith('MODULE_GRAPH_')),
      ).toBe(true)
    },
  )

  it.each([
    [
      'browser test client',
      'src/lib/sms-consent/browserTestClient.js',
      'MODULE_GRAPH_BROWSER_TEST_CLIENT',
    ],
    [
      'disabled HTTP transport',
      'src/lib/sms-consent/httpTransport.mjs',
      'MODULE_GRAPH_DISABLED_HTTP_TRANSPORT',
    ],
    [
      'disabled reCAPTCHA boundary',
      'src/lib/sms-consent/ReCaptcha.JS',
      'MODULE_GRAPH_DISABLED_RECAPTCHA_BOUNDARY',
    ],
    [
      'browser support module',
      'tests/browser/security-fixture.js',
      'MODULE_GRAPH_TEST_ONLY_MODULE',
    ],
    [
      'test fixture module',
      'src/lib/sms-consent/transport.fixture.js',
      'MODULE_GRAPH_TEST_ONLY_MODULE',
    ],
  ])(
    'fails an actual Webpack compilation importing %s',
    async (_label, path, rule) => {
      const root = await fixtureRoot()
      const forbidden = join(root, path)
      await mkdir(dirname(forbidden), { recursive: true })
      await writeFile(forbidden, 'export default 1\n')
      await writeFile(
        join(root, 'entry.js'),
        `import ${JSON.stringify(forbidden)}\n`,
      )

      const result = await compile(root)

      expect(result.hasErrors).toBe(true)
      expect(result.rules).toContain(rule)
      expect(result.diagnostics).toMatch(/^[A-Z_]+ \[[A-Za-z0-9_./-]+\]$/m)
    },
  )

  it('canonicalizes symlink, loader, query, traversal, and alias imports', async () => {
    const root = await fixtureRoot()
    const forbidden = join(root, 'src/lib/sms-consent/browserTestClient.js')
    const loader = join(root, 'identity-loader.js')
    await mkdir(dirname(forbidden), { recursive: true })
    await writeFile(forbidden, 'export default 1\n')
    await writeFile(
      loader,
      'module.exports = function(source) { return source }\n',
    )
    await symlink(forbidden, join(root, 'linked-client.js'))

    const imports = [
      `${forbidden}?variant=test`,
      `!!${loader}!${forbidden}`,
      './src/other/../lib/sms-consent/browserTestClient.js',
      './linked-client.js',
      'forbidden-alias',
    ]
    await mkdir(join(root, 'src/other'), { recursive: true })

    for (const [index, request] of imports.entries()) {
      await writeFile(
        join(root, 'entry.js'),
        `import value from ${JSON.stringify(request)}; void value\n`,
      )
      const result = await compile(root, {
        alias: { 'forbidden-alias$': forbidden },
      })
      expect(result.hasErrors, `import fixture ${index}`).toBe(true)
      expect(result.rules).toContain('MODULE_GRAPH_BROWSER_TEST_CLIENT')
    }
  })

  it('rejects duplicate-path and forbidden virtual hints without disclosing them', () => {
    const root = resolve('/approved/repository')
    expect(
      classifyProductionModule(
        '/duplicate/package/src/lib/sms-consent/httpTransport.ts',
        { repositoryRoot: root },
      ).violation,
    ).toEqual({
      ruleId: 'MODULE_GRAPH_DISABLED_HTTP_TRANSPORT',
      pathLabel: 'FORBIDDEN_MODULE',
    })
    expect(
      classifyProductionModule('virtual:\0private/recaptcha-loader-fixture', {
        repositoryRoot: root,
      }).violation,
    ).toEqual({
      ruleId: 'MODULE_GRAPH_FORBIDDEN_VIRTUAL_MODULE',
      pathLabel: 'FORBIDDEN_VIRTUAL_MODULE',
    })
  })

  it('accepts a harmless similarly named module and writes a deterministic report', async () => {
    const root = await fixtureRoot()
    const harmless = join(root, 'src/lib/sms-consent/browserTestClientSafe.js')
    await mkdir(dirname(harmless), { recursive: true })
    await writeFile(harmless, 'export default 1\n')
    await writeFile(
      join(root, 'entry.js'),
      `import ${JSON.stringify(harmless)}\n`,
    )

    const result = await compile(root)
    expect(result.hasErrors).toBe(false)
    const report = JSON.parse(
      await readFile(join(root, '.reports/client.json'), 'utf8'),
    )
    expect(report).toMatchObject({
      target: 'client',
      integrationEnabled: false,
      forbiddenModuleCount: 0,
    })
    expect(report.repositoryModules).toContain(
      'src/lib/sms-consent/browserTestClientSafe.js',
    )
  })

  it('reclassifies closed external report entries independently', () => {
    expect(
      classifyExternalReportEntry({
        externalType: 'commonjs',
        identity: 'resend',
        kind: 'production-package',
      }),
    ).toBe('production-package')
    expect(
      classifyExternalReportEntry({
        externalType: 'node-commonjs',
        identity: 'node:path',
        kind: 'node-builtin',
      }),
    ).toBe('node-builtin')
    expect(
      classifyExternalReportEntry({
        externalType: 'commonjs',
        identity: 'vitest',
        kind: 'development-only',
      }),
    ).toBe('development-only')
    expect(
      classifyExternalReportEntry({
        externalType: 'commonjs',
        identity: 'node_modules/src/lib/sms-consent/browserTestClient.js',
        kind: 'approved-local',
      }),
    ).toBe('forbidden')
    expect(
      classifyExternalReportEntry({
        externalType: 'commonjs',
        identity: 'resend',
        kind: 'production-package',
        request: 'extra-metadata',
      }),
    ).toBeNull()
  })
})

async function fixtureRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'mmv-webpack-graph-'))
  roots.push(root)
  return root
}

async function compile(
  root: string,
  resolveOptions: {
    alias?: Record<string, string>
    externals?: unknown
    mutateExternal?: (module: ExternalModuleFixture) => void
  } = {},
): Promise<{
  diagnostics: string
  hasErrors: boolean
  rules: string[]
}> {
  const { externals, mutateExternal, ...resolveOptionsOnly } = resolveOptions
  return new Promise((resolveCompilation, rejectCompilation) => {
    webpack(
      {
        mode: 'production',
        context: root,
        entry: join(root, 'entry.js'),
        optimization: { minimize: false },
        output: { path: join(root, 'dist'), filename: 'bundle.js' },
        resolve: resolveOptionsOnly,
        externals,
        plugins: [
          ...(mutateExternal ? [externalMutationPlugin(mutateExternal)] : []),
          new SmsConsentProductionModuleGraphPlugin({
            repositoryRoot: root,
            reportRoot: join(root, '.reports'),
            target: 'client',
          }),
        ],
      },
      (error, stats) => {
        if (error) {
          rejectCompilation(error)
          return
        }
        if (!stats) {
          rejectCompilation(new Error('WEBPACK_STATS_MISSING'))
          return
        }
        const errors = stats.toJson({ all: false, errors: true }).errors ?? []
        const diagnostics = errors
          .map(({ message }) => String(message ?? ''))
          .filter((message) => message.startsWith('MODULE_GRAPH_'))
          .join('\n')
        resolveCompilation({
          diagnostics,
          hasErrors: stats.hasErrors(),
          rules: diagnostics
            .split('\n')
            .filter(Boolean)
            .map((line) => line.split(' ')[0]),
        })
      },
    )
  })
}

function externalMutationPlugin(
  mutate: (webpackModule: ExternalModuleFixture) => void,
): { apply: (compiler: CompilerFixture) => void } {
  return {
    apply(compiler) {
      compiler.hooks.compilation.tap(
        'ExternalFixtureMutation',
        (compilation) => {
          compilation.hooks.finishModules.tap(
            'ExternalFixtureMutation',
            (modules) => {
              for (const webpackModule of modules) {
                if (
                  typeof webpackModule.identifier?.() === 'string' &&
                  webpackModule.identifier().startsWith('external ')
                ) {
                  mutate(webpackModule)
                }
              }
            },
          )
        },
      )
    },
  }
}
