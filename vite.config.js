import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://192.168.1.234:8080',
        changeOrigin: true,
      },
      '/images': {
        target: 'http://192.168.1.234:8080',
        changeOrigin: true,
      },
    },
  },
})
