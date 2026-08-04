import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Импортируем плагин

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  // GitHub Pages отдаёт сайт из подпапки /MazerexDev/, а Vercel и Cloudflare
  // Pages — из корня. Переменные VERCEL / CF_PAGES эти хостинги проставляют
  // сами во время сборки, поэтому один репозиторий собирается под все три.
  base: process.env.VERCEL || process.env.CF_PAGES ? '/' : '/MazerexDev/',
})