import { defineConfig } from 'vite'
import inertia from '@adonisjs/inertia/client'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath } from 'node:url' // Thêm dòng này

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    inertia({ ssr: { enabled: false } }),
    adonisjs({
      entrypoints: ['resources/js/app.tsx'],
      reload: ['resources/views/**/*.edge'] 
    }),
    react(), 
  ],

  build: {
    sourcemap: false, // 🔥 không lộ source
    minify: 'esbuild',
  },

  /**
   * Define aliases for importing modules from
   * your frontend code
   */
  resolve: {
    alias: {
      // Định nghĩa alias để Vite hiểu dấu #
      '#resource': fileURLToPath(new URL('./resources', import.meta.url)),
    },
  },
})
