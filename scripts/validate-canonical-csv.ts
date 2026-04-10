/**
 * Validates header row of data/canonical.csv (or a path passed as argv[2]).
 * Exits 1 if a required column is missing (helps before running build-graph).
 * If the file is absent, exits 0 (Vercel / clones without private data).
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, isAbsolute, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { CANONICAL_CSV_COLUMNS } from './canonical-columns.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function normalizeHeader(h: string): string {
  return h.replace(/^\ufeff/, '').trim();
}

function main() {
  const argPath = process.argv[2];
  const csvPath = argPath
    ? isAbsolute(argPath)
      ? argPath
      : resolve(ROOT, argPath)
    : join(ROOT, 'data', 'canonical.csv');

  if (!existsSync(csvPath)) {
    console.log(
      `validate-canonical-csv: skip (file not found: ${csvPath}). Place canonical.csv or pass a path.`,
    );
    process.exit(0);
  }

  const raw = readFileSync(csvPath, 'utf-8');
  const rows = parse(raw, {
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as string[][];

  const headerRow = rows[0];
  if (!headerRow?.length) {
    console.error('validate-canonical-csv: empty or missing header row');
    process.exit(1);
  }

  const headers = new Set(headerRow.map(normalizeHeader));
  const missing: string[] = [];
  for (const col of CANONICAL_CSV_COLUMNS) {
    if (!headers.has(col)) missing.push(col);
  }

  if (missing.length > 0) {
    console.error(
      `validate-canonical-csv: missing column(s) in ${csvPath}:\n  ${missing.join('\n  ')}`,
    );
    console.error(
      `Expected exactly these headers (see data/data_dictionary.md): ${CANONICAL_CSV_COLUMNS.join(', ')}`,
    );
    process.exit(1);
  }

  console.log(`validate-canonical-csv: OK — all ${CANONICAL_CSV_COLUMNS.length} required columns present.`);
  process.exit(0);
}

main();
