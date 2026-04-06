/**
 * parse-report.mjs
 * Parses Livnat_Report_Final_Reviewed.md into livnat-report.json
 *
 * Usage: node scripts/parse-report.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_PATH = join(__dirname, '../../Downloads/Livnat_Report_Final_Reviewed.md');
const OUTPUT_PATH = join(__dirname, '../public/livnat-report.json');

// Known surname families (anything else is "Unknown")
const UNKNOWN_LABEL = 'Unknown';

/**
 * Parse a date/place info string like:
 *   (b: 1762 in Kurenets, Polish-Lithuanian Commonwealth d: 1833 in ...)
 * Returns { birthDate, deathDate, birthPlace, deathPlace }
 */
function parseInfo(infoStr) {
  let birthDate = null;
  let deathDate = null;
  let birthPlace = null;
  let deathPlace = null;

  if (!infoStr) return { birthDate, deathDate, birthPlace, deathPlace };

  // Remove surrounding parens
  const inner = infoStr.replace(/^\(|\)$/g, '').trim();

  // Strategy: split on " d: " to separate birth and death sections
  // Birth section comes after "b: " up until " d: "
  // We need to be careful because place names can contain commas

  const bIdx = inner.indexOf('b:');
  const dIdx = inner.indexOf(' d:');

  if (bIdx !== -1) {
    const bSection = dIdx !== -1 ? inner.slice(bIdx + 2, dIdx).trim() : inner.slice(bIdx + 2).trim();
    // bSection might be: "1762 in Kurenets, Polish-Lithuanian Commonwealth"
    // or just: "1742" or "ABT 1824"
    const inIdx = bSection.indexOf(' in ');
    if (inIdx !== -1) {
      birthDate = bSection.slice(0, inIdx).trim() || null;
      birthPlace = bSection.slice(inIdx + 4).trim() || null;
    } else {
      birthDate = bSection.trim() || null;
    }
  }

  if (dIdx !== -1) {
    const dSection = inner.slice(dIdx + 3).trim();
    // dSection might be: "ABT 1824" or "1833 in Kurenets ..."
    const inIdx = dSection.indexOf(' in ');
    if (inIdx !== -1) {
      deathDate = dSection.slice(0, inIdx).trim() || null;
      deathPlace = dSection.slice(inIdx + 4).trim() || null;
    } else {
      deathDate = dSection.trim() || null;
    }
  }

  return { birthDate, deathDate, birthPlace, deathPlace };
}

/**
 * Parse a single person/spouse line.
 * Lines look like:
 *   "...1 Ellia Alperovich"
 *   "...+ Fnu Alperovich"
 *   "...............5 Nathan Notke Alperovich (b: ABT 1767 in Kurenets...)"
 */
function parseLine(line) {
  // Count leading dots to get depth
  let dotCount = 0;
  while (dotCount < line.length && line[dotCount] === '.') {
    dotCount++;
  }
  const depth = Math.floor(dotCount / 3) || 1;
  const rest = line.slice(dotCount).trim();

  if (!rest) return null;

  // Check if spouse (starts with +)
  const isSpouse = rest.startsWith('+');
  const afterPrefix = isSpouse ? rest.slice(1).trim() : rest;

  // Extract info in parens at end: "(b: ... d: ...)"
  // Match last balanced paren group
  const parenMatch = afterPrefix.match(/^(.*?)\s*(\(b:.*\))\s*$/);
  let nameAndGen, infoStr;
  if (parenMatch) {
    nameAndGen = parenMatch[1].trim();
    infoStr = parenMatch[2];
  } else {
    nameAndGen = afterPrefix.trim();
    infoStr = null;
  }

  // For non-spouse lines, nameAndGen starts with generation number
  let generation = null;
  let name = nameAndGen;

  if (!isSpouse) {
    const genMatch = nameAndGen.match(/^(\d+)\s+(.+)$/);
    if (genMatch) {
      generation = parseInt(genMatch[1], 10);
      name = genMatch[2].trim();
    }
  }

  const info = parseInfo(infoStr);

  return {
    isSpouse,
    generation,
    name: name || null,
    depth,
    ...info,
  };
}

function main() {
  console.log('Reading report from:', INPUT_PATH);
  const text = readFileSync(INPUT_PATH, 'utf8');
  const lines = text.split('\n');

  // Map: familyName -> Array of branch objects
  const familyMap = new Map();

  let currentBranch = null;
  let personIndex = 0;
  let totalPersons = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Branch header: "Branch 13 - Alperovich"
    const branchMatch = line.match(/^Branch\s+(\d+)\s+-\s+(.+)$/);
    if (branchMatch) {
      const branchId = parseInt(branchMatch[1], 10);
      const familyName = branchMatch[2].trim();

      currentBranch = {
        id: branchId,
        label: `Branch ${branchId}`,
        persons: [],
      };
      personIndex = 0;

      if (!familyMap.has(familyName)) {
        familyMap.set(familyName, []);
      }
      familyMap.get(familyName).push(currentBranch);
      continue;
    }

    // Person/spouse line: starts with dots
    if (line.startsWith('.') && currentBranch) {
      const parsed = parseLine(line);
      if (parsed && parsed.name) {
        const branchId = currentBranch.id;
        const person = {
          id: `b${branchId}-p${personIndex}`,
          generation: parsed.generation,
          name: parsed.name,
          isSpouse: parsed.isSpouse,
          birthDate: parsed.birthDate,
          deathDate: parsed.deathDate,
          birthPlace: parsed.birthPlace,
          deathPlace: parsed.deathPlace,
          depth: parsed.depth,
        };
        currentBranch.persons.push(person);
        personIndex++;
        totalPersons++;
      }
    }
  }

  // Build families array — exclude the Unknown bucket entirely.
  // Branches whose source family name is missing/invalid land in UNKNOWN_LABEL;
  // we normalise and drop them so no raw "Unknown" category is ever rendered.
  const families = [];

  /** Returns true for any placeholder family name that should be hidden. */
  function isPlaceholderFamily(name) {
    if (!name) return true;
    const clean = name.trim().toLowerCase();
    return !clean || clean === 'unknown' || clean === 'undefined' || clean === 'null';
  }

  // Sort valid family names alphabetically; Unknown bucket is simply skipped.
  const sortedFamilyNames = [...familyMap.keys()]
    .filter(name => !isPlaceholderFamily(name))
    .sort((a, b) => a.localeCompare(b));

  for (const familyName of sortedFamilyNames) {
    const branches = familyMap.get(familyName);
    families.push({
      name: familyName,
      branches,
    });
  }

  // Totals reflect only the included (named) families.
  const totalBranches = families.reduce((sum, fam) => sum + fam.branches.length, 0);
  const totalNamedPersons = families.reduce(
    (sum, fam) => sum + fam.branches.reduce((s2, b) => s2 + b.persons.length, 0),
    0,
  );

  const output = {
    meta: {
      totalPersons: totalNamedPersons,
      totalBranches,
    },
    families,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');

  console.log(`Done!`);
  console.log(`  Branches: ${totalBranches}`);
  console.log(`  Persons:  ${totalPersons}`);
  console.log(`  Families: ${families.length}`);
  console.log(`  Output:   ${OUTPUT_PATH}`);
}

main();
