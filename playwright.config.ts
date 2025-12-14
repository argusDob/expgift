import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  snapshotDir: './tests/__screenshots__',
  use: { baseURL: 'http://localhost:5173' },
  reporter: [['list']],
})
