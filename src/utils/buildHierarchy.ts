/**
 * buildHierarchy — transforms flat family_members / family_relations tables
 * (or the existing Person[] / Family[] model) into a nested JSON hierarchy
 * suitable for d3.hierarchy().
 *
 * Each node in the output tree carries:
 *   • name      – person's fullName
 *   • color     – a colour based on generation depth
 *   • personId  – original person id for linking back to the data model
 *   • children  – child nodes (empty array for leaves)
 */
import type { Person, Family } from '../types';

/* ── Public types ───────────────────────────────────────────────── */

export interface HierarchyNode {
  name: string;
  color: string;
  personId: string;
  generation: number;
  children: HierarchyNode[];
}

/* ── Generation colour palette (repeats after 10) ───────────────── */

const GENERATION_COLORS: string[] = [
  '#78716C', // stone-500  (gen 0 — root)
  '#0369A1', // sky-700
  '#15803D', // green-700
  '#B45309', // amber-700
  '#9333EA', // purple-600
  '#DB2777', // pink-600
  '#0891B2', // cyan-600
  '#65A30D', // lime-600
  '#DC2626', // red-600
  '#4F46E5', // indigo-600
];

export function generationColor(generation: number): string {
  const idx = Math.abs(generation) % GENERATION_COLORS.length;
  return GENERATION_COLORS[idx];
}

/* ── Core builder ───────────────────────────────────────────────── */

/**
 * Build a nested hierarchy rooted at `rootPersonId`.
 *
 * The algorithm performs a BFS downward through families:
 * for each person it visits every family where the person is a spouse and
 * adds all children of that family as nested child nodes.
 *
 * @param persons      – Map of id → Person  (or converted from array)
 * @param families     – Map of id → Family  (or converted from array)
 * @param rootPersonId – the person to place at the root of the tree
 * @returns a single HierarchyNode (the root) or null if the root id is not found
 */
export function buildHierarchy(
  persons: Map<string, Person>,
  families: Map<string, Family>,
  rootPersonId: string,
): HierarchyNode | null {
  const rootPerson = persons.get(rootPersonId);
  if (!rootPerson) return null;

  // Track visited person ids to prevent infinite cycles in the graph
  const visited = new Set<string>();

  function buildNode(personId: string, generation: number): HierarchyNode {
    const person = persons.get(personId);
    const name = person?.fullName ?? personId;

    const node: HierarchyNode = {
      name,
      color: generationColor(generation),
      personId,
      generation,
      children: [],
    };

    // Mark as visited before recursing to avoid cycles
    visited.add(personId);

    if (!person) return node;

    // Walk every family where this person is a spouse → collect children
    for (const famId of person.familiesAsSpouse) {
      const fam = families.get(famId);
      if (!fam) continue;

      for (const childId of fam.children) {
        if (visited.has(childId)) continue;
        node.children.push(buildNode(childId, generation + 1));
      }
    }

    return node;
  }

  return buildNode(rootPersonId, 0);
}

/* ── Convenience: build from flat arrays (matches Supabase table shape) ── */

export interface FamilyMemberRow {
  id: string;
  full_name: string;
  sex: string;
  birth_date?: string | null;
  death_date?: string | null;
  birth_place?: string | null;
  generation?: number | null;
}

export interface FamilyRelationRow {
  family_id: string;
  person_id: string;
  role: 'spouse' | 'child';
}

/**
 * Convert flat Supabase rows into the Map-based structures used by buildHierarchy.
 *
 * `family_members` → Map<string, Person>  (only the fields needed for the hierarchy)
 * `family_relations` → Map<string, Family>
 */
export function buildHierarchyFromRows(
  members: FamilyMemberRow[],
  relations: FamilyRelationRow[],
  rootPersonId: string,
): HierarchyNode | null {
  // Build Person map (minimal shape)
  const persons = new Map<string, Person>();
  for (const m of members) {
    persons.set(m.id, {
      id: m.id,
      fullName: m.full_name,
      givenName: '',
      surname: '',
      surnameFinal: '',
      sex: (m.sex === 'M' || m.sex === 'F') ? m.sex : 'U',
      birthDate: m.birth_date ?? null,
      deathDate: m.death_date ?? null,
      birthPlace: m.birth_place ?? null,
      generation: m.generation ?? null,
      relationToYael: null,
      hops: null,
      dnaInfo: null,
      coordinates: null,
      familiesAsSpouse: [],
      familyAsChild: null,
      title: null,
      hebrewName: null,
      birthName: null,
      fatherName: null,
      motherName: null,
      spouseName: null,
      childrenNames: null,
      surnameOrigin: null,
      jewishLineage: null,
      migrationInfo: null,
      holocaustVictim: false,
      warCasualty: false,
      connectionPathCount: null,
      doubleBloodTie: false,
      tags: [],
    });
  }

  // Build Family map from relations
  const familyMap = new Map<string, Family>();
  for (const r of relations) {
    let fam = familyMap.get(r.family_id);
    if (!fam) {
      fam = { id: r.family_id, spouses: [], children: [] };
      familyMap.set(r.family_id, fam);
    }
    if (r.role === 'spouse') {
      fam.spouses.push(r.person_id);
    } else {
      fam.children.push(r.person_id);
    }
  }

  // Wire familiesAsSpouse / familyAsChild on each Person
  for (const fam of familyMap.values()) {
    for (const spouseId of fam.spouses) {
      const p = persons.get(spouseId);
      if (p) p.familiesAsSpouse.push(fam.id);
    }
    for (const childId of fam.children) {
      const p = persons.get(childId);
      if (p && !p.familyAsChild) p.familyAsChild = fam.id;
    }
  }

  return buildHierarchy(persons, familyMap, rootPersonId);
}
