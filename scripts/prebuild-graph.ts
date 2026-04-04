/**
 * Runs before `vite build`. Private genealogy CSVs are NOT tracked in the
 * public repo — they live locally or in a private data store.
 *
 * - If `data/canonical.csv` exists → run `build-graph.ts` (local build with private data).
 * - Else if `data/canonical_final_clean.csv` exists → run `build-graph.ts` (local fallback).
 * - Else if `public/family-graph.json` exists → skip (pre-built artifact, e.g. copied before deploy).
 * - Else → write an empty placeholder so the app can start without data.
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const canonicalPath = join(ROOT, 'data/canonical.csv');
const canonicalFinalPath = join(ROOT, 'data/canonical_final_clean.csv');
const graphPath = join(ROOT, 'public/family-graph.json');

function runBuildGraph() {
  execSync('npx tsx scripts/build-graph.ts', { cwd: ROOT, stdio: 'inherit', env: process.env });
}

if (existsSync(canonicalPath)) {
  console.log('prebuild-graph: found data/canonical.csv — running build-graph');
  runBuildGraph();
} else if (existsSync(canonicalFinalPath)) {
  console.log('prebuild-graph: found data/canonical_final_clean.csv — running build-graph');
  runBuildGraph();
} else if (existsSync(graphPath)) {
  console.log(
    'prebuild-graph: no canonical CSV — keeping existing public/family-graph.json',
  );
} else {
  console.log(
    'prebuild-graph: no canonical CSV and no family-graph.json — writing empty placeholder',
  );
  mkdirSync(dirname(graphPath), { recursive: true });
  writeFileSync(graphPath, JSON.stringify({ persons: [], families: [], rootPersonId: '' }));
}
