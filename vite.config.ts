/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const pkg = id.split('node_modules/').pop();
            if (!pkg) return;
            const parts = pkg.split('/');
            return parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
          }
        },
      },
    },
  },
})
