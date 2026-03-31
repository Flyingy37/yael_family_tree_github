/**
 * Install Playwright Chromium into node_modules/.cache/ms-playwright
 * so it matches PLAYWRIGHT_BROWSERS_PATH in playwright.config.ts.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(root, 'node_modules', '.cache', 'ms-playwright');

const r = spawnSync('npx', ['playwright', 'install', 'chromium'], {
  stdio: 'inherit',
  env: process.env,
  cwd: root,
  shell: process.platform === 'win32',
});
process.exit(r.status ?? 1);
