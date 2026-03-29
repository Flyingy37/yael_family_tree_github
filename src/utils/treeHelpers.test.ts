import { describe, it, expect } from 'vitest';
import type { Person, Family } from '../types';
import {
  getAncestorChain,
  getDescendantIds,
  countDescendantsMap,
  findPathBFS,
  getNeighborPersonIds,
  addSpousesForVisibleSet,
  computeInitialLazyVisibleIds,
} from './treeHelpers';

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

function persons(...ps: Person[]): Map<string, Person> {
  return new Map(ps.map(p => [p.id, p]));
}

function families(...fs: Family[]): Map<string, Family> {
  return new Map(fs.map(f => [f.id, f]));
}

// ---------------------------------------------------------------------------
// Three-generation linear family used in several tests:
//   grandparent (GP) --fam1-- parent (P) --fam2-- child (C) --fam3-- grandchild (GC)
// ---------------------------------------------------------------------------
const GP = makePerson('GP', { familiesAsSpouse: ['fam1'] });
const P = makePerson('P', { familyAsChild: 'fam1', familiesAsSpouse: ['fam2'] });
const C = makePerson('C', { familyAsChild: 'fam2', familiesAsSpouse: ['fam3'] });
const GC = makePerson('GC', { familyAsChild: 'fam3' });
const fam1 = makeFamily('fam1', ['GP'], [P.id]);
const fam2 = makeFamily('fam2', ['P'], [C.id]);
const fam3 = makeFamily('fam3', ['C'], [GC.id]);
const linearPersons = persons(GP, P, C, GC);
const linearFamilies = families(fam1, fam2, fam3);

// ---------------------------------------------------------------------------
// getAncestorChain
// ---------------------------------------------------------------------------
describe('getAncestorChain', () => {
  it('returns [self] when person has no family as child', () => {
    expect(getAncestorChain('GP', linearPersons, linearFamilies)).toEqual(['GP']);
  });

  it('builds chain [GP, P] for a single-generation ascent', () => {
    expect(getAncestorChain('P', linearPersons, linearFamilies)).toEqual(['GP', 'P']);
  });

  it('builds chain [GP, P, C] for a two-generation ascent', () => {
    expect(getAncestorChain('C', linearPersons, linearFamilies)).toEqual(['GP', 'P', 'C']);
  });

  it('respects maxDepth limit', () => {
    // With maxDepth=1 from GC we should only see one ancestor then stop
    const chain = getAncestorChain('GC', linearPersons, linearFamilies, 1);
    expect(chain).toEqual(['C', 'GC']);
  });

  it('returns just [targetId] for an unknown id', () => {
    expect(getAncestorChain('UNKNOWN', linearPersons, linearFamilies)).toEqual(['UNKNOWN']);
  });

  it('handles a cycle guard (no infinite loop)', () => {
    // Create a cycle: A is child of famCycle, famCycle has A as both spouse and child.
    const A = makePerson('A', { familyAsChild: 'famCycle', familiesAsSpouse: ['famCycle'] });
    const famCycle = makeFamily('famCycle', ['A'], ['A']);
    const chain = getAncestorChain('A', persons(A), families(famCycle));
    // Should terminate; A appears once
    expect(chain.filter(x => x === 'A').length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getDescendantIds
// ---------------------------------------------------------------------------
describe('getDescendantIds', () => {
  it('returns all descendants', () => {
    const desc = getDescendantIds('GP', linearPersons, linearFamilies);
    expect(desc.has('P')).toBe(true);
    expect(desc.has('C')).toBe(true);
    expect(desc.has('GC')).toBe(true);
  });

  it('does not include the start person', () => {
    const desc = getDescendantIds('GP', linearPersons, linearFamilies);
    expect(desc.has('GP')).toBe(false);
  });

  it('returns empty set for a leaf node', () => {
    const desc = getDescendantIds('GC', linearPersons, linearFamilies);
    expect(desc.size).toBe(0);
  });

  it('returns empty set for unknown id', () => {
    const desc = getDescendantIds('UNKNOWN', linearPersons, linearFamilies);
    expect(desc.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// countDescendantsMap
// ---------------------------------------------------------------------------
describe('countDescendantsMap', () => {
  it('returns correct descendant counts for each node', () => {
    const counts = countDescendantsMap(linearPersons, linearFamilies);
    expect(counts.get('GP')).toBe(3); // P, C, GC
    expect(counts.get('P')).toBe(2);  // C, GC
    expect(counts.get('C')).toBe(1);  // GC
    expect(counts.get('GC')).toBe(0);
  });

  it('returns 0 for every person when no children exist', () => {
    const soloPersons = persons(
      makePerson('A'),
      makePerson('B'),
    );
    const counts = countDescendantsMap(soloPersons, families());
    for (const count of counts.values()) {
      expect(count).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// findPathBFS
// ---------------------------------------------------------------------------
describe('findPathBFS', () => {
  it('returns [id] when start === end', () => {
    expect(findPathBFS('GP', 'GP', linearPersons, linearFamilies)).toEqual(['GP']);
  });

  it('finds a direct path between grandparent and grandchild', () => {
    const path = findPathBFS('GP', 'GC', linearPersons, linearFamilies);
    expect(path[0]).toBe('GP');
    expect(path[path.length - 1]).toBe('GC');
    expect(path.length).toBeGreaterThan(1);
  });

  it('finds a path upward from child to grandparent', () => {
    const path = findPathBFS('GC', 'GP', linearPersons, linearFamilies);
    expect(path[0]).toBe('GC');
    expect(path[path.length - 1]).toBe('GP');
  });

  it('returns empty array when no path exists', () => {
    const isolated = makePerson('X');
    const path = findPathBFS('GP', 'X', persons(...[GP, P, isolated]), linearFamilies);
    expect(path).toEqual([]);
  });

  it('finds path between siblings', () => {
    // A and B are siblings sharing fam-s
    const S1 = makePerson('S1', { familyAsChild: 'famS' });
    const S2 = makePerson('S2', { familyAsChild: 'famS' });
    const parent = makePerson('PA', { familiesAsSpouse: ['famS'] });
    const famS = makeFamily('famS', ['PA'], ['S1', 'S2']);
    const path = findPathBFS('S1', 'S2', persons(S1, S2, parent), families(famS));
    expect(path[0]).toBe('S1');
    expect(path[path.length - 1]).toBe('S2');
  });
});

// ---------------------------------------------------------------------------
// getNeighborPersonIds
// ---------------------------------------------------------------------------
describe('getNeighborPersonIds', () => {
  it('returns parents and siblings as neighbors (via familyAsChild)', () => {
    // P's familyAsChild = fam1; fam1.spouses = [GP], fam1.children = [P]
    // So neighbors should include GP (parent), and P itself is excluded
    const neighbors = getNeighborPersonIds('P', linearPersons, linearFamilies);
    expect(neighbors.has('GP')).toBe(true);
  });

  it('returns children as neighbors (via familiesAsSpouse)', () => {
    const neighbors = getNeighborPersonIds('P', linearPersons, linearFamilies);
    expect(neighbors.has('C')).toBe(true);
  });

  it('does not include self in neighbors', () => {
    const neighbors = getNeighborPersonIds('P', linearPersons, linearFamilies);
    expect(neighbors.has('P')).toBe(false);
  });

  it('returns empty set for unknown id', () => {
    const neighbors = getNeighborPersonIds('UNKNOWN', linearPersons, linearFamilies);
    expect(neighbors.size).toBe(0);
  });

  it('includes spouses as neighbors', () => {
    const H = makePerson('H', { familiesAsSpouse: ['famM'] });
    const W = makePerson('W', { familiesAsSpouse: ['famM'] });
    const famM = makeFamily('famM', ['H', 'W'], []);
    const neighbors = getNeighborPersonIds('H', persons(H, W), families(famM));
    expect(neighbors.has('W')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// addSpousesForVisibleSet
// ---------------------------------------------------------------------------
describe('addSpousesForVisibleSet', () => {
  it('adds a spouse that is in allowed but not yet in visible', () => {
    const H = makePerson('H', { familiesAsSpouse: ['famM'] });
    const W = makePerson('W', { familiesAsSpouse: ['famM'] });
    const famM = makeFamily('famM', ['H', 'W'], []);
    const visible = new Set<string>(['H']);
    const allowed = new Set<string>(['H', 'W']);
    addSpousesForVisibleSet(visible, persons(H, W), families(famM), allowed);
    expect(visible.has('W')).toBe(true);
  });

  it('does not add a spouse that is not in allowed', () => {
    const H = makePerson('H', { familiesAsSpouse: ['famM'] });
    const W = makePerson('W', { familiesAsSpouse: ['famM'] });
    const famM = makeFamily('famM', ['H', 'W'], []);
    const visible = new Set<string>(['H']);
    const allowed = new Set<string>(['H']); // W not in allowed
    addSpousesForVisibleSet(visible, persons(H, W), families(famM), allowed);
    expect(visible.has('W')).toBe(false);
  });

  it('is idempotent when spouses already visible', () => {
    const H = makePerson('H', { familiesAsSpouse: ['famM'] });
    const W = makePerson('W', { familiesAsSpouse: ['famM'] });
    const famM = makeFamily('famM', ['H', 'W'], []);
    const visible = new Set<string>(['H', 'W']);
    const allowed = new Set<string>(['H', 'W']);
    addSpousesForVisibleSet(visible, persons(H, W), families(famM), allowed);
    expect(visible.size).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// computeInitialLazyVisibleIds
// ---------------------------------------------------------------------------
describe('computeInitialLazyVisibleIds', () => {
  it('returns empty set when rootId is not in allowed', () => {
    const allowed = new Set<string>(); // rootId absent
    const result = computeInitialLazyVisibleIds(
      'GP', linearPersons, linearFamilies, allowed, 2, 2
    );
    expect(result.size).toBe(0);
  });

  it('includes root when rootId is in allowed', () => {
    const allowed = new Set(linearPersons.keys());
    const result = computeInitialLazyVisibleIds(
      'GP', linearPersons, linearFamilies, allowed, 0, 0
    );
    expect(result.has('GP')).toBe(true);
  });

  it('includes ancestors up to ancestorGens', () => {
    const allowed = new Set(linearPersons.keys());
    const result = computeInitialLazyVisibleIds(
      'C', linearPersons, linearFamilies, allowed, 1, 0
    );
    expect(result.has('P')).toBe(true);   // one generation up
    expect(result.has('GP')).toBe(false); // two generations up – excluded
  });

  it('includes descendants up to descendantGens', () => {
    const allowed = new Set(linearPersons.keys());
    const result = computeInitialLazyVisibleIds(
      'P', linearPersons, linearFamilies, allowed, 0, 1
    );
    expect(result.has('C')).toBe(true);   // one generation down
    expect(result.has('GC')).toBe(false); // two generations down – excluded
  });

  it('applies spouse closure within allowed set', () => {
    const H = makePerson('H', { familiesAsSpouse: ['famM'] });
    const W = makePerson('W', { familiesAsSpouse: ['famM'] });
    const famM = makeFamily('famM', ['H', 'W'], []);
    const allowed = new Set(['H', 'W']);
    const result = computeInitialLazyVisibleIds(
      'H', persons(H, W), families(famM), allowed, 0, 0
    );
    expect(result.has('W')).toBe(true);
  });
});
