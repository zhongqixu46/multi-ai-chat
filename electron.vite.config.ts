// 构建配置：electron-vite 默认入口就是 src/main/index.ts、src/preload/index.ts、src/renderer/index.html
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    build: {
      // 原生模块（加密 SQLite）不能被打包进 JS，运行时直接从 node_modules 加载
      rollupOptions: { external: ['better-sqlite3-multiple-ciphers'] },
    },
  },
  preload: {},
  renderer: {
    plugins: [react(), tailwindcss()],
  },
})
