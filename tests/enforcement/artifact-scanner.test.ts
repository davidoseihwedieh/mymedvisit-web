import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  ArtifactScanError,
  MAX_ARTIFACT_BYTES,
  scanArtifacts,
} from '../../scripts/scan-sms-artifacts.mjs'

const roots: string[] = []

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true })),
  )
})

describe('structural production artifact scanner', () => {
  it.each([
    [
      'concatenated',
      "const x='https://'+'capture'+'.invalid/api/v1/sms-consent'",
    ],
    [
      'hex escaped',
      String.raw`const x='\x68\x74\x74\x70\x73\x3a\x2f\x2frecaptcha.invalid'`,
    ],
    ['Unicode escaped', String.raw`const x='https://capture\u002einvalid'`],
    [
      'percent encoded',
      "const x=decodeURIComponent('https%3A%2F%2Fcapture.invalid')",
    ],
    ['base64 encoded', "const x=atob('aHR0cHM6Ly9jYXB0dXJlLmludmFsaWQ=')"],
    ['minified phone', "const x='+1'+'202'+'555'+'0123';"],
    [
      'template literal',
      'const host="capture";const x=`https://${host}.invalid`',
    ],
  ])('rejects %s reconstructed values', async (_label, source) => {
    const root = await safeRoot()
    await writeFile(join(root, 'chunk'), source)
    await expectScanRule(root, /ARTIFACT_/)
  })

  it('scans hidden, extensionless, and deeply nested artifacts', async () => {
    const root = await safeRoot()
    await mkdir(join(root, '.hidden', 'nested'), { recursive: true })
    await writeFile(join(root, '.hidden', 'nested', 'payload'), '.invalid')
    await expectScanRule(root, /ARTIFACT_INVALID_HOSTNAME/)
  })

  it('rejects symlinks without following them', async () => {
    const root = await safeRoot()
    await writeFile(join(root, 'target'), 'safe')
    await symlink('target', join(root, 'linked'))
    await expectScanRule(root, /ARTIFACT_SYMLINK linked/)
  })

  it('rejects unexpected binary content', async () => {
    const root = await safeRoot()
    await writeFile(join(root, 'binary'), Buffer.from([0, 1, 2, 3, 255]))
    await expectScanRule(root, /ARTIFACT_UNEXPECTED_BINARY binary/)
  })

  it('rejects oversized content before parsing it', async () => {
    const root = await safeRoot()
    await writeFile(
      join(root, 'oversized'),
      Buffer.alloc(MAX_ARTIFACT_BYTES + 1),
    )
    await expectScanRule(root, /ARTIFACT_OVERSIZED oversized/)
  })

  it('accepts expected content-classified static assets including SVG', async () => {
    const root = await safeRoot()
    await writeFile(join(root, 'qr-without-an-extension'), '<svg></svg>')
    await writeFile(
      join(root, 'image-without-an-extension'),
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
    await expect(scanArtifacts({ outputRoot: root })).resolves.toMatchObject({
      binaryCount: 1,
    })
  })

  it('rejects disabled production modules by AST identifier', async () => {
    const root = await safeRoot()
    await writeFile(join(root, 'chunk'), 'createHttpSmsConsentTransport()')
    await expectScanRule(root, /MODULE_GRAPH_HTTP_TRANSPORT/)
  })
})

async function safeRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'mmv-artifact-scan-'))
  roots.push(root)
  await writeFile(join(root, 'sms-opt-in.html'), '<!doctype html><p>safe</p>')
  return root
}

async function expectScanRule(root: string, rule: RegExp): Promise<void> {
  try {
    await scanArtifacts({ outputRoot: root })
    throw new Error('expected scan failure')
  } catch (error) {
    expect(error).toBeInstanceOf(ArtifactScanError)
    expect((error as Error).message).toMatch(rule)
    expect((error as Error).message).not.toContain('https://')
    expect((error as Error).message).not.toContain('+12025550123')
  }
}
