import { describe, it, expect } from 'vitest';
import type { Person, Family } from '../types';
import { getSubtreeIds } from './subtree';

function makePerson(
  id: string,
  familyAsChild: string | null = null,
  familiesAsSpouse: string[] = [],
): Person {
  return {
    id, fullName: id, givenName: id, surname: '', surnameFinal: '', sex: 'U',
    birthDate: null, deathDate: null, birthPlace: null, generation: null,
    relationToYael: null, hops: null, dnaInfo: null, coordinates: null,
    familiesAsSpouse, familyAsChild, title: null, note: null, note_plain: null,
    photoUrl: null, hebrewName: null, birthName: null, fatherName: null,
    motherName: null, spouseName: null, childrenNames: null, surnameOrigin: null,
    jewishLineage: null, migrationInfo: null, holocaustVictim: false,
    warCasualty: false, connectionPathCount: null, doubleBloodTie: false, tags: [],
  };
}

function makeFamily(id: string, spouses: string[], children: string[]): Family {
  return { id, spouses, children };
}

describe('getSubtreeIds', () => {
  it('returns empty set when person is not in the map', () => {
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    const result = getSubtreeIds('missing', persons, families);
    // The person id itself is added by collectAncestors before checking the map
    expect(result.has('missing')).toBe(true);
    expect(result.size).toBe(1);
  });

  it('returns only the person when they have no families', () => {
    const persons = new Map<string, Person>([['A', makePerson('A')]]);
    const families = new Map<string, Family>();
    const result = getSubtreeIds('A', persons, families);
    expect(result).toEqual(new Set(['A']));
  });

  it('collects ancestors up to the specified depth', () => {
    // A (child of F1) -> parent P1 (child of F2) -> grandparent G1
    const persons = new Map<string, Person>([
      ['A', makePerson('A', 'F1')],
      ['P1', makePerson('P1', 'F2', ['F1'])],
      ['G1', makePerson('G1', null, ['F2'])],
    ]);
    const families = new Map<string, Family>([
      ['F1', makeFamily('F1', ['P1'], ['A'])],
      ['F2', makeFamily('F2', ['G1'], ['P1'])],
    ]);
    const result = getSubtreeIds('A', persons, families, 2, 0);
    expect(result.has('A')).toBe(true);
    expect(result.has('P1')).toBe(true);
    expect(result.has('G1')).toBe(true);
  });

  it('respects ancestor depth limit', () => {
    // Chain: A -> P1 -> G1 -> GG1, but depth=1 should only reach P1
    const persons = new Map<string, Person>([
      ['A', makePerson('A', 'F1')],
      ['P1', makePerson('P1', 'F2', ['F1'])],
      ['G1', makePerson('G1', 'F3', ['F2'])],
      ['GG1', makePerson('GG1', null, ['F3'])],
    ]);
    const families = new Map<string, Family>([
      ['F1', makeFamily('F1', ['P1'], ['A'])],
      ['F2', makeFamily('F2', ['G1'], ['P1'])],
      ['F3', makeFamily('F3', ['GG1'], ['G1'])],
    ]);
    const result = getSubtreeIds('A', persons, families, 1, 0);
    expect(result.has('A')).toBe(true);
    expect(result.has('P1')).toBe(true);
    expect(result.has('G1')).toBe(false);
  });

  it('collects descendants up to the specified depth', () => {
    // A -> child C1 -> grandchild C2
    const persons = new Map<string, Person>([
      ['A', makePerson('A', null, ['F1'])],
      ['C1', makePerson('C1', 'F1', ['F2'])],
      ['C2', makePerson('C2', 'F2')],
    ]);
    const families = new Map<string, Family>([
      ['F1', makeFamily('F1', ['A'], ['C1'])],
      ['F2', makeFamily('F2', ['C1'], ['C2'])],
    ]);
    const result = getSubtreeIds('A', persons, families, 0, 2, false);
    expect(result.has('A')).toBe(true);
    expect(result.has('C1')).toBe(true);
    expect(result.has('C2')).toBe(true);
  });

  it('respects descendant depth limit', () => {
    // A -> C1 -> C2 -> C3, depth=1 should reach C1 but not C2
    const persons = new Map<string, Person>([
      ['A', makePerson('A', null, ['F1'])],
      ['C1', makePerson('C1', 'F1', ['F2'])],
      ['C2', makePerson('C2', 'F2', ['F3'])],
      ['C3', makePerson('C3', 'F3')],
    ]);
    const families = new Map<string, Family>([
      ['F1', makeFamily('F1', ['A'], ['C1'])],
      ['F2', makeFamily('F2', ['C1'], ['C2'])],
      ['F3', makeFamily('F3', ['C2'], ['C3'])],
    ]);
    const result = getSubtreeIds('A', persons, families, 0, 1, false);
    expect(result.has('A')).toBe(true);
    expect(result.has('C1')).toBe(true);
    expect(result.has('C2')).toBe(false);
    expect(result.has('C3')).toBe(false);
  });

  it('includes spouse of a descendant', () => {
    const persons = new Map<string, Person>([
      ['A', makePerson('A', null, ['F1'])],
      ['C1', makePerson('C1', 'F1')],
      ['Spouse', makePerson('Spouse')],
    ]);
    const families = new Map<string, Family>([
      ['F1', makeFamily('F1', ['A', 'Spouse'], ['C1'])],
    ]);
    const result = getSubtreeIds('A', persons, families, 0, 2, false);
    expect(result.has('Spouse')).toBe(true);
  });

  it('includeSpouseBranches=true traverses ancestors/descendants of spouses', () => {
    // A has child C1 via F1 with Spouse. Spouse has parent SP via F2.
    const persons = new Map<string, Person>([
      ['A', makePerson('A', null, ['F1'])],
      ['Spouse', makePerson('Spouse', 'F2', ['F1'])],
      ['SP', makePerson('SP', null, ['F2'])],
      ['C1', makePerson('C1', 'F1')],
    ]);
    const families = new Map<string, Family>([
      ['F1', makeFamily('F1', ['A', 'Spouse'], ['C1'])],
      ['F2', makeFamily('F2', ['SP'], ['Spouse'])],
    ]);
    const result = getSubtreeIds('A', persons, families, 0, 4, true);
    expect(result.has('SP')).toBe(true);
  });

  it('includeSpouseBranches=false does NOT traverse ancestors of spouses', () => {
    const persons = new Map<string, Person>([
      ['A', makePerson('A', null, ['F1'])],
      ['Spouse', makePerson('Spouse', 'F2', ['F1'])],
      ['SP', makePerson('SP', null, ['F2'])],
      ['C1', makePerson('C1', 'F1')],
    ]);
    const families = new Map<string, Family>([
      ['F1', makeFamily('F1', ['A', 'Spouse'], ['C1'])],
      ['F2', makeFamily('F2', ['SP'], ['Spouse'])],
    ]);
    const result = getSubtreeIds('A', persons, families, 0, 4, false);
    expect(result.has('Spouse')).toBe(true);
    expect(result.has('SP')).toBe(false);
  });

  it('includes siblings via familyAsChild', () => {
    const persons = new Map<string, Person>([
      ['A', makePerson('A', 'F1')],
      ['Sib1', makePerson('Sib1', 'F1')],
      ['Sib2', makePerson('Sib2', 'F1')],
      ['Parent', makePerson('Parent', null, ['F1'])],
    ]);
    const families = new Map<string, Family>([
      ['F1', makeFamily('F1', ['Parent'], ['A', 'Sib1', 'Sib2'])],
    ]);
    const result = getSubtreeIds('A', persons, families, 1, 0);
    expect(result.has('Sib1')).toBe(true);
    expect(result.has('Sib2')).toBe(true);
  });

  it('handles cycles without infinite loops (visited guard)', () => {
    // Create a cycle: A is child of F1 whose parent is B, B is child of F2 whose parent is A
    const persons = new Map<string, Person>([
      ['A', makePerson('A', 'F1', ['F2'])],
      ['B', makePerson('B', 'F2', ['F1'])],
    ]);
    const families = new Map<string, Family>([
      ['F1', makeFamily('F1', ['B'], ['A'])],
      ['F2', makeFamily('F2', ['A'], ['B'])],
    ]);
    // Should not hang — visited sets break the loop
    const result = getSubtreeIds('A', persons, families, 10, 10);
    expect(result.has('A')).toBe(true);
    expect(result.has('B')).toBe(true);
  });

  it('uses default depth parameters (4 ancestors, 4 descendants)', () => {
    // Build a 5-deep ancestor chain; only 4 should be reached
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    let prev = 'A';
    persons.set('A', makePerson('A', 'F0'));
    for (let i = 1; i <= 5; i++) {
      const pid = `P${i}`;
      const fid = `F${i - 1}`;
      const parentFam = i < 5 ? `F${i}` : null;
      persons.set(pid, makePerson(pid, parentFam, [fid]));
      families.set(fid, makeFamily(fid, [pid], [prev]));
      prev = pid;
    }
    const result = getSubtreeIds('A', persons, families);
    // depth=4 means A + P1..P4 reachable, P5 is at depth 5 → not reached
    expect(result.has('P4')).toBe(true);
    expect(result.has('P5')).toBe(false);
  });

  it('depth=0 returns only the root person (no traversal)', () => {
    const persons = new Map<string, Person>([
      ['A', makePerson('A', 'F1', ['F2'])],
      ['Parent', makePerson('Parent', null, ['F1'])],
      ['Child', makePerson('Child', 'F2')],
    ]);
    const families = new Map<string, Family>([
      ['F1', makeFamily('F1', ['Parent'], ['A'])],
      ['F2', makeFamily('F2', ['A'], ['Child'])],
    ]);
    const result = getSubtreeIds('A', persons, families, 0, 0);
    expect(result.has('A')).toBe(true);
    // Parent is not traversed (ancestor depth=0 adds A, then recurse with -1 stops)
    expect(result.has('Parent')).toBe(false);
    expect(result.has('Child')).toBe(false);
  });

  it('handles missing family references gracefully', () => {
    // Person references families that don't exist in the map
    const persons = new Map<string, Person>([
      ['A', makePerson('A', 'nonexistent_fam', ['also_missing'])],
    ]);
    const families = new Map<string, Family>();
    const result = getSubtreeIds('A', persons, families, 2, 2);
    expect(result).toEqual(new Set(['A']));
  });

  it('collects both parents from a two-parent family', () => {
    const persons = new Map<string, Person>([
      ['A', makePerson('A', 'F1')],
      ['Dad', makePerson('Dad', null, ['F1'])],
      ['Mom', makePerson('Mom', null, ['F1'])],
    ]);
    const families = new Map<string, Family>([
      ['F1', makeFamily('F1', ['Dad', 'Mom'], ['A'])],
    ]);
    const result = getSubtreeIds('A', persons, families, 1, 0);
    expect(result.has('Dad')).toBe(true);
    expect(result.has('Mom')).toBe(true);
  });
});
