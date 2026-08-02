import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Импортируем плагин

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  // GitHub Pages отдаёт сайт из подпапки /MazerexDev/, а Cloudflare Pages —
  // из корня. CF_PAGES проставляется самим Cloudflare во время сборки, поэтому
  // один и тот же репозиторий корректно собирается под оба хостинга.
  base: process.env.CF_PAGES ? '/' : '/MazerexDev/',
})