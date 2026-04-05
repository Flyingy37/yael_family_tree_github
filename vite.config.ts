/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On Vercel the site is served at root (/); on GitHub Pages it lives under /yael_family_tree_github/.
// Set VITE_BASE_PATH=/ in Vercel environment variables to override.
const base = process.env.VITE_BASE_PATH ?? '/yael_family_tree_github/';

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
