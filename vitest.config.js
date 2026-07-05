import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['framework/**/*.test.js', 'todo/**/*.test.js']
  }
})
