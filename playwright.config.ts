import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, devices } from '@playwright/test';

// Keep browsers inside the repo so `npm test` works reliably (CI + local), not only Cursor's temp cache
const repoRoot = path.dirname(fileURLToPath(import.meta.url));
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(repoRoot, 'node_modules', '.cache', 'ms-playwright');

const previewHost = '127.0.0.1';
const previewPort = 4173;
const previewOrigin = `http://${previewHost}:${previewPort}`;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: previewOrigin,
    trace: 'on-first-retry',
    locale: 'he-IL',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: process.env.CI
      ? `npx vite preview --host ${previewHost} --strictPort --port ${previewPort}`
      : `npm run build && npx vite preview --host ${previewHost} --strictPort --port ${previewPort}`,
    url: previewOrigin,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
