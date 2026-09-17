import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
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
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command:
      'NEXT_PUBLIC_SMS_CONSENT_BROWSER_TEST_MODE=local-mock npm run dev -- --hostname 127.0.0.1 --port 4173',
    url: `${baseURL}/sms-opt-in`,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
