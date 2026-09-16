import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4180'

export default defineConfig({
  testDir: './tests/bfcache',
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['./tests/browser/no-skips-reporter.ts']],
  use: {
    baseURL,
    serviceWorkers: 'block',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium-bfcache-observation',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        launchOptions: {
          ignoreDefaultArgs: ['--disable-back-forward-cache'],
          args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'],
        },
      },
    },
  ],
  webServer: {
    command: 'node scripts/serve-static.mjs out',
    url: `${baseURL}/sms-opt-in`,
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: { PORT: '4180' },
  },
})
