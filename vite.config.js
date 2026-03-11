import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/images/html/' : '/',
  plugins: [vue()],
  build: {
    outDir: '/root/scorpio/antares_assets/images/html',
  },
  server: {
    host: true,
    proxy: {
      '/ws':{
        target: 'http://192.168.1.234:8080',
        changeOrigin: true,
        ws: true,
      },
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
