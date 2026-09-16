import {
  EXPECTED_NODE_VERSION,
  readAndValidateNodeMetadata,
} from './node-version-policy.mjs'

const metadata = await readAndValidateNodeMetadata()
const running = process.version.replace(/^v/, '')

if (running !== EXPECTED_NODE_VERSION) {
  throw new Error('NODE_VERSION_MISMATCH')
}

process.stdout.write(
  `Node runtime and repository metadata match the exact pin (${metadata.pin}).\n`,
)
