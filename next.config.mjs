import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { SmsConsentProductionModuleGraphPlugin } from './scripts/production-module-graph-plugin.mjs'

const repositoryRoot = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  output: 'export',
  webpack(config, { dev, isServer, nextRuntime }) {
    if (
      dev &&
      process.env.NEXT_PUBLIC_SMS_CONSENT_BROWSER_TEST_MODE === 'local-mock'
    ) {
      config.resolve.alias = {
        '../../lib/sms-consent/browserClientBoundary$': resolve(
          repositoryRoot,
          'src/lib/sms-consent/browserTestClient.ts',
        ),
        ...config.resolve.alias,
      }
    }

    if (!dev) {
      const target = isServer
        ? nextRuntime === 'edge'
          ? 'edge-server'
          : 'server'
        : 'client'
      config.plugins.push(
        new SmsConsentProductionModuleGraphPlugin({
          repositoryRoot,
          reportRoot: resolve(repositoryRoot, '.next/sms-consent-module-graph'),
          target,
        }),
      )
    }

    return config
  },
}

export default nextConfig
