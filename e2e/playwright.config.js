import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  timeout: 10000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: 'npx vite --root todo',
    port: 5173,
    reuseExistingServer: true,
  },
})
