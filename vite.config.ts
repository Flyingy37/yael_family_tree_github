/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel sets VERCEL=1 automatically during build → serve from root.
// GitHub Pages serves from /yael_family_tree_github/ → keep that as default.
const base = process.env.VERCEL ? '/' : (process.env.VITE_BASE_PATH ?? '/yael_family_tree_github/');

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
