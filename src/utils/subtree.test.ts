import { describe, it, expect } from 'vitest';
import type { Person, Family } from '../types';
import { getSubtreeIds } from './subtree';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePerson(
  id: string,
  overrides: Partial<Person> = {}
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

function makeFamily(id: string, spouses: string[], children: string[]): Family {
  return { id, spouses, children };
}

function buildMaps(ps: Person[], fs: Family[]) {
  return {
    personsMap: new Map(ps.map(p => [p.id, p])),
    familiesMap: new Map(fs.map(f => [f.id, f])),
  };
}

// ---------------------------------------------------------------------------
// Three-generation tree:
//   GP --fam1--> P --fam2--> C
// ---------------------------------------------------------------------------
const GP = makePerson('GP', { familiesAsSpouse: ['fam1'] });
const P = makePerson('P', { familyAsChild: 'fam1', familiesAsSpouse: ['fam2'] });
const C = makePerson('C', { familyAsChild: 'fam2' });
const fam1 = makeFamily('fam1', ['GP'], [P.id]);
const fam2 = makeFamily('fam2', ['P'], [C.id]);
const { personsMap: linearPersons, familiesMap: linearFamilies } = buildMaps(
  [GP, P, C],
  [fam1, fam2]
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getSubtreeIds', () => {
  it('always includes the focal person', () => {
    const ids = getSubtreeIds('P', linearPersons, linearFamilies);
    expect(ids.has('P')).toBe(true);
  });

  it('collects ancestors within ancestorDepth', () => {
    const ids = getSubtreeIds('C', linearPersons, linearFamilies, 2, 0);
    expect(ids.has('P')).toBe(true);
    expect(ids.has('GP')).toBe(true);
  });

  it('respects ancestorDepth limit', () => {
    const ids = getSubtreeIds('C', linearPersons, linearFamilies, 1, 0);
    expect(ids.has('P')).toBe(true);
    expect(ids.has('GP')).toBe(false);
  });

  it('collects descendants within descendantDepth', () => {
    const ids = getSubtreeIds('GP', linearPersons, linearFamilies, 0, 2);
    expect(ids.has('P')).toBe(true);
    expect(ids.has('C')).toBe(true);
  });

  it('respects descendantDepth limit', () => {
    const ids = getSubtreeIds('GP', linearPersons, linearFamilies, 0, 1);
    expect(ids.has('P')).toBe(true);
    expect(ids.has('C')).toBe(false);
  });

  it('includes siblings of focal person', () => {
    // Add a sibling of P (both children of fam1)
    const Sibling = makePerson('SIB', { familyAsChild: 'fam1' });
    const fam1WithSib = makeFamily('fam1', ['GP'], ['P', 'SIB']);
    const { personsMap, familiesMap } = buildMaps([GP, P, C, Sibling], [fam1WithSib, fam2]);

    const ids = getSubtreeIds('P', personsMap, familiesMap, 0, 0);
    expect(ids.has('SIB')).toBe(true);
  });

  it('includes spouse when includeSpouseBranches=true (default)', () => {
    // P is married to spouse W in fam2; W is a direct member of the subtree
    const W = makePerson('W', { familiesAsSpouse: ['fam2'] });
    const fam2WithSpouse = makeFamily('fam2', ['P', 'W'], [C.id]);
    const { personsMap, familiesMap } = buildMaps([GP, P, C, W], [fam1, fam2WithSpouse]);

    const ids = getSubtreeIds('P', personsMap, familiesMap, 0, 1, true);
    expect(ids.has('W')).toBe(true);
  });

  it('returns at least the focal person for an isolated node', () => {
    const Iso = makePerson('Iso');
    const ids = getSubtreeIds('Iso', new Map([['Iso', Iso]]), new Map(), 4, 4);
    expect(ids.has('Iso')).toBe(true);
    expect(ids.size).toBe(1);
  });

  it('includes unknown personId in result (no person data, but ID is added)', () => {
    // getSubtreeIds adds the focal id unconditionally even if person is unknown
    const ids = getSubtreeIds('UNKNOWN', linearPersons, linearFamilies);
    expect(ids.has('UNKNOWN')).toBe(true);
    expect(ids.size).toBe(1);
  });
});
