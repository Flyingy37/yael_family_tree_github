/**
 * parse-ged.ts
 *
 * Converts a GEDCOM (.ged) file into data/canonical.csv, the format
 * expected by scripts/build-graph.ts.
 *
 * Usage:
 *   tsx scripts/parse-ged.ts [path/to/file.ged]
 *
 * If no path is given, looks for the GED file next to the project root
 * (one directory up) matching the pattern *Holocaust*.ged, or accepts
 *   GED_FILE=<path> as an environment variable.
 *
 * Output:
 *   data/canonical.csv  (overwrites existing file)
 *
 * canonical.csv column layout (must match RawCanonical in build-graph.ts):
 *   ged_id, full_name, given_final, surname, surname_final,
 *   sex, birth_date, birth_place, fams, famc, titl, note, note_plain
 *
 *   birth_date  = "BIRTH_DATE|DEATH_DATE"   (pipe-separated)
 *   birth_place = "BIRTH_PLACE|DEATH_PLACE" (pipe-separated)
 *   fams        = "@F1@|@F2@"               (pipe-separated, spouse families)
 *   famc        = "@F1@"                    (single child-family, or pipe-sep)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Locate GED file ────────────────────────────────────────────────────────

function findGedFile(): string {
  if (process.argv[2]) return process.argv[2];
  if (process.env.GED_FILE) return process.env.GED_FILE;

  // Look one level up from project root
  const parent = join(ROOT, '..');
  try {
    const files = readdirSync(parent).filter(f => f.endsWith('.ged'));
    if (files.length === 1) return join(parent, files[0]);
    const holocaust = files.find(f => f.toLowerCase().includes('holocaust'));
    if (holocaust) return join(parent, holocaust);
    if (files.length > 0) return join(parent, files[0]);
  } catch {
    // ignore
  }

  // Also check Downloads folder
  const downloads = join(process.env.HOME || '~', 'Downloads');
  try {
    const files = readdirSync(downloads).filter(f => f.endsWith('.ged'));
    const holocaust = files.find(f => f.toLowerCase().includes('holocaust'));
    if (holocaust) return join(downloads, holocaust);
    if (files.length > 0) return join(downloads, files[0]);
  } catch {
    // ignore
  }

  throw new Error(
    'Could not find a .ged file. Pass it as an argument:\n' +
      '  tsx scripts/parse-ged.ts path/to/file.ged'
  );
}

// ── GEDCOM parser ──────────────────────────────────────────────────────────

interface GedLine {
  level: number;
  xref: string | null; // e.g. "@I1@" (only on level-0 records)
  tag: string;
  value: string;
}

function parseLines(content: string): GedLine[] {
  const result: GedLine[] = [];
  // Normalize line endings
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    // "level xref? tag value?"
    // level-0 record:  0 @I1@ INDI
    // level-0 other:   0 HEAD
    // level-1+:        1 NAME Given /Surname/
    const m = line.match(/^(\d+)\s+(@[^@]+@)\s+(\w+)(?:\s+(.*))?$/) ||
              line.match(/^(\d+)\s+(\w+)(?:\s+(.*))?$/);
    if (!m) continue;

    if (m[0].match(/^(\d+)\s+(@[^@]+@)\s+(\w+)/)) {
      // "level xref tag value?"
      const mm = line.match(/^(\d+)\s+(@[^@]+@)\s+(\w+)(?:\s+(.*))?$/);
      if (mm) {
        result.push({
          level: parseInt(mm[1]),
          xref: mm[2],
          tag: mm[3],
          value: (mm[4] || '').trim(),
        });
      }
    } else {
      // "level tag value?"
      const mm = line.match(/^(\d+)\s+(\w+)(?:\s+(.*))?$/);
      if (mm) {
        result.push({
          level: parseInt(mm[1]),
          xref: null,
          tag: mm[2],
          value: (mm[3] || '').trim(),
        });
      }
    }
  }
  return result;
}

interface GedIndi {
  id: string;
  fullName: string;
  givenName: string;
  surname: string;
  surnameFinal: string;
  sex: 'M' | 'F' | 'U';
  birthDate: string;
  birthPlace: string;
  deathDate: string;
  deathPlace: string;
  fams: string[];
  famc: string[];
  titl: string;
  note: string;
}

interface GedFam {
  id: string;
  husb: string;
  wife: string;
  children: string[];
}

function parseGed(content: string): { individuals: GedIndi[]; families: GedFam[] } {
  const lines = parseLines(content);

  const individuals: GedIndi[] = [];
  const families: GedFam[] = [];

  let curIndi: GedIndi | null = null;
  let curFam: GedFam | null = null;
  let ctx1 = ''; // level-1 context tag
  let noteLines: string[] = [];

  function flushNote() {
    if (curIndi) curIndi.note = noteLines.join('\n').trim();
    noteLines = [];
  }

  function saveCurrent() {
    if (curIndi) {
      flushNote();
      individuals.push(curIndi);
    }
    if (curFam) families.push(curFam);
    curIndi = null;
    curFam = null;
    ctx1 = '';
    noteLines = [];
  }

  for (const gl of lines) {
    // New top-level record
    if (gl.level === 0) {
      saveCurrent();
      if (gl.xref && gl.tag === 'INDI') {
        curIndi = {
          id: gl.xref,
          fullName: '', givenName: '', surname: '', surnameFinal: '',
          sex: 'U',
          birthDate: '', birthPlace: '', deathDate: '', deathPlace: '',
          fams: [], famc: [],
          titl: '', note: '',
        };
      } else if (gl.xref && gl.tag === 'FAM') {
        curFam = { id: gl.xref, husb: '', wife: '', children: [] };
      }
      continue;
    }

    // ── Individual fields ──
    if (curIndi) {
      if (gl.level === 1) {
        ctx1 = gl.tag;
        if (gl.tag === 'NOTE') {
          noteLines = [gl.value];
        }
      }

      switch (gl.level === 1 ? gl.tag : `${ctx1}/${gl.tag}`) {
        case 'NAME': {
          // "Given /Surname/ suffix"
          const nm = gl.value.match(/^(.*?)\s*\/([^/]*)\//);
          if (nm) {
            curIndi.givenName = nm[1].trim();
            curIndi.surname = nm[2].trim();
            curIndi.surnameFinal = nm[2].trim();
            const parts = [nm[1].trim(), nm[2].trim()].filter(Boolean);
            curIndi.fullName = parts.join(' ');
          } else {
            curIndi.givenName = gl.value.trim();
            curIndi.fullName = gl.value.trim();
          }
          break;
        }
        case 'SEX':
          curIndi.sex = gl.value === 'M' ? 'M' : gl.value === 'F' ? 'F' : 'U';
          break;
        case 'TITL':
          curIndi.titl = gl.value;
          break;
        case 'FAMS':
          if (gl.value) curIndi.fams.push(gl.value);
          break;
        case 'FAMC':
          if (gl.value) curIndi.famc.push(gl.value);
          break;
        case 'DEAT':
          // "1 DEAT Y" — just died, no date
          if (gl.value === 'Y') curIndi.deathDate = 'Y';
          break;
        case 'BIRT/DATE':
          curIndi.birthDate = gl.value;
          break;
        case 'BIRT/PLAC':
          curIndi.birthPlace = gl.value;
          break;
        case 'DEAT/DATE':
          curIndi.deathDate = gl.value;
          break;
        case 'DEAT/PLAC':
          curIndi.deathPlace = gl.value;
          break;
        case 'NOTE/CONT':
          noteLines.push(gl.value);
          break;
        case 'NOTE/CONC':
          if (noteLines.length > 0) noteLines[noteLines.length - 1] += gl.value;
          else noteLines.push(gl.value);
          break;
        case 'NAME/_MARNM': {
          // MyHeritage married-name extension: "2 _MARNM Livnat (Lanzman)"
          // Strip any parenthetical old-name qualifier and take the leading token(s) only.
          const marnm = gl.value.replace(/\s*\(.*$/, '').trim();
          if (marnm) curIndi.surnameFinal = marnm;
          break;
        }
        case 'BURI/DATE':
        case 'BURI/PLAC':
        case 'CHR/DATE':
        case 'CHR/PLAC':
          // Ignore burial and christening details
          break;
      }
      continue;
    }

    // ── Family fields ──
    if (curFam) {
      if (gl.level === 1) {
        switch (gl.tag) {
          case 'HUSB': curFam.husb = gl.value; break;
          case 'WIFE': curFam.wife = gl.value; break;
          case 'CHIL': if (gl.value) curFam.children.push(gl.value); break;
        }
      }
    }
  }

  saveCurrent();
  return { individuals, families };
}

// ── CSV helpers ────────────────────────────────────────────────────────────

function csvField(value: string): string {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function csvRow(fields: string[]): string {
  return fields.map(csvField).join(',');
}

// ── Missing-surname patch ──────────────────────────────────────────────────

/**
 * Loads the missing-surname CSV and returns a Set of GEDCOM IDs
 * that are known to be missing a surname (for reporting purposes).
 */
function loadMissingSurnameIds(): Set<string> {
  const csvPath = join(ROOT, 'data', 'missing_surname_connected_to_yael_with_other_links_2026-03-27.csv');
  if (!existsSync(csvPath)) return new Set();

  const lines = readFileSync(csvPath, 'utf-8').split('\n');
  const ids = new Set<string>();
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    const id = parts[0]?.trim();
    if (id && id.startsWith('@')) ids.add(id);
  }
  return ids;
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  const gedPath = findGedFile();
  if (!existsSync(gedPath)) {
    throw new Error(`GED file not found: ${gedPath}`);
  }

  console.log(`Reading: ${gedPath}`);
  const content = readFileSync(gedPath, 'utf-8');

  const { individuals, families } = parseGed(content);
  console.log(`Parsed ${individuals.length} individuals, ${families.length} families`);

  const missingSurnameIds = loadMissingSurnameIds();
  console.log(`Missing-surname list loaded: ${missingSurnameIds.size} IDs`);

  // Build family index for connectivity check
  const famMap = new Map<string, GedFam>(families.map(f => [f.id, f]));
  const indiMap = new Map<string, GedIndi>(individuals.map(i => [i.id, i]));

  // ── Connectivity: BFS from root person (@I1@ = Yael) ──────────────────
  const ROOT_ID = '@I1@';
  const connected = new Set<string>();
  if (indiMap.has(ROOT_ID)) {
    const queue = [ROOT_ID];
    connected.add(ROOT_ID);
    while (queue.length > 0) {
      const id = queue.shift()!;
      const indi = indiMap.get(id);
      if (!indi) continue;
      const neighbors: string[] = [];
      // Parents and siblings
      for (const famId of indi.famc) {
        const fam = famMap.get(famId);
        if (!fam) continue;
        neighbors.push(fam.husb, fam.wife, ...fam.children);
      }
      // Spouses and children
      for (const famId of indi.fams) {
        const fam = famMap.get(famId);
        if (!fam) continue;
        neighbors.push(fam.husb, fam.wife, ...fam.children);
      }
      for (const n of neighbors) {
        if (n && !connected.has(n)) {
          connected.add(n);
          queue.push(n);
        }
      }
    }
  }

  const unconnectedIndividuals = individuals.filter(i => !connected.has(i.id));
  const connectedIndividuals = individuals.filter(i => connected.has(i.id));
  console.log(`Connected to ${ROOT_ID}: ${connected.size} people`);
  console.log(`Not connected: ${unconnectedIndividuals.length} people (excluded from canonical.csv)`);

  // ── Write canonical.csv (connected only) ────────────────────────────────
  const headers = [
    'ged_id', 'full_name', 'given_final', 'surname', 'surname_final',
    'sex', 'birth_date', 'birth_place',
    'fams', 'famc', 'titl', 'note', 'note_plain',
  ];

  let missingSurnameFound = 0;

  const rows = connectedIndividuals.map(indi => {
    // birth_date field = "birthDate|deathDate" (pipe-separated)
    const birthDateField = [indi.birthDate, indi.deathDate].filter(Boolean).join('|');
    // birth_place field = "birthPlace|deathPlace"
    const birthPlaceField = [indi.birthPlace, indi.deathPlace].filter(Boolean).join('|');

    if (missingSurnameIds.has(indi.id) && !indi.surname) missingSurnameFound++;

    return csvRow([
      indi.id,
      indi.fullName,
      indi.givenName,
      indi.surname,
      indi.surnameFinal,
      indi.sex,
      birthDateField,
      birthPlaceField,
      indi.fams.join('|'),
      indi.famc.join('|'),
      indi.titl,
      indi.note,
      indi.note,        // note_plain = same as note (GED notes are plain text)
    ]);
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const outPath = join(ROOT, 'data', 'canonical.csv');
  writeFileSync(outPath, csv, 'utf-8');

  console.log(`\nWritten: ${outPath}`);
  console.log(`  Rows: ${connectedIndividuals.length} (connected only)`);
  console.log(`  Missing surnames (from tracking list, still empty): ${missingSurnameFound}`);

  // ── Write unconnected.csv (for Excel review) ────────────────────────────
  const unconnectedHeaders = ['ged_id', 'full_name', 'given_name', 'surname', 'sex', 'birth_date', 'death_date', 'birth_place', 'death_place'];
  const unconnectedRows = unconnectedIndividuals.map(indi => csvRow([
    indi.id,
    indi.fullName,
    indi.givenName,
    indi.surname,
    indi.sex,
    indi.birthDate,
    indi.deathDate,
    indi.birthPlace,
    indi.deathPlace,
  ]));
  const unconnectedCsv = [unconnectedHeaders.join(','), ...unconnectedRows].join('\n');
  const unconnectedPath = join(ROOT, 'data', 'unconnected_people.csv');
  writeFileSync(unconnectedPath, unconnectedCsv, 'utf-8');
  console.log(`\nWritten: ${unconnectedPath}`);
  console.log(`  Rows: ${unconnectedIndividuals.length} (not connected to ${ROOT_ID})`);

  console.log(`\nNext step: npm run dev  (requires curated.csv for full enrichment,`);
  console.log(`  or run with BUILD_LOCAL=true if curated.csv is available)`);
}

main();
