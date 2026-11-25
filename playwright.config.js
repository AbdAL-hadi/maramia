import { defineConfig } from '@playwright/test'

const port = 4180
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.js',
  workers: 2,
  timeout: 45_000,
  use: {
    baseURL,
    channel: process.env.PLAYWRIGHT_CHANNEL,
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  },
})
