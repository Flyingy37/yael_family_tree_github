/**
 * generate-schema.ts — generate a JSON Schema for family-graph.json.
 *
 * Usage: npx tsx scripts/generate-schema.ts
 * Writes: public/family-graph.schema.json
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public');
const OUT_PATH = join(OUT_DIR, 'family-graph.schema.json');

const personSchema = {
  type: 'object',
  required: ['id', 'fullName', 'sex', 'tags'],
  additionalProperties: false,
  properties: {
    id:                  { type: 'string', description: 'GEDCOM xref ID, e.g. @I1@' },
    fullName:            { type: 'string' },
    givenName:           { type: 'string' },
    surname:             { type: 'string' },
    surnameFinal:        { type: 'string' },
    sex:                 { type: 'string', enum: ['M', 'F', 'U'] },
    birthDate:           { type: ['string', 'null'] },
    deathDate:           { type: ['string', 'null'] },
    birthPlace:          { type: ['string', 'null'] },
    birthPlaceEn:        { type: ['string', 'null'] },
    generation:          { type: ['number', 'null'] },
    relationToYael:      { type: ['string', 'null'] },
    relationToYaelEn:    { type: ['string', 'null'] },
    hops:                { type: ['number', 'null'] },
    dnaInfo:             { type: ['string', 'null'] },
    coordinates: {
      oneOf: [
        {
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
          maxItems: 2,
          description: '[latitude, longitude]',
        },
        { type: 'null' },
      ],
    },
    familiesAsSpouse:    { type: 'array', items: { type: 'string' } },
    familyAsChild:       { type: ['string', 'null'] },
    title:               { type: ['string', 'null'] },
    titleEn:             { type: ['string', 'null'] },
    note:                { type: ['string', 'null'] },
    note_plain:          { type: ['string', 'null'] },
    photoUrl:            { type: ['string', 'null'] },
    hebrewName:          { type: ['string', 'null'] },
    birthName:           { type: ['string', 'null'] },
    fatherName:          { type: ['string', 'null'] },
    motherName:          { type: ['string', 'null'] },
    spouseName:          { type: ['string', 'null'] },
    childrenNames:       { type: ['string', 'null'] },
    surnameOrigin:       { type: ['string', 'null'] },
    jewishLineage:       { type: ['string', 'null'] },
    migrationInfo:       { type: ['string', 'null'] },
    migrationInfoEn:     { type: ['string', 'null'] },
    holocaustVictim:     { type: 'boolean' },
    warCasualty:         { type: 'boolean' },
    connectionPathCount: { type: ['number', 'null'] },
    doubleBloodTie:      { type: 'boolean' },
    searchNormalized:    { type: 'string' },
    tags:                { type: 'array', items: { type: 'string' } },
  },
};

const familySchema = {
  type: 'object',
  required: ['id', 'spouses', 'children'],
  additionalProperties: false,
  properties: {
    id:       { type: 'string', description: 'GEDCOM FAM xref ID, e.g. @F1@' },
    spouses:  { type: 'array', items: { type: 'string' } },
    children: { type: 'array', items: { type: 'string' } },
  },
};

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://yael-family-tree/family-graph.schema.json',
  title: 'FamilyGraph',
  description: 'Pre-built genealogy graph consumed by the Yael Family Tree app.',
  type: 'object',
  required: ['rootPersonId', 'persons', 'families'],
  properties: {
    rootPersonId: {
      type: 'string',
      description: 'ID of the root person (typically Yael)',
    },
    persons: {
      type: 'array',
      items: personSchema,
    },
    families: {
      type: 'array',
      items: familySchema,
    },
  },
};

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

writeFileSync(OUT_PATH, JSON.stringify(schema, null, 2) + '\n', 'utf-8');
console.log(`✅ Schema written to ${OUT_PATH}`);
