/**
 * Prebuild gate: run graph build only when canonical CSV exists locally (dev / CI with secrets).
 * On Vercel without private CSV, keep the committed `public/family-graph.json`.
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const canonicalPath = join(ROOT, 'data/canonical.csv');
const graphPath = join(ROOT, 'public/family-graph.json');
const tsxBin = join(ROOT, 'node_modules/.bin/tsx');

if (existsSync(canonicalPath)) {
  const r = spawnSync(tsxBin, ['scripts/build-graph.ts'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
  });
  process.exit(r.status ?? 1);
}

if (existsSync(graphPath)) {
  console.log(
    'prebuild-graph: data/canonical.csv missing; keeping committed public/family-graph.json'
  );
  process.exit(0);
}

console.error(
  'prebuild-graph: need data/canonical.csv or an existing public/family-graph.json'
);
process.exit(1);
