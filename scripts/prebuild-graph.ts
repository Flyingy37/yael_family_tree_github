/**
 * Runs before `vite build`. On Vercel there is no private `data/canonical.csv`, so we must not
 * regenerate the graph from the tiny sample CSV (that would ship a near-empty tree).
 *
 * - If `data/canonical.csv` exists → run `build-graph.ts` (local / CI with secrets).
 * - Else if `public/family-graph.json` exists → skip (use committed deployment artifact).
 * - Else → run `build-graph.ts` (sample or empty graph for greenfield clones).
 */
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const canonicalPath = join(ROOT, 'data/canonical.csv');
const graphPath = join(ROOT, 'public/family-graph.json');

function runBuildGraph() {
  execSync('npx tsx scripts/build-graph.ts', { cwd: ROOT, stdio: 'inherit', env: process.env });
}

if (existsSync(canonicalPath)) {
  console.log('prebuild-graph: found data/canonical.csv — running build-graph');
  runBuildGraph();
} else if (existsSync(graphPath)) {
  console.log(
    'prebuild-graph: no data/canonical.csv — keeping committed public/family-graph.json (Vercel / CI deploy)',
  );
} else {
  console.log(
    'prebuild-graph: no canonical.csv and no family-graph.json — running build-graph (sample fallback)',
  );
  runBuildGraph();
}
