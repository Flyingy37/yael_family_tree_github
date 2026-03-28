import { describe, it, expect } from 'vitest';
import type { Person, Family } from '../../types';
import {
  getAncestorChain,
  getDescendantIds,
  countDescendantsMap,
  findPathBFS,
  getNeighborPersonIds,
  addSpousesForVisibleSet,
  computeInitialLazyVisibleIds,
} from '../treeHelpers';

// ---------------------------------------------------------------------------
// Helpers to build minimal test fixtures
// ---------------------------------------------------------------------------

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

function makeFamily(overrides: Partial<Family> & { id: string }): Family {
  return { spouses: [], children: [], ...overrides };
}

function buildMaps(persons: Person[], families: Family[]) {
  const pMap = new Map(persons.map(p => [p.id, p]));
  const fMap = new Map(families.map(f => [f.id, f]));
  return { pMap, fMap };
}

// ---------------------------------------------------------------------------
// A simple three-generation family:
//   grandparent (GP) ──married─► grandparent2 (GP2)  [fam-root]
//                     └── parent (P1)  [fam-p1]
//                               └── child (C1)
// ---------------------------------------------------------------------------

function buildThreeGenFixture() {
  const gp = makePerson({ id: 'GP', familiesAsSpouse: ['fam-root'] });
  const gp2 = makePerson({ id: 'GP2', familiesAsSpouse: ['fam-root'] });
  const p1 = makePerson({ id: 'P1', familyAsChild: 'fam-root', familiesAsSpouse: ['fam-p1'] });
  const c1 = makePerson({ id: 'C1', familyAsChild: 'fam-p1' });

  const famRoot = makeFamily({ id: 'fam-root', spouses: ['GP', 'GP2'], children: ['P1'] });
  const famP1 = makeFamily({ id: 'fam-p1', spouses: ['P1'], children: ['C1'] });

  const { pMap, fMap } = buildMaps([gp, gp2, p1, c1], [famRoot, famP1]);
  return { pMap, fMap };
}

// ---------------------------------------------------------------------------
// getAncestorChain
// ---------------------------------------------------------------------------

describe('getAncestorChain', () => {
  it('returns just the target when there is no familyAsChild', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    expect(getAncestorChain('GP', pMap, fMap)).toEqual(['GP']);
  });

  it('walks up to the grandparent', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    // C1 → P1 → GP  (first spouse)
    const chain = getAncestorChain('C1', pMap, fMap);
    expect(chain).toEqual(['GP', 'P1', 'C1']);
  });

  it('returns just the target for an unknown id', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    expect(getAncestorChain('UNKNOWN', pMap, fMap)).toEqual(['UNKNOWN']);
  });

  it('respects maxDepth', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    // maxDepth=1: only one hop up from C1
    const chain = getAncestorChain('C1', pMap, fMap, 1);
    expect(chain).toEqual(['P1', 'C1']);
  });

  it('does not loop on a cycle', () => {
    // P→GP→P cycle
    const gp = makePerson({ id: 'GP', familyAsChild: 'fam-root', familiesAsSpouse: [] });
    const p = makePerson({ id: 'P', familyAsChild: 'fam-root', familiesAsSpouse: [] });
    const fam = makeFamily({ id: 'fam-root', spouses: ['GP'], children: ['P'] });
    const { pMap, fMap } = buildMaps([gp, p], [fam]);
    // getAncestorChain from P: GP is first spouse of fam-root, then GP's familyAsChild is also fam-root
    // cycle guard: GP is already seen when we try to go from GP → GP again
    const chain = getAncestorChain('P', pMap, fMap, 10);
    expect(chain).toContain('P');
    expect(chain).toContain('GP');
    expect(chain.length).toBeLessThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// getDescendantIds
// ---------------------------------------------------------------------------

describe('getDescendantIds', () => {
  it('returns empty set for a leaf person', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    expect(getDescendantIds('C1', pMap, fMap).size).toBe(0);
  });

  it('returns direct child', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const desc = getDescendantIds('P1', pMap, fMap);
    expect(desc).toContain('C1');
    expect(desc.size).toBe(1);
  });

  it('returns all descendants transitively', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const desc = getDescendantIds('GP', pMap, fMap);
    expect(desc).toContain('P1');
    expect(desc).toContain('C1');
    expect(desc.size).toBe(2);
  });

  it('returns empty set for an unknown id', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    expect(getDescendantIds('MISSING', pMap, fMap).size).toBe(0);
  });

  it('does not include the start person itself', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const desc = getDescendantIds('GP', pMap, fMap);
    expect(desc.has('GP')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// countDescendantsMap
// ---------------------------------------------------------------------------

describe('countDescendantsMap', () => {
  it('returns 0 for leaf nodes', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const counts = countDescendantsMap(pMap, fMap);
    expect(counts.get('C1')).toBe(0);
  });

  it('counts direct children', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const counts = countDescendantsMap(pMap, fMap);
    expect(counts.get('P1')).toBe(1);
  });

  it('counts all descendants transitively', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const counts = countDescendantsMap(pMap, fMap);
    // GP has P1 and C1 as descendants
    expect(counts.get('GP')).toBe(2);
  });

  it('handles person with no families', () => {
    const p = makePerson({ id: 'LONE' });
    const { pMap, fMap } = buildMaps([p], []);
    expect(countDescendantsMap(pMap, fMap).get('LONE')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// findPathBFS
// ---------------------------------------------------------------------------

describe('findPathBFS', () => {
  it('returns [id] when start === end', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    expect(findPathBFS('GP', 'GP', pMap, fMap)).toEqual(['GP']);
  });

  it('finds path between grandparent and grandchild', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const path = findPathBFS('GP', 'C1', pMap, fMap);
    expect(path[0]).toBe('GP');
    expect(path[path.length - 1]).toBe('C1');
    expect(path.length).toBeGreaterThan(1);
  });

  it('finds path between spouses', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const path = findPathBFS('GP', 'GP2', pMap, fMap);
    expect(path).toContain('GP');
    expect(path).toContain('GP2');
  });

  it('returns empty array when no path exists', () => {
    // Two isolated people
    const a = makePerson({ id: 'A' });
    const b = makePerson({ id: 'B' });
    const { pMap, fMap } = buildMaps([a, b], []);
    expect(findPathBFS('A', 'B', pMap, fMap)).toEqual([]);
  });

  it('returns empty array for unknown start id', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    expect(findPathBFS('UNKNOWN', 'C1', pMap, fMap)).toEqual([]);
  });

  it('finds siblings via their common family', () => {
    const parent = makePerson({ id: 'PAR', familiesAsSpouse: ['fam1'] });
    const s1 = makePerson({ id: 'S1', familyAsChild: 'fam1' });
    const s2 = makePerson({ id: 'S2', familyAsChild: 'fam1' });
    const fam = makeFamily({ id: 'fam1', spouses: ['PAR'], children: ['S1', 'S2'] });
    const { pMap, fMap } = buildMaps([parent, s1, s2], [fam]);
    const path = findPathBFS('S1', 'S2', pMap, fMap);
    expect(path[0]).toBe('S1');
    expect(path[path.length - 1]).toBe('S2');
  });
});

// ---------------------------------------------------------------------------
// getNeighborPersonIds
// ---------------------------------------------------------------------------

describe('getNeighborPersonIds', () => {
  it('returns empty set for unknown person', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    expect(getNeighborPersonIds('MISSING', pMap, fMap).size).toBe(0);
  });

  it('includes spouse', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const neighbors = getNeighborPersonIds('GP', pMap, fMap);
    expect(neighbors.has('GP2')).toBe(true);
  });

  it('includes child', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const neighbors = getNeighborPersonIds('GP', pMap, fMap);
    expect(neighbors.has('P1')).toBe(true);
  });

  it('includes parents via familyAsChild', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const neighbors = getNeighborPersonIds('P1', pMap, fMap);
    expect(neighbors.has('GP')).toBe(true);
    expect(neighbors.has('GP2')).toBe(true);
  });

  it('includes siblings via familyAsChild', () => {
    const gp = makePerson({ id: 'GP', familiesAsSpouse: ['fam-root'] });
    const s1 = makePerson({ id: 'S1', familyAsChild: 'fam-root' });
    const s2 = makePerson({ id: 'S2', familyAsChild: 'fam-root' });
    const fam = makeFamily({ id: 'fam-root', spouses: ['GP'], children: ['S1', 'S2'] });
    const { pMap, fMap } = buildMaps([gp, s1, s2], [fam]);
    const neighbors = getNeighborPersonIds('S1', pMap, fMap);
    expect(neighbors.has('S2')).toBe(true);
  });

  it('does not include the person itself', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const neighbors = getNeighborPersonIds('GP', pMap, fMap);
    expect(neighbors.has('GP')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addSpousesForVisibleSet
// ---------------------------------------------------------------------------

describe('addSpousesForVisibleSet', () => {
  it('adds a spouse that is in allowed but not yet visible', () => {
    const a = makePerson({ id: 'A', familiesAsSpouse: ['fam1'] });
    const b = makePerson({ id: 'B', familiesAsSpouse: ['fam1'] });
    const fam = makeFamily({ id: 'fam1', spouses: ['A', 'B'], children: [] });
    const { pMap, fMap } = buildMaps([a, b], [fam]);

    const visible = new Set(['A']);
    const allowed = new Set(['A', 'B']);
    addSpousesForVisibleSet(visible, pMap, fMap, allowed);
    expect(visible.has('B')).toBe(true);
  });

  it('does not add a spouse that is not in allowed', () => {
    const a = makePerson({ id: 'A', familiesAsSpouse: ['fam1'] });
    const b = makePerson({ id: 'B', familiesAsSpouse: ['fam1'] });
    const fam = makeFamily({ id: 'fam1', spouses: ['A', 'B'], children: [] });
    const { pMap, fMap } = buildMaps([a, b], [fam]);

    const visible = new Set(['A']);
    const allowed = new Set(['A']); // B not allowed
    addSpousesForVisibleSet(visible, pMap, fMap, allowed);
    expect(visible.has('B')).toBe(false);
  });

  it('propagates transitively (A→B→C all spouses)', () => {
    // A married B (fam1), B also married C (fam2)
    const a = makePerson({ id: 'A', familiesAsSpouse: ['fam1'] });
    const b = makePerson({ id: 'B', familiesAsSpouse: ['fam1', 'fam2'] });
    const c = makePerson({ id: 'C', familiesAsSpouse: ['fam2'] });
    const fam1 = makeFamily({ id: 'fam1', spouses: ['A', 'B'], children: [] });
    const fam2 = makeFamily({ id: 'fam2', spouses: ['B', 'C'], children: [] });
    const { pMap, fMap } = buildMaps([a, b, c], [fam1, fam2]);

    const visible = new Set(['A']);
    const allowed = new Set(['A', 'B', 'C']);
    addSpousesForVisibleSet(visible, pMap, fMap, allowed);
    expect(visible.has('B')).toBe(true);
    expect(visible.has('C')).toBe(true);
  });

  it('is a no-op when visible is already the closure', () => {
    const a = makePerson({ id: 'A', familiesAsSpouse: ['fam1'] });
    const b = makePerson({ id: 'B', familiesAsSpouse: ['fam1'] });
    const fam = makeFamily({ id: 'fam1', spouses: ['A', 'B'], children: [] });
    const { pMap, fMap } = buildMaps([a, b], [fam]);

    const visible = new Set(['A', 'B']);
    const allowed = new Set(['A', 'B']);
    addSpousesForVisibleSet(visible, pMap, fMap, allowed);
    expect(visible.size).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// computeInitialLazyVisibleIds
// ---------------------------------------------------------------------------

describe('computeInitialLazyVisibleIds', () => {
  it('returns empty set when root is not in allowed', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const result = computeInitialLazyVisibleIds('GP', pMap, fMap, new Set(), 2, 2);
    expect(result.size).toBe(0);
  });

  it('returns empty set when root is not in persons map', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const result = computeInitialLazyVisibleIds('MISSING', pMap, fMap, new Set(['MISSING']), 2, 2);
    expect(result.size).toBe(0);
  });

  it('includes root when allowed', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const allowed = new Set(['GP', 'GP2', 'P1', 'C1']);
    const result = computeInitialLazyVisibleIds('P1', pMap, fMap, allowed, 1, 1);
    expect(result.has('P1')).toBe(true);
  });

  it('includes ancestors up to given depth', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const allowed = new Set(['GP', 'GP2', 'P1', 'C1']);
    // Root = C1, 1 ancestor gen → should include P1
    const result = computeInitialLazyVisibleIds('C1', pMap, fMap, allowed, 1, 0);
    expect(result.has('P1')).toBe(true);
  });

  it('does not include ancestors beyond the specified depth', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const allowed = new Set(['GP', 'GP2', 'P1', 'C1']);
    // Root = C1, 0 ancestor gens → GP should NOT be included via ancestor path
    const result = computeInitialLazyVisibleIds('C1', pMap, fMap, allowed, 0, 0);
    // Only C1 (and its spouse closure which is empty)
    expect(result.has('C1')).toBe(true);
    expect(result.has('GP')).toBe(false);
  });

  it('includes descendants up to given depth', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const allowed = new Set(['GP', 'GP2', 'P1', 'C1']);
    // Root = GP, 1 descendant gen → should include P1
    const result = computeInitialLazyVisibleIds('GP', pMap, fMap, allowed, 0, 1);
    expect(result.has('P1')).toBe(true);
  });

  it('adds spouses of visible persons via closure', () => {
    const { pMap, fMap } = buildThreeGenFixture();
    const allowed = new Set(['GP', 'GP2', 'P1', 'C1']);
    // Root = GP, no ancestors, 0 descendants — but GP2 is spouse and should be pulled in
    const result = computeInitialLazyVisibleIds('GP', pMap, fMap, allowed, 0, 0);
    expect(result.has('GP2')).toBe(true);
  });
});
