import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  snapshotDir: './tests/__screenshots__',
  use: { 
    baseURL: 'http://localhost:5173',
    // Disable any global setup that might conflict
  },
  reporter: [['list']],
  // Explicitly exclude vitest files
  testMatch: /.*\.spec\.ts$/,
  // Don't use any Vitest globals
  fullyParallel: true,
})
