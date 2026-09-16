import { readFile } from 'node:fs/promises'

const pin = (await readFile('.node-version', 'utf8')).trim()
const running = process.version.replace(/^v/, '')

if (!/^\d+\.\d+\.\d+$/.test(pin) || running !== pin) {
  throw new Error('NODE_VERSION_MISMATCH')
}

process.stdout.write(
  `Node runtime matches the exact repository pin (${pin}).\n`,
)
