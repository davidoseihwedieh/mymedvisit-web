import path from 'node:path'
import { defineConfig } from 'vitest/config'

const backendRoot = process.env.SMS_CONSENT_BACKEND_ROOT
if (!backendRoot) {
  throw new Error(
    'SMS_CONSENT_BACKEND_ROOT must point at the sms-consent-capture service checkout',
  )
}

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@sms-consent-backend': path.resolve(backendRoot, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/contracts/**/*.test.ts'],
  },
})
