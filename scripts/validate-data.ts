/**
 * validate-data.ts — validate canonical.csv and curated.csv against expected schemas.
 *
 * Usage: npx tsx scripts/validate-data.ts
 * Exits with code 1 if critical errors are found, 0 otherwise.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const CANONICAL_PATH = join(ROOT, 'data', 'canonical.csv');
const CURATED_PATH = join(ROOT, 'data', 'curated.csv');

const CANONICAL_REQUIRED_COLS = [
  'ged_id', 'full_name', 'given_final', 'surname', 'surname_final',
  'sex', 'birth_date', 'birth_place', 'fams', 'famc', 'titl', 'note', 'note_plain',
];

const CURATED_REQUIRED_COLS = [
  'Hops', 'Relationship to Yael', 'Full Name', 'Birth Name', 'Birth Year',
  'Birth City', 'Generation', 'Father Name', 'Mother Name', 'Spouse Name',
  'Children Names', 'ID',
];

let errorCount = 0;
let warnCount = 0;

function error(msg: string) {
  console.error(`  ✗ ERROR: ${msg}`);
  errorCount++;
}

function warn(msg: string) {
  console.warn(`  ⚠ WARN:  ${msg}`);
  warnCount++;
}

function info(msg: string) {
  console.log(`  ✓ ${msg}`);
}

function validateColumns(headers: string[], required: string[], filePath: string) {
  for (const col of required) {
    if (!headers.includes(col)) {
      error(`${filePath}: missing required column "${col}"`);
    }
  }
}

function validateCanonical(rows: Record<string, string>[], headers: string[]) {
  validateColumns(headers, CANONICAL_REQUIRED_COLS, 'canonical.csv');

  const seenIds = new Set<string>();
  let rowIndex = 2; // 1-indexed, row 1 is header

  for (const row of rows) {
    const id = row['ged_id']?.trim();

    if (!id) {
      error(`canonical.csv row ${rowIndex}: missing ged_id`);
    } else if (seenIds.has(id)) {
      error(`canonical.csv row ${rowIndex}: duplicate ged_id "${id}"`);
    } else {
      seenIds.add(id);
    }

    const sex = row['sex']?.trim();
    if (sex && !['M', 'F', 'U'].includes(sex)) {
      warn(`canonical.csv row ${rowIndex}: unexpected sex value "${sex}"`);
    }

    rowIndex++;
  }

  info(`canonical.csv: ${rows.length} rows, ${seenIds.size} unique IDs`);
}

function validateCurated(rows: Record<string, string>[], headers: string[]) {
  validateColumns(headers, CURATED_REQUIRED_COLS, 'curated.csv');

  let rowIndex = 2;
  let missingIds = 0;

  for (const row of rows) {
    const id = row['ID']?.trim();
    if (!id) {
      missingIds++;
    }

    const hops = row['Hops']?.trim();
    if (hops && isNaN(Number(hops))) {
      warn(`curated.csv row ${rowIndex}: non-numeric Hops value "${hops}"`);
    }

    const birthYear = row['Birth Year']?.trim();
    if (birthYear && isNaN(Number(birthYear))) {
      warn(`curated.csv row ${rowIndex}: non-numeric Birth Year "${birthYear}"`);
    }

    rowIndex++;
  }

  if (missingIds > 0) {
    warn(`curated.csv: ${missingIds} rows missing ID`);
  }

  info(`curated.csv: ${rows.length} rows`);
}

function loadCsv(filePath: string): { rows: Record<string, string>[]; headers: string[] } | null {
  if (!existsSync(filePath)) {
    warn(`File not found, skipping: ${filePath}`);
    return null;
  }
  const raw = readFileSync(filePath, 'utf-8');
  const rows: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { rows, headers };
}

console.log('\n=== Yael Family Tree — Data Validation ===\n');

console.log('Checking canonical.csv…');
const canonical = loadCsv(CANONICAL_PATH);
if (canonical) validateCanonical(canonical.rows, canonical.headers);

console.log('\nChecking curated.csv…');
const curated = loadCsv(CURATED_PATH);
if (curated) validateCurated(curated.rows, curated.headers);

console.log(`\n${'─'.repeat(44)}`);
console.log(`Errors: ${errorCount}   Warnings: ${warnCount}`);

if (errorCount > 0) {
  console.error('\n❌ Validation failed.\n');
  process.exit(1);
} else {
  console.log('\n✅ Validation passed.\n');
  process.exit(0);
}
