/**
 * scan-gems.ts
 *
 * Scans the canonical family-tree CSV for potential matches against a
 * configurable list of famous / notable figures, using Fuse.js fuzzy search.
 *
 * Usage:
 *   npm run scan:gems
 *   npm run scan:gems -- --threshold 75   (override score threshold, default 80)
 *   npm run scan:gems -- --csv data/canonical.csv  (override input file)
 *
 * Output: console table + optional JSON report written to /tmp/gems-report.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import Fuse from 'fuse.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag: string, fallback: string): string {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

// Resolve the canonical CSV: prefer the standard path (data/canonical.csv),
// fall back to the alternative file present in many local clones.
function resolveCanonicalCsv(): string {
  const standard = join(ROOT, 'data/canonical.csv');
  const fallback = join(ROOT, 'data/canonical_final_clean.csv');
  if (existsSync(standard)) return 'data/canonical.csv';
  if (existsSync(fallback)) return 'data/canonical_final_clean.csv';
  return 'data/canonical.csv'; // will error with a clear message below
}

const CSV_PATH   = getArg('--csv',       resolveCanonicalCsv());
const THRESHOLD  = Number(getArg('--threshold', '80')); // 0-100 scale
const REPORT_OUT = getArg('--out',       '/tmp/gems-report.json');

// ── Famous / notable figures list ───────────────────────────────────────────
// Add entries here to expand the scan.
// "aliases" lets you supply alternate spellings or transliterations.
interface FamousFigure {
  name: string;
  aliases?: string[];
  title: string;
  tags: string[];
}

const FAMOUS_FIGURES: FamousFigure[] = [
  // ── Rabbinical / religious ──────────────────────────────────────────────
  {
    name: 'Jacob Castro',
    aliases: ['Yaakov Castro', 'Yakov Castro', 'Yaakov de Castro'],
    title: 'Maharikash — Chief Rabbi of Alexandria, Egypt (16th c.)',
    tags: ['Famous', 'Rabbi'],
  },
  {
    name: 'Miguel Castro',
    aliases: ['Yitzhak Castro', 'Isaac de Castro'],
    title: 'Sephardic ancestor (Spain/Egypt)',
    tags: ['Famous', 'Lineage'],
  },
  {
    name: 'Aryeh Leib Alperovich',
    aliases: ['Arie Leib Alperovich', 'Arye Leib Alperovich', 'Leib Alperovich'],
    title: 'Rabbinical Scribe',
    tags: ['Famous', 'Rabbi'],
  },
  // ── Family connections ──────────────────────────────────────────────────
  {
    name: 'Yehoshua Kastrel',
    aliases: ['Yehoshua Kastrell', 'Joshua Kastrel'],
    title: 'Relative of Chaim Nachman Bialik (Kastrel–Bialik connection)',
    tags: ['Famous'],
  },
  // ── Public figures ──────────────────────────────────────────────────────
  {
    name: 'Tamar Gozansky',
    aliases: ['Tamara Gozansky'],
    title: 'Israeli Member of Knesset (Hadash)',
    tags: ['Famous'],
  },
  {
    name: 'Hayim Nahman Bialik',
    aliases: ['Chaim Nachman Bialik', 'Haim Nahman Bialik', 'H.N. Bialik', 'Hayim Bialik'],
    title: 'National Poet of Israel',
    tags: ['Famous'],
  },
  {
    name: 'Terry Dubrow',
    aliases: ['Terry J. Dubrow', 'Terry J Dubrow'],
    title: 'Plastic surgeon, TV personality (Botched)',
    tags: ['Famous'],
  },
  {
    name: 'Kevin Dubrow',
    aliases: ['Kevin Mark Dubrow', 'Kevin Mark DuBrow'],
    title: 'Lead singer of Quiet Riot',
    tags: ['Famous'],
  },
  {
    name: 'Hyman Kastrel',
    aliases: ['Hyman Isidor Kastrel', 'Hyman Costrell', 'Jack Robbins'],
    title: 'Co-founder of Yiddish daily Frayhayt; editor of Funken',
    tags: ['Famous'],
  },
];

// ── CSV row type ─────────────────────────────────────────────────────────────
interface CsvRow {
  person_id: string;
  full_name: string;
  given_final: string;
  surname: string;
  surname_final: string;
  sex: string;
  birth_date: string;
  birth_place: string;
  titl: string;
  note_plain: string;
}

// ── Load CSV ─────────────────────────────────────────────────────────────────
const csvFile = join(ROOT, CSV_PATH);
let rows: CsvRow[];
try {
  const raw = readFileSync(csvFile, 'utf-8').replace(/^\uFEFF/, '');
  rows = parse(raw, { columns: true, skip_empty_lines: true, relax_quotes: true }) as CsvRow[];
} catch {
  console.error(`❌  Cannot read CSV at ${csvFile}`);
  process.exit(1);
}

// Build a flat list of {id, name} entries so Fuse can search across them
interface SearchEntry {
  id: string;
  name: string;
  birthDate: string;
  birthPlace: string;
}

const entries: SearchEntry[] = rows.map(r => ({
  id: r.person_id,
  name: (r.full_name || '').trim(),
  birthDate: (r.birth_date || '').trim(),
  birthPlace: (r.birth_place || '').trim(),
})).filter(e => e.name && e.name.toLowerCase() !== 'unknown');

// ── Fuse.js setup ─────────────────────────────────────────────────────────
// Fuse scores: 0 = perfect match, 1 = no match.
// We convert to a 0-100 scale and filter by THRESHOLD.
const fuse = new Fuse(entries, {
  keys: ['name'],
  includeScore: true,
  threshold: 0.5,   // internal Fuse threshold (lenient); we apply our own below
  ignoreLocation: true,
  minMatchCharLength: 3,
});

// ── Run scan ──────────────────────────────────────────────────────────────
interface Match {
  figureIdx: number;
  figureName: string;
  figureTitle: string;
  figureTags: string[];
  memberId: string;
  memberName: string;
  memberBirthDate: string;
  memberBirthPlace: string;
  score: number;
  matchedAlias: string;
}

const matches: Match[] = [];

for (let fi = 0; fi < FAMOUS_FIGURES.length; fi++) {
  const figure = FAMOUS_FIGURES[fi];
  const queries = [figure.name, ...(figure.aliases ?? [])];

  const seen = new Set<string>();

  for (const q of queries) {
    const results = fuse.search(q);
    for (const res of results) {
      const score100 = Math.round((1 - (res.score ?? 1)) * 100);
      if (score100 < THRESHOLD) continue;
      const { id } = res.item;
      if (seen.has(id)) continue;
      seen.add(id);
      matches.push({
        figureIdx: fi,
        figureName: figure.name,
        figureTitle: figure.title,
        figureTags: figure.tags,
        memberId: id,
        memberName: res.item.name,
        memberBirthDate: res.item.birthDate,
        memberBirthPlace: res.item.birthPlace,
        score: score100,
        matchedAlias: q,
      });
    }
  }
}

// Sort: figure index, then score descending
matches.sort((a, b) => a.figureIdx - b.figureIdx || b.score - a.score);

// ── Output ─────────────────────────────────────────────────────────────────
if (matches.length === 0) {
  console.log(`\n🔍  No matches above threshold ${THRESHOLD}. Consider lowering --threshold.\n`);
} else {
  console.log(`\n💎  Found ${matches.length} potential match(es) (threshold ≥ ${THRESHOLD}):\n`);
  let lastFigure = '';
  for (const m of matches) {
    if (m.figureName !== lastFigure) {
      console.log(`\n▶  ${m.figureName} — ${m.figureTitle}`);
      console.log(`   Tags to apply: ${m.figureTags.join(', ')}`);
      lastFigure = m.figureName;
    }
    const dateStr = m.memberBirthDate ? ` | born ${m.memberBirthDate}` : '';
    const placeStr = m.memberBirthPlace ? ` | ${m.memberBirthPlace}` : '';
    console.log(
      `   💎  [${m.score}%] ${m.memberId.padEnd(10)}  "${m.memberName}"${dateStr}${placeStr}` +
      (m.matchedAlias !== m.figureName ? `  (via alias "${m.matchedAlias}")` : ''),
    );
  }
  console.log('');
}

// ── Write JSON report ─────────────────────────────────────────────────────
try {
  writeFileSync(REPORT_OUT, JSON.stringify(matches, null, 2), 'utf-8');
  console.log(`📄  Full report saved to ${REPORT_OUT}\n`);
} catch {
  // non-fatal — /tmp may not be writable in all environments
}

// ── Suggested MANUAL_TAG_OVERRIDES snippet ────────────────────────────────
if (matches.length > 0) {
  const highConf = matches.filter(m => m.score >= 90);
  if (highConf.length > 0) {
    console.log('📋  Suggested additions for MANUAL_TAG_OVERRIDES (score ≥ 90) — verify before committing:\n');
    for (const m of highConf) {
      const tagsStr = JSON.stringify(m.figureTags);
      console.log(`  '${m.memberId}': ${tagsStr}, // ${m.memberName} — ${m.figureTitle}`);
    }
    console.log('');
  }
}
