/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel sets VERCEL=1 automatically during build → serve from root.
// GitHub Pages serves from /yael_family_tree_github/ → keep that as default.
const base = process.env.VERCEL ? '/' : (process.env.VITE_BASE_PATH ?? '/yael_family_tree_github/');

export default defineConfig({
  base,
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('@xyflow/react') || id.includes('@dagrejs/dagre')) {
            return 'tree-vendor';
          }

          if (id.includes('leaflet') || id.includes('react-leaflet')) {
            return 'map-vendor';
          }

          if (id.includes('d3')) {
            return 'charts-vendor';
          }

          if (id.includes('framer-motion') || id.includes('lucide-react')) {
            return 'ui-vendor';
          }

          if (id.includes('react-router-dom')) {
            return 'router-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
