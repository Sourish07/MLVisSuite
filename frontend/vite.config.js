import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Keep the same port as before
    proxy: { // Setup proxy for backend API calls
        '/api': {
            target: 'http://127.0.0.1:8000', // Your backend server address
            changeOrigin: true,
            // rewrite: (path) => path.replace(/^\/api/, '') // Optional: remove /api prefix if backend doesn't expect it
        }
    }
  }
})
