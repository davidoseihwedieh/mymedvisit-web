import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'yaml'
import {
  EXPECTED_NODE_VERSION,
  readAndValidateNodeMetadata,
} from './node-version-policy.mjs'

export const WORKFLOW_PATH = '.github/workflows/sms-consent-ci.yml'

/**
 * @param {{
 *   source: string,
 *   workflow?: any,
 *   metadata: {pin: string, packageEngine: string}
 * }} options
 */
export async function validateWorkflow(options) {
  const { source, workflow = parse(source), metadata } = options
  failUnless(metadata?.pin === EXPECTED_NODE_VERSION, 'NODE_METADATA_MISMATCH')
  failUnless(
    metadata?.packageEngine === EXPECTED_NODE_VERSION,
    'NODE_METADATA_MISMATCH',
  )
  failUnless(isPlainRecord(workflow), 'WORKFLOW_INVALID')
  failUnless(workflow.on?.push !== undefined, 'WORKFLOW_PUSH_MISSING')
  failUnless(
    workflow.on?.pull_request !== undefined,
    'WORKFLOW_PULL_REQUEST_MISSING',
  )
  failUnless(
    !source.includes('paths:') && !source.includes('paths-ignore:'),
    'WORKFLOW_PATH_BYPASS',
  )
  failUnless(!source.includes('continue-on-error'), 'WORKFLOW_FAILURE_MASKING')

  const jobs = workflow.jobs
  failUnless(
    isPlainRecord(jobs) && Object.keys(jobs).length > 0,
    'WORKFLOW_JOBS_MISSING',
  )
  const allSteps = Object.values(jobs).flatMap((job) => job.steps ?? [])
  failUnless(
    !/\b(vercel|deploy|deployment|upload-artifact)\b/i.test(
      allSteps.map((step) => step.run ?? '').join('\n'),
    ),
    'WORKFLOW_EXTERNAL_MUTATION',
  )

  for (const job of Object.values(jobs)) {
    const steps = job.steps
    failUnless(
      Array.isArray(steps) && steps.length > 0,
      'WORKFLOW_STEPS_MISSING',
    )
    const setupIndexes = indexesWhere(steps, (step) =>
      String(step.uses ?? '').startsWith('actions/setup-node@'),
    )
    const assertionIndexes = indexesWhere(
      steps,
      (step) => step.run === 'node scripts/assert-node-version.mjs',
    )
    const installIndexes = indexesWhere(steps, (step) => step.run === 'npm ci')
    const firstRunIndex = steps.findIndex((step) =>
      Object.prototype.hasOwnProperty.call(step, 'run'),
    )

    failUnless(
      setupIndexes.length === 1,
      'WORKFLOW_NODE_SETUP_MISSING_OR_DUPLICATE',
    )
    failUnless(
      assertionIndexes.length === 1,
      'WORKFLOW_NODE_ASSERTION_MISSING_OR_DUPLICATE',
    )
    failUnless(
      installIndexes.length === 1,
      'WORKFLOW_INSTALL_MISSING_OR_DUPLICATE',
    )

    const setupIndex = setupIndexes[0]
    const assertionIndex = assertionIndexes[0]
    const installIndex = installIndexes[0]
    const setup = steps[setupIndex]
    failUnless(
      setup.with?.['node-version-file'] === '.node-version' &&
        !Object.prototype.hasOwnProperty.call(setup.with ?? {}, 'node-version'),
      'WORKFLOW_NODE_PIN_NOT_CONSUMED_EXACTLY',
    )
    failUnless(
      firstRunIndex === assertionIndex &&
        assertionIndex > setupIndex &&
        installIndex > assertionIndex,
      'WORKFLOW_NODE_ASSERTION_ORDER',
    )
  }

  const requiredCommands = [
    'npm run format:check:sms',
    'npm run typecheck',
    'npm run lint',
    'npm run lint:sms -- --max-warnings=0',
    'npm test',
    'npm run test:enforcement',
    'npm run build',
    'npm run verify:module-graph',
    'npm run verify:sms-artifacts',
    'npm run verify:qr',
    'npm run audit:production',
    'npm run audit:development',
    'npm run test:browser -- --project=${{ matrix.browser }}',
    'xvfb-run -a npm run test:bfcache',
  ]
  const commands = allSteps.map((step) => step.run)

  for (const command of requiredCommands) {
    failUnless(commands.includes(command), 'WORKFLOW_REQUIRED_GATE_MISSING')
  }

  return { jobCount: Object.keys(jobs).length, nodeVersion: metadata.pin }
}

function indexesWhere(values, predicate) {
  const indexes = []
  for (const [index, value] of values.entries()) {
    if (predicate(value)) indexes.push(index)
  }
  return indexes
}

function isPlainRecord(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

function failUnless(condition, rule) {
  if (!condition) {
    throw new Error(rule)
  }
}

const isCli =
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
if (isCli) {
  const [source, metadata] = await Promise.all([
    readFile(WORKFLOW_PATH, 'utf8'),
    readAndValidateNodeMetadata(),
  ])
  const result = await validateWorkflow({ source, metadata })
  process.stdout.write(
    `Workflow and exact Node ${result.nodeVersion} safety structure validated (${result.jobCount} jobs).\n`,
  )
}
