import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'

await rm(resolve('.next/sms-consent-module-graph'), {
  force: true,
  recursive: true,
})

process.stdout.write('Prepared production module-graph report directory.\n')
