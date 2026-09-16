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

const roots: string[] = []

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  )
})

describe('authoritative production compiler graph enforcement', () => {
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
})

async function fixtureRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'mmv-webpack-graph-'))
  roots.push(root)
  return root
}

async function compile(
  root: string,
  resolveOptions: { alias?: Record<string, string> } = {},
): Promise<{
  diagnostics: string
  hasErrors: boolean
  rules: string[]
}> {
  return new Promise((resolveCompilation, rejectCompilation) => {
    webpack(
      {
        mode: 'production',
        context: root,
        entry: join(root, 'entry.js'),
        optimization: { minimize: false },
        output: { path: join(root, 'dist'), filename: 'bundle.js' },
        resolve: resolveOptions,
        plugins: [
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
