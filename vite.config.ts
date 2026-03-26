import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub project pages need a repo-scoped base (set VITE_BASE_PATH in CI, e.g. /repo-name/).
const rawBase = process.env.VITE_BASE_PATH ?? '/'
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

export default defineConfig({
  plugins: [react()],
  base,
})
