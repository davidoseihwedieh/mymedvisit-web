import { configDefaults, defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      ...configDefaults.exclude,
      'tests/browser/**',
      'tests/bfcache/**',
      'tests/enforcement/**',
      // Owned by vitest.cross-repo.config.ts, which resolves
      // @sms-consent-backend/* to a checked-out backend service via
      // SMS_CONSENT_BACKEND_ROOT. The default config has no such alias and
      // no backend checkout, so this file must never run under `npm test`.
      'tests/contracts/**',
    ],
  },
})
