import { describe, it, expect } from 'vitest';
import type { Person, Family } from '../types';
import { buildHierarchy } from './buildHierarchy';
import type { HierarchyNode } from './buildHierarchy';

// ── helpers ──────────────────────────────────────────────────────────────────

function makePerson(
  id: string,
  familyAsChild: string | null = null,
  familiesAsSpouse: string[] = []
): Person {
  return {
    id,
    fullName: id,
    givenName: id,
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
    familiesAsSpouse,
    familyAsChild,
    title: null,
    note: null,
    note_plain: null,
    photoUrl: null,
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
  };
}

function makeFamily(id: string, spouses: string[], children: string[]): Family {
  return { id, spouses, children };
}

// ── buildHierarchy ───────────────────────────────────────────────────────────

describe('buildHierarchy', () => {
  it('returns undefined when rootId is not in the map', () => {
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    expect(buildHierarchy(persons, families, 'nonexistent')).toBeUndefined();
  });

  it('returns a leaf node with empty children when person has no families', () => {
    const persons = new Map([['p1', makePerson('p1')]]);
    const families = new Map<string, Family>();
    const root = buildHierarchy(persons, families, 'p1');
    expect(root).toBeDefined();
    expect(root!.id).toBe('p1');
    expect(root!.children).toEqual([]);
  });

  it('attaches direct children to parent', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['fam1'])],
      ['child1', makePerson('child1', 'fam1')],
      ['child2', makePerson('child2', 'fam1')],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['parent'], ['child1', 'child2'])],
    ]);

    const root = buildHierarchy(persons, families, 'parent');
    expect(root).toBeDefined();
    expect(root!.children.length).toBe(2);
    expect(root!.children.map(c => c.id).sort()).toEqual(['child1', 'child2']);
  });

  it('builds multi-generation hierarchy', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);

    const root = buildHierarchy(persons, families, 'gp');
    expect(root).toBeDefined();
    expect(root!.id).toBe('gp');
    expect(root!.children.length).toBe(1);
    expect(root!.children[0].id).toBe('p');
    expect(root!.children[0].children.length).toBe(1);
    expect(root!.children[0].children[0].id).toBe('c');
    expect(root!.children[0].children[0].children).toEqual([]);
  });

  it('both spouses receive the same children', () => {
    const persons = new Map([
      ['s1', makePerson('s1', null, ['fam1'])],
      ['s2', makePerson('s2', null, ['fam1'])],
      ['child', makePerson('child', 'fam1')],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['s1', 's2'], ['child'])],
    ]);

    const fromS1 = buildHierarchy(persons, families, 's1')!;
    const fromS2 = buildHierarchy(persons, families, 's2')!;
    expect(fromS1.children.length).toBe(1);
    expect(fromS1.children[0].id).toBe('child');
    expect(fromS2.children.length).toBe(1);
    expect(fromS2.children[0].id).toBe('child');
  });

  it('does not mutate the original persons map', () => {
    const original = makePerson('p1', null, ['fam1']);
    const persons = new Map([
      ['p1', original],
      ['c1', makePerson('c1', 'fam1')],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['p1'], ['c1'])],
    ]);

    buildHierarchy(persons, families, 'p1');

    // The original person object should not have a 'children' property
    expect('children' in original).toBe(false);
  });

  it('skips child references not in personsMap', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['fam1'])],
      // 'ghost' child is NOT in the persons map
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['parent'], ['ghost'])],
    ]);

    const root = buildHierarchy(persons, families, 'parent');
    expect(root).toBeDefined();
    expect(root!.children).toEqual([]);
  });

  it('handles multiple families for one parent', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['fam1', 'fam2'])],
      ['c1', makePerson('c1', 'fam1')],
      ['c2', makePerson('c2', 'fam2')],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['parent'], ['c1'])],
      ['fam2', makeFamily('fam2', ['parent'], ['c2'])],
    ]);

    const root = buildHierarchy(persons, families, 'parent');
    expect(root).toBeDefined();
    expect(root!.children.length).toBe(2);
    expect(root!.children.map(c => c.id).sort()).toEqual(['c1', 'c2']);
  });

  it('can root the tree at a mid-level person', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);

    // Root at 'p' — should only contain descendants, not ancestors
    const root = buildHierarchy(persons, families, 'p');
    expect(root).toBeDefined();
    expect(root!.id).toBe('p');
    expect(root!.children.length).toBe(1);
    expect(root!.children[0].id).toBe('c');
  });
});
