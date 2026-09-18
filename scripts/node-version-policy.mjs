import { readFile } from 'node:fs/promises'

export const EXPECTED_NODE_VERSION = '22.22.1'

export async function readAndValidateNodeMetadata({ root = '.' } = {}) {
  const [pinSource, packageSource, lockSource] = await Promise.all([
    readFile(`${root}/.node-version`, 'utf8'),
    readFile(`${root}/package.json`, 'utf8'),
    readFile(`${root}/package-lock.json`, 'utf8'),
  ])

  if (pinSource !== `${EXPECTED_NODE_VERSION}\n`) {
    throw new Error('NODE_PIN_NOT_CANONICAL')
  }

  const packageJson = JSON.parse(packageSource)
  const packageLock = JSON.parse(lockSource)
  if (packageJson.engines?.node !== EXPECTED_NODE_VERSION) {
    throw new Error('PACKAGE_NODE_ENGINE_MISMATCH')
  }
  if (packageLock.packages?.['']?.engines?.node !== EXPECTED_NODE_VERSION) {
    throw new Error('LOCKFILE_NODE_ENGINE_MISMATCH')
  }

  return {
    packageEngine: packageJson.engines.node,
    pin: EXPECTED_NODE_VERSION,
  }
}
