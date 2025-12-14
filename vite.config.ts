import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({ 
  plugins: [vue()], 
  server: { port: 5173 },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/pixel.spec.ts']
  }
})
