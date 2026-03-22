import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

interface RawCanonical {
  ged_id: string;
  full_name: string;
  given_final: string;
  surname: string;
  surname_final: string;
  sex: string;
  birth_date: string;
  birth_place: string;
  fams: string;
  famc: string;
  titl: string;
  note: string;
  note_plain: string;
}

interface RawCurated {
  'קפיצות': string;
  'קשר ליעל': string;
  'שם מלא': string;
  'שם לידה': string;
  'שנת לידה': string;
  'עיר לידה': string;
  'דור': string;
  'שם אב': string;
  'שם אם': string;
  'שם בן/ת זוג': string;
  'שם ילדים': string;
  'ID': string;
}

interface Person {
  id: string;
  fullName: string;
  givenName: string;
  surname: string;
  surnameFinal: string;
  sex: 'M' | 'F' | 'U';
  birthDate: string | null;
  deathDate: string | null;
  birthPlace: string | null;
  generation: number | null;
  relationToYael: string | null;
  hops: number | null;
  dnaInfo: string | null;
  coordinates: [number, number] | null;
  familiesAsSpouse: string[];
  familyAsChild: string | null;
  title: string | null;
  hebrewName: string | null;
  birthName: string | null;
  fatherName: string | null;
  motherName: string | null;
  spouseName: string | null;
  childrenNames: string | null;
}

interface Family {
  id: string;
  spouses: string[];
  children: string[];
}

// Parse GEDCOM-style dates like "13 FEB 1973"
function parseGedcomDate(raw: string): string | null {
  if (!raw || raw.trim() === '') return null;
  return raw.trim();
}

// Extract fields from note_plain
function extractFromNotes(notePlain: string) {
  const gen = notePlain.match(/Generation:\s*(-?\d+)/);
  const rel = notePlain.match(/Relationship to Yael:\s*(.+?)(?:\s*Generation|$)/);
  const coords = notePlain.match(/Epithet:\s*\[([0-9.-]+),\s*([0-9.-]+)\]/);

  // Collect DNA info
  const dnaPatterns = [
    /mtDNA Haplogroup:\s*[^\s].*?(?=\s*(?:Autosomal|Y-DNA|DNA Cluster|Epithet|$))/,
    /Y-DNA Haplogroup:\s*[^\s].*?(?=\s*(?:Autosomal|mtDNA|DNA Cluster|Epithet|$))/,
    /Autosomal DNA:\s*[^\s].*?(?=\s*(?:mtDNA|Y-DNA|DNA Cluster|Epithet|$))/,
    /DNA Cluster:\s*[^\s].*?(?=\s*(?:mtDNA|Y-DNA|Autosomal|Epithet|$))/,
  ];
  const dnaInfoParts: string[] = [];
  for (const pat of dnaPatterns) {
    const m = notePlain.match(pat);
    if (m) dnaInfoParts.push(m[0].trim());
  }

  return {
    generation: gen ? parseInt(gen[1], 10) : null,
    relationToYael: rel ? rel[1].trim() : null,
    coordinates: coords ? [parseFloat(coords[1]), parseFloat(coords[2])] as [number, number] : null,
    dnaInfo: dnaInfoParts.length > 0 ? dnaInfoParts.join(' | ') : null,
  };
}

// Split pipe-separated date/place fields (birth | death | burial)
function splitPipeField(value: string): { birth: string | null; death: string | null } {
  if (!value) return { birth: null, death: null };
  const parts = value.split(' | ').map(s => s.trim());
  return {
    birth: parts[0] || null,
    death: parts[1] || null,
  };
}

function buildGraph() {
  console.log('Building family graph...');

  // Read canonical CSV
  const canonicalRaw = readFileSync(join(ROOT, 'data/canonical.csv'), 'utf-8');
  const canonicalRows: RawCanonical[] = parse(canonicalRaw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  // Read curated CSV (skip title row)
  const curatedRaw = readFileSync(join(ROOT, 'data/curated.csv'), 'utf-8');
  const curatedAllRows = parse(curatedRaw, {
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as string[][];

  // The first row is a title, second row is headers, rest is data
  const curatedHeaders = curatedAllRows[1];
  const curatedData: RawCurated[] = curatedAllRows.slice(2).map(row => {
    const obj: Record<string, string> = {};
    curatedHeaders.forEach((h: string, i: number) => {
      obj[h] = row[i] || '';
    });
    return obj as unknown as RawCurated;
  });

  // Build curated lookup by name (lowercase, trimmed)
  const curatedByName = new Map<string, RawCurated>();
  for (const row of curatedData) {
    const name = row['שם מלא'].toLowerCase().trim();
    if (name) curatedByName.set(name, row);
  }

  // Build persons
  const persons: Person[] = [];
  const familyMap = new Map<string, Family>();

  for (const row of canonicalRows) {
    const dates = splitPipeField(row.birth_date);
    const places = splitPipeField(row.birth_place);
    const notes = extractFromNotes(row.note_plain || '');

    const sex = row.sex === 'M' ? 'M' : row.sex === 'F' ? 'F' : 'U';
    const famsArr = row.fams ? row.fams.split('|').map(s => s.trim()).filter(Boolean) : [];
    const famcVal = row.famc ? row.famc.split('|')[0].trim() || null : null;

    // Try to match with curated data
    const nameLower = row.full_name.toLowerCase().trim();
    const curated = curatedByName.get(nameLower);

    const person: Person = {
      id: row.ged_id,
      fullName: row.full_name,
      givenName: row.given_final,
      surname: row.surname,
      surnameFinal: row.surname_final,
      sex,
      birthDate: parseGedcomDate(dates.birth || ''),
      deathDate: parseGedcomDate(dates.death || ''),
      birthPlace: places.birth,
      generation: notes.generation,
      relationToYael: curated ? curated['קשר ליעל'] : notes.relationToYael,
      hops: curated ? parseInt(curated['קפיצות'], 10) || null : null,
      dnaInfo: notes.dnaInfo,
      coordinates: notes.coordinates,
      familiesAsSpouse: famsArr,
      familyAsChild: famcVal,
      title: row.titl || null,
      hebrewName: curated ? curated['שם מלא'] : null,
      birthName: curated ? curated['שם לידה'] || null : null,
      fatherName: curated ? curated['שם אב'] || null : null,
      motherName: curated ? curated['שם אם'] || null : null,
      spouseName: curated ? curated['שם בן/ת זוג'] || null : null,
      childrenNames: curated ? curated['שם ילדים'] || null : null,
    };

    persons.push(person);

    // Build family entries from fams
    for (const famId of famsArr) {
      if (!familyMap.has(famId)) {
        familyMap.set(famId, { id: famId, spouses: [], children: [] });
      }
      const fam = familyMap.get(famId)!;
      if (!fam.spouses.includes(row.ged_id)) {
        fam.spouses.push(row.ged_id);
      }
    }

    // Build family entries from famc
    if (famcVal) {
      if (!familyMap.has(famcVal)) {
        familyMap.set(famcVal, { id: famcVal, spouses: [], children: [] });
      }
      const fam = familyMap.get(famcVal)!;
      if (!fam.children.includes(row.ged_id)) {
        fam.children.push(row.ged_id);
      }
    }
  }

  const families = Array.from(familyMap.values());

  const graph = {
    persons,
    families,
    rootPersonId: '@I1@',
  };

  // Write output
  mkdirSync(join(ROOT, 'public'), { recursive: true });
  const outputPath = join(ROOT, 'public/family-graph.json');
  writeFileSync(outputPath, JSON.stringify(graph));

  console.log(`Built graph: ${persons.length} persons, ${families.length} families`);
  console.log(`Output: ${outputPath}`);
}

buildGraph();
