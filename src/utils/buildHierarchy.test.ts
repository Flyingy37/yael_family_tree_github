import { describe, it, expect } from 'vitest';
import {
  buildHierarchy,
  buildHierarchyFromRows,
  generationColor,
  type HierarchyNode,
} from './buildHierarchy';
import type { Person, Family } from '../types';

/* ── helpers ──────────────────────────────────────────────────── */

function makePerson(overrides: Partial<Person> & { id: string }): Person {
  return {
    fullName: overrides.id,
    givenName: '',
    surname: '',
    surnameFinal: '',
    sex: 'U',
    birthDate: null,
    deathDate: null,
    birthPlace: null,
    generation: null,
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
    ...overrides,
  };
}

function personsMap(...list: Person[]): Map<string, Person> {
  return new Map(list.map(p => [p.id, p]));
}

function familiesMap(...list: Family[]): Map<string, Family> {
  return new Map(list.map(f => [f.id, f]));
}

/* ── generationColor ─────────────────────────────────────────── */

describe('generationColor', () => {
  it('returns a color string for generation 0', () => {
    expect(generationColor(0)).toBe('#78716C');
  });

  it('wraps around after 10 generations', () => {
    expect(generationColor(10)).toBe(generationColor(0));
  });

  it('handles negative generations via absolute value', () => {
    expect(generationColor(-1)).toBe(generationColor(1));
  });
});

/* ── buildHierarchy ──────────────────────────────────────────── */

describe('buildHierarchy', () => {
  it('returns null when root person is not found', () => {
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    expect(buildHierarchy(persons, families, '@I999@')).toBeNull();
  });

  it('builds a single-node tree for a person with no families', () => {
    const root = makePerson({ id: '@I1@', fullName: 'Root Person' });
    const result = buildHierarchy(personsMap(root), familiesMap(), '@I1@');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Root Person');
    expect(result!.generation).toBe(0);
    expect(result!.children).toEqual([]);
  });

  it('builds a two-level tree with children', () => {
    const parent = makePerson({ id: '@I1@', fullName: 'Parent', familiesAsSpouse: ['@F1@'] });
    const child1 = makePerson({ id: '@I2@', fullName: 'Child 1' });
    const child2 = makePerson({ id: '@I3@', fullName: 'Child 2' });
    const fam: Family = { id: '@F1@', spouses: ['@I1@'], children: ['@I2@', '@I3@'] };

    const result = buildHierarchy(
      personsMap(parent, child1, child2),
      familiesMap(fam),
      '@I1@',
    );

    expect(result).not.toBeNull();
    expect(result!.children).toHaveLength(2);
    expect(result!.children[0].name).toBe('Child 1');
    expect(result!.children[0].generation).toBe(1);
    expect(result!.children[1].name).toBe('Child 2');
  });

  it('assigns different colors to different generations', () => {
    const gp = makePerson({ id: 'gp', fullName: 'Grandparent', familiesAsSpouse: ['f1'] });
    const p  = makePerson({ id: 'p', fullName: 'Parent', familiesAsSpouse: ['f2'] });
    const c  = makePerson({ id: 'c', fullName: 'Child' });
    const f1: Family = { id: 'f1', spouses: ['gp'], children: ['p'] };
    const f2: Family = { id: 'f2', spouses: ['p'], children: ['c'] };

    const result = buildHierarchy(
      personsMap(gp, p, c),
      familiesMap(f1, f2),
      'gp',
    )!;

    expect(result.color).toBe(generationColor(0));
    expect(result.children[0].color).toBe(generationColor(1));
    expect(result.children[0].children[0].color).toBe(generationColor(2));
  });

  it('does not loop on cycles', () => {
    // Person A is spouse in F1 with child B, and B is spouse in F2 with child A
    const a = makePerson({ id: 'A', familiesAsSpouse: ['f1'] });
    const b = makePerson({ id: 'B', familiesAsSpouse: ['f2'] });
    const f1: Family = { id: 'f1', spouses: ['A'], children: ['B'] };
    const f2: Family = { id: 'f2', spouses: ['B'], children: ['A'] };

    const result = buildHierarchy(personsMap(a, b), familiesMap(f1, f2), 'A');
    expect(result).not.toBeNull();
    // A → B, but B cannot recurse back to A (visited)
    expect(result!.children).toHaveLength(1);
    expect(result!.children[0].personId).toBe('B');
    expect(result!.children[0].children).toHaveLength(0);
  });
});

/* ── buildHierarchyFromRows ──────────────────────────────────── */

describe('buildHierarchyFromRows', () => {
  it('builds hierarchy from flat Supabase-like rows', () => {
    const members = [
      { id: 'r', full_name: 'Root', sex: 'M' },
      { id: 'c1', full_name: 'Child One', sex: 'F' },
    ];
    const relations = [
      { family_id: 'fam1', person_id: 'r', role: 'spouse' as const },
      { family_id: 'fam1', person_id: 'c1', role: 'child' as const },
    ];

    const result = buildHierarchyFromRows(members, relations, 'r');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Root');
    expect(result!.children).toHaveLength(1);
    expect(result!.children[0].name).toBe('Child One');
  });

  it('returns null when root id is not in members', () => {
    const result = buildHierarchyFromRows([], [], 'missing');
    expect(result).toBeNull();
  });
});
