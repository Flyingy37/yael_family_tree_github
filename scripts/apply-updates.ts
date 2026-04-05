/**
 * Merges `data/family-updates.json` into `public/family-graph.json`.
 *
 * Run automatically by prebuild-graph.ts whenever family-updates.json exists.
 * Can also be run manually: npx tsx scripts/apply-updates.ts
 *
 * family-updates.json format:
 * {
 *   "persons": [{ ...person fields }],          // New persons to add
 *   "overrides": { "@I123@": { ...fields } }     // Fields to update on existing persons
 * }
 *
 * Person fields (all optional except `id`):
 *   id, fullName, givenName, surname, surnameFinal, sex, birthDate, deathDate,
 *   birthPlace, hebrewName, birthName, title, generation, relationToYael,
 *   fatherName, motherName, spouseName, childrenNames, familiesAsSpouse,
 *   familyAsChild, tags, story, holocaustVictim, warCasualty, migrationInfo,
 *   jewishLineage, surnameOrigin, note_plain, dnaInfo
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GRAPH_PATH = join(ROOT, 'public/family-graph.json');
const UPDATES_PATH = join(ROOT, 'data/family-updates.json');

interface Person {
  id: string;
  fullName: string | null;
  givenName: string | null;
  surname: string | null;
  surnameFinal: string | null;
  sex: string | null;
  birthDate: string | null;
  deathDate: string | null;
  note: string | null;
  note_plain: string | null;
  photoUrl: string | null;
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
  surnameOrigin: string | null;
  jewishLineage: string | null;
  migrationInfo: string | null;
  holocaustVictim: boolean;
  warCasualty: boolean;
  connectionPathCount: number;
  doubleBloodTie: boolean;
  tags: string[];
  story: string | null;
  [key: string]: unknown;
}

interface FamilyGraph {
  persons: Person[];
  families: unknown[];
  rootPersonId: string;
}

interface UpdatesFile {
  version: string;
  comment?: string;
  persons?: Partial<Person>[];
  overrides?: Record<string, Partial<Person>>;
}

function defaultPerson(partial: Partial<Person>): Person {
  return {
    id: partial.id ?? '',
    fullName: partial.fullName ?? null,
    givenName: partial.givenName ?? null,
    surname: partial.surname ?? null,
    surnameFinal: partial.surnameFinal ?? null,
    sex: partial.sex ?? null,
    birthDate: partial.birthDate ?? null,
    deathDate: partial.deathDate ?? null,
    note: partial.note ?? null,
    note_plain: partial.note_plain ?? null,
    photoUrl: partial.photoUrl ?? null,
    birthPlace: partial.birthPlace ?? null,
    generation: partial.generation ?? null,
    relationToYael: partial.relationToYael ?? null,
    hops: partial.hops ?? null,
    dnaInfo: partial.dnaInfo ?? null,
    coordinates: partial.coordinates ?? null,
    familiesAsSpouse: partial.familiesAsSpouse ?? [],
    familyAsChild: partial.familyAsChild ?? null,
    title: partial.title ?? null,
    hebrewName: partial.hebrewName ?? null,
    birthName: partial.birthName ?? null,
    fatherName: partial.fatherName ?? null,
    motherName: partial.motherName ?? null,
    spouseName: partial.spouseName ?? null,
    childrenNames: partial.childrenNames ?? null,
    surnameOrigin: partial.surnameOrigin ?? null,
    jewishLineage: partial.jewishLineage ?? null,
    migrationInfo: partial.migrationInfo ?? null,
    holocaustVictim: partial.holocaustVictim ?? false,
    warCasualty: partial.warCasualty ?? false,
    connectionPathCount: partial.connectionPathCount ?? 0,
    doubleBloodTie: partial.doubleBloodTie ?? false,
    tags: partial.tags ?? [],
    story: partial.story ?? null,
  };
}

if (!existsSync(UPDATES_PATH)) {
  console.log('apply-updates: data/family-updates.json not found — nothing to do');
  process.exit(0);
}

if (!existsSync(GRAPH_PATH)) {
  console.error('apply-updates: public/family-graph.json not found — cannot apply updates');
  process.exit(1);
}

const updates: UpdatesFile = JSON.parse(readFileSync(UPDATES_PATH, 'utf-8'));
const hasNewPersons = Array.isArray(updates.persons) && updates.persons.length > 0;
const hasOverrides =
  updates.overrides && typeof updates.overrides === 'object' && Object.keys(updates.overrides).length > 0;

if (!hasNewPersons && !hasOverrides) {
  console.log('apply-updates: family-updates.json is empty — nothing to apply');
  process.exit(0);
}

const graph: FamilyGraph = JSON.parse(readFileSync(GRAPH_PATH, 'utf-8'));
const personIndex = new Map<string, number>(graph.persons.map((p, i) => [p.id, i]));

let added = 0;
let updated = 0;

// Apply new persons
if (hasNewPersons) {
  for (const partial of updates.persons!) {
    if (!partial.id) {
      console.warn('apply-updates: skipping person with no id:', partial);
      continue;
    }
    if (personIndex.has(partial.id)) {
      console.warn(`apply-updates: person ${partial.id} already exists — use overrides to update`);
      continue;
    }
    graph.persons.push(defaultPerson(partial));
    personIndex.set(partial.id, graph.persons.length - 1);
    added++;
    console.log(`apply-updates: added person ${partial.id} (${partial.fullName ?? 'unnamed'})`);
  }
}

// Apply overrides to existing persons
if (hasOverrides) {
  for (const [id, fields] of Object.entries(updates.overrides!)) {
    const idx = personIndex.get(id);
    if (idx === undefined) {
      console.warn(`apply-updates: override target ${id} not found in graph — skipping`);
      continue;
    }
    Object.assign(graph.persons[idx], fields);
    updated++;
    console.log(`apply-updates: updated person ${id} (${graph.persons[idx].fullName ?? 'unnamed'})`);
  }
}

writeFileSync(GRAPH_PATH, JSON.stringify(graph));
console.log(
  `apply-updates: done — ${added} person(s) added, ${updated} person(s) updated → public/family-graph.json`,
);
