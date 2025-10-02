import { defineConfig } from 'vite'

// Ultra-minimal configuration for testing
export default defineConfig({
  server: {
    port: 5173,
    host: '127.0.0.1'
  }
})