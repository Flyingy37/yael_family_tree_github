import { describe, it, expect } from 'vitest';
import type { Person, Family } from '../types';
import { getSubtreeIds } from './subtree';

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

// ── tests ─────────────────────────────────────────────────────────────────────

describe('getSubtreeIds', () => {
  it('returns at least the person themselves', () => {
    const persons = new Map([['p', makePerson('p')]]);
    const families = new Map<string, Family>();
    const result = getSubtreeIds('p', persons, families);
    expect(result.has('p')).toBe(true);
  });

  it('includes the focal person for an unknown id', () => {
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    const result = getSubtreeIds('ghost', persons, families);
    // No person in map, but the id is still added by collectAncestors
    expect(result.has('ghost')).toBe(true);
  });

  it('includes parent (ancestor depth)', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['f1'])],
      ['child', makePerson('child', 'f1')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['parent'], ['child'])],
    ]);
    const result = getSubtreeIds('child', persons, families, 1, 0, false);
    expect(result.has('parent')).toBe(true);
    expect(result.has('child')).toBe(true);
  });

  it('includes children (descendant depth)', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['f1'])],
      ['child', makePerson('child', 'f1')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['parent'], ['child'])],
    ]);
    const result = getSubtreeIds('parent', persons, families, 0, 1, false);
    expect(result.has('child')).toBe(true);
    expect(result.has('parent')).toBe(true);
  });

  it('includes siblings via familyAsChild', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['f1'])],
      ['sib1', makePerson('sib1', 'f1')],
      ['sib2', makePerson('sib2', 'f1')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['parent'], ['sib1', 'sib2'])],
    ]);
    // sib1 is focal person; sib2 should appear as a sibling
    const result = getSubtreeIds('sib1', persons, families, 0, 0, false);
    expect(result.has('sib2')).toBe(true);
  });

  it('includes spouse when includeSpouseBranches is true', () => {
    const persons = new Map([
      ['p1', makePerson('p1', null, ['fam1'])],
      ['p2', makePerson('p2', null, ['fam1'])],
      ['child', makePerson('child', 'fam1')],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['p1', 'p2'], ['child'])],
    ]);
    const result = getSubtreeIds('p1', persons, families, 0, 1, true);
    expect(result.has('p2')).toBe(true);
  });

  it('respects ancestorDepth=0 — does not go above focal person', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    const result = getSubtreeIds('c', persons, families, 0, 0, false);
    // depth 0 ancestor means only 'c' itself is added by collectAncestors
    expect(result.has('c')).toBe(true);
    expect(result.has('p')).toBe(false);
    expect(result.has('gp')).toBe(false);
  });

  it('respects descendantDepth=0 — does not go below focal person', () => {
    const persons = new Map([
      ['p', makePerson('p', null, ['f1'])],
      ['c', makePerson('c', 'f1')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['p'], ['c'])],
    ]);
    // With descendantDepth=0 collectDescendants still adds focal person but
    // recursion stops at depth -1 before adding children.
    const result = getSubtreeIds('p', persons, families, 0, 0, false);
    expect(result.has('p')).toBe(true);
    expect(result.has('c')).toBe(false);
  });
});
