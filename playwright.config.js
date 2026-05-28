// RaK v.1.5 (946) – minimální Playwright smoke konfigurace.
// Spouští se ručně přes: npm run test:smoke
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: ['playwright-smoke.spec.js', 'playwright-monkey.spec.js'],
  timeout: 30_000,
  use: {
    baseURL: process.env.RAK_BASE_URL || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-features=BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] } : undefined
  },
  projects: [
    { name: 'chromium-mobile-small', use: { ...devices['Pixel 5'] } },
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: process.env.RAK_SKIP_WEB_SERVER === '1' ? undefined : {
    command: process.env.RAK_WEB_COMMAND || 'npx http-server . -p 4173 -c-1',
    url: process.env.RAK_BASE_URL || 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 20_000
  }
});
