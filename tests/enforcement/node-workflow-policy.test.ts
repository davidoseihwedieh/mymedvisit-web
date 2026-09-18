import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parse, stringify } from 'yaml'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
  EXPECTED_NODE_VERSION,
  readAndValidateNodeMetadata,
} from '../../scripts/node-version-policy.mjs'
import {
  validateWorkflow,
  WORKFLOW_PATH,
} from '../../scripts/validate-workflow.mjs'

let source: string
const roots: string[] = []
const exactMetadata = {
  packageEngine: EXPECTED_NODE_VERSION,
  pin: EXPECTED_NODE_VERSION,
}

beforeAll(async () => {
  source = await readFile(WORKFLOW_PATH, 'utf8')
})

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { force: true, recursive: true })),
  )
})

describe('exact Node metadata and workflow enforcement', () => {
  it('accepts only the canonical exact pin in package and lock metadata', async () => {
    const root = await metadataRoot()
    await expect(readAndValidateNodeMetadata({ root })).resolves.toEqual(
      exactMetadata,
    )
  })

  it.each([
    ['range', '>=22.22.1 <23', `${EXPECTED_NODE_VERSION}\n`],
    ['alias', 'lts/*', `${EXPECTED_NODE_VERSION}\n`],
    [
      'package whitespace',
      ` ${EXPECTED_NODE_VERSION}`,
      `${EXPECTED_NODE_VERSION}\n`,
    ],
    ['pin whitespace', EXPECTED_NODE_VERSION, ` ${EXPECTED_NODE_VERSION}\n`],
    ['pin missing newline', EXPECTED_NODE_VERSION, EXPECTED_NODE_VERSION],
  ])('rejects %s metadata', async (_label, engine, pinSource) => {
    const root = await metadataRoot({ engine, pinSource })
    await expect(readAndValidateNodeMetadata({ root })).rejects.toThrow(
      /NODE_|LOCKFILE_/,
    )
  })

  it('proves every setup-node job consumes the exact pin before any run step', async () => {
    await expect(
      validateWorkflow({ source, metadata: exactMetadata }),
    ).resolves.toMatchObject({ nodeVersion: EXPECTED_NODE_VERSION })
  })

  it.each([
    [
      'range metadata',
      (workflow: Workflow) => workflow,
      { ...exactMetadata, packageEngine: '>=22.22.1 <23' },
    ],
    [
      'setup alias',
      (workflow: Workflow) => {
        const setup = workflow.jobs.validate!.steps[1]!
        setup.with = { 'node-version': 'lts/*' }
        return workflow
      },
      exactMetadata,
    ],
    [
      'YAML-coerced setup value',
      (workflow: Workflow) => {
        workflow.jobs.validate!.steps[1]!.with = {
          'node-version-file': 22.22,
        }
        return workflow
      },
      exactMetadata,
    ],
    [
      'whitespace setup value',
      (workflow: Workflow) => {
        workflow.jobs.validate!.steps[1]!.with = {
          'node-version-file': '.node-version ',
        }
        return workflow
      },
      exactMetadata,
    ],
    [
      'missing setup job',
      (workflow: Workflow) => {
        workflow.jobs.browser!.steps.splice(1, 1)
        return workflow
      },
      exactMetadata,
    ],
    [
      'pre-assertion command',
      (workflow: Workflow) => {
        workflow.jobs.validate!.steps.splice(2, 0, { run: 'node --version' })
        return workflow
      },
      exactMetadata,
    ],
  ])('rejects %s', async (_label, mutate, metadata) => {
    const workflow = mutate(structuredClone(parse(source)) as Workflow)
    await expect(
      validateWorkflow({
        source: stringify(workflow),
        workflow,
        metadata,
      }),
    ).rejects.toThrow(/WORKFLOW_|NODE_/)
  })
})

interface Workflow {
  jobs: Record<
    string,
    {
      steps: Array<{
        run?: string
        uses?: string
        with?: Record<string, string | number>
      }>
    }
  >
}

async function metadataRoot({
  engine = EXPECTED_NODE_VERSION,
  pinSource = `${EXPECTED_NODE_VERSION}\n`,
}: {
  engine?: string
  pinSource?: string
} = {}): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'mmv-node-policy-'))
  roots.push(root)
  await Promise.all([
    writeFile(join(root, '.node-version'), pinSource),
    writeFile(
      join(root, 'package.json'),
      JSON.stringify({ engines: { node: engine } }),
    ),
    writeFile(
      join(root, 'package-lock.json'),
      JSON.stringify({ packages: { '': { engines: { node: engine } } } }),
    ),
  ])
  return root
}
