import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES  // この行を追加
        ? "yukidoko"            // この行を追加
        : "./",  
  plugins: [react()],
})
