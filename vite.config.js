import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'CHAT_')
  const chatTarget = `http://localhost:${process.env.CHAT_PORT || env.CHAT_PORT || 3001}`

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': chatTarget,
        '/socket.io': { target: chatTarget, ws: true },
      },
    },
  }
})
