/**
 * GitHub Pages serves 404.html for unknown paths. Copy index.html so client routes
 * (e.g. /explore/tree) load the SPA when opened directly or refreshed.
 */
import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = join(root, 'dist', 'index.html');
const notFound = join(root, 'dist', '404.html');

if (!existsSync(indexHtml)) {
  console.error('copy-spa-fallback: dist/index.html missing — run vite build first');
  process.exit(1);
}
copyFileSync(indexHtml, notFound);
console.log('Wrote dist/404.html (SPA fallback for GitHub Pages)');
