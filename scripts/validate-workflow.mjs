import { readFile } from 'node:fs/promises'
import { parse } from 'yaml'

const workflowPath = '.github/workflows/sms-consent-ci.yml'
const source = await readFile(workflowPath, 'utf8')
const workflow = parse(source)

failUnless(workflow && typeof workflow === 'object', 'WORKFLOW_INVALID')
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
failUnless(
  !/\b(vercel|deploy|deployment|upload-artifact)\b/i.test(
    Object.values(workflow.jobs ?? {})
      .flatMap((job) => job.steps ?? [])
      .map((step) => step.run ?? '')
      .join('\n'),
  ),
  'WORKFLOW_EXTERNAL_MUTATION',
)

for (const job of Object.values(workflow.jobs ?? {})) {
  const steps = job.steps ?? []
  const setupIndex = steps.findIndex((step) =>
    String(step.uses ?? '').startsWith('actions/setup-node@'),
  )
  const assertionIndex = steps.findIndex(
    (step) => step.run === 'node scripts/assert-node-version.mjs',
  )
  const installIndex = steps.findIndex((step) => step.run === 'npm ci')

  failUnless(setupIndex >= 0, 'WORKFLOW_NODE_SETUP_MISSING')
  failUnless(
    steps[setupIndex]?.with?.['node-version-file'] === '.node-version',
    'WORKFLOW_NODE_PIN_NOT_CONSUMED',
  )
  failUnless(
    assertionIndex > setupIndex && installIndex > assertionIndex,
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
  'npm run verify:sms-artifacts',
  'npm run verify:qr',
  'npm run audit:production',
  'npm run audit:development',
  'npm run test:browser -- --project=${{ matrix.browser }}',
  'xvfb-run -a npm run test:bfcache',
]
const commands = Object.values(workflow.jobs ?? {})
  .flatMap((job) => job.steps ?? [])
  .map((step) => step.run)

for (const command of requiredCommands) {
  failUnless(commands.includes(command), 'WORKFLOW_REQUIRED_GATE_MISSING')
}

process.stdout.write(
  `Workflow syntax and exact-Node safety structure validated (${workflowPath}).\n`,
)

function failUnless(condition, rule) {
  if (!condition) {
    throw new Error(rule)
  }
}
