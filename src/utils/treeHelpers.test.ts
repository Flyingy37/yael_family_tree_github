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

// ── getAncestorChain ─────────────────────────────────────────────────────────

describe('getAncestorChain', () => {
  it('returns only the target when person has no parents', () => {
    const persons = new Map([['p1', makePerson('p1')]]);
    const families = new Map<string, Family>();
    expect(getAncestorChain('p1', persons, families)).toEqual(['p1']);
  });

  it('returns a 3-generation ancestor chain', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    expect(getAncestorChain('c', persons, families)).toEqual(['gp', 'p', 'c']);
  });

  it('respects maxDepth limit', () => {
    const persons = new Map([
      ['a', makePerson('a', null, ['f1'])],
      ['b', makePerson('b', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2', ['f3'])],
      ['d', makePerson('d', 'f3')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['a'], ['b'])],
      ['f2', makeFamily('f2', ['b'], ['c'])],
      ['f3', makeFamily('f3', ['c'], ['d'])],
    ]);
    // maxDepth=1 → only one ancestor hop from 'd'
    expect(getAncestorChain('d', persons, families, 1)).toEqual(['c', 'd']);
  });

  it('guards against cycles in ancestor chain', () => {
    // Create a cycle: A is child of F1 whose spouse is B, B is child of F2 whose spouse is A
    const persons = new Map([
      ['A', makePerson('A', 'f2')],
      ['B', makePerson('B', 'f1')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['A'], ['B'])],
      ['f2', makeFamily('f2', ['B'], ['A'])],
    ]);
    const chain = getAncestorChain('A', persons, families);
    // Should terminate without infinite loop; each id appears at most once
    const unique = new Set(chain);
    expect(unique.size).toBe(chain.length);
  });

  it('stops when family is missing from map', () => {
    const persons = new Map([['p', makePerson('p', 'ghost_fam')]]);
    const families = new Map<string, Family>();
    expect(getAncestorChain('p', persons, families)).toEqual(['p']);
  });

  it('stops when family has no spouses', () => {
    const persons = new Map([['p', makePerson('p', 'f1')]]);
    const families = new Map([['f1', makeFamily('f1', [], ['p'])]]);
    expect(getAncestorChain('p', persons, families)).toEqual(['p']);
  });
});

// ── getDescendantIds ─────────────────────────────────────────────────────────

describe('getDescendantIds', () => {
  it('returns empty set when person has no children', () => {
    const persons = new Map([['p1', makePerson('p1')]]);
    const families = new Map<string, Family>();
    expect(getDescendantIds('p1', persons, families).size).toBe(0);
  });

  it('returns a single child', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['f1'])],
      ['child', makePerson('child', 'f1')],
    ]);
    const families = new Map([['f1', makeFamily('f1', ['parent'], ['child'])]]);
    const desc = getDescendantIds('parent', persons, families);
    expect(desc).toEqual(new Set(['child']));
  });

  it('returns multi-generation descendants', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    expect(getDescendantIds('gp', persons, families)).toEqual(new Set(['p', 'c']));
  });

  it('collects children from multiple families', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['f1', 'f2'])],
      ['c1', makePerson('c1', 'f1')],
      ['c2', makePerson('c2', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['parent'], ['c1'])],
      ['f2', makeFamily('f2', ['parent'], ['c2'])],
    ]);
    expect(getDescendantIds('parent', persons, families)).toEqual(new Set(['c1', 'c2']));
  });

  it('returns empty set when startId is not in map', () => {
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    expect(getDescendantIds('ghost', persons, families).size).toBe(0);
  });

  it('does not include the startId in results', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['f1'])],
      ['child', makePerson('child', 'f1')],
    ]);
    const families = new Map([['f1', makeFamily('f1', ['parent'], ['child'])]]);
    const desc = getDescendantIds('parent', persons, families);
    expect(desc.has('parent')).toBe(false);
  });
});

// ── countDescendantsMap ──────────────────────────────────────────────────────

describe('countDescendantsMap', () => {
  it('returns empty map for empty inputs', () => {
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    expect(countDescendantsMap(persons, families).size).toBe(0);
  });

  it('returns 0 for a single person with no descendants', () => {
    const persons = new Map([['p1', makePerson('p1')]]);
    const families = new Map<string, Family>();
    const counts = countDescendantsMap(persons, families);
    expect(counts.get('p1')).toBe(0);
  });

  it('counts a linear chain correctly (grandparent→parent→child)', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    const counts = countDescendantsMap(persons, families);
    expect(counts.get('gp')).toBe(2); // p + c
    expect(counts.get('p')).toBe(1);  // c
    expect(counts.get('c')).toBe(0);
  });

  it('counts a branching tree correctly', () => {
    const persons = new Map([
      ['root', makePerson('root', null, ['f1'])],
      ['c1', makePerson('c1', 'f1', ['f2'])],
      ['c2', makePerson('c2', 'f1')],
      ['gc1', makePerson('gc1', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['root'], ['c1', 'c2'])],
      ['f2', makeFamily('f2', ['c1'], ['gc1'])],
    ]);
    const counts = countDescendantsMap(persons, families);
    expect(counts.get('root')).toBe(3); // c1 + c2 + gc1
    expect(counts.get('c1')).toBe(1);   // gc1
    expect(counts.get('c2')).toBe(0);
    expect(counts.get('gc1')).toBe(0);
  });

  it('handles cycles gracefully via memoization', () => {
    // A→B→A cycle via families
    const persons = new Map([
      ['A', makePerson('A', null, ['f1'])],
      ['B', makePerson('B', 'f1', ['f2'])],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['A'], ['B'])],
      ['f2', makeFamily('f2', ['B'], ['A'])],
    ]);
    // Should not hang; memoization breaks the cycle
    const counts = countDescendantsMap(persons, families);
    expect(counts.has('A')).toBe(true);
    expect(counts.has('B')).toBe(true);
  });
});

// ── findPathBFS ──────────────────────────────────────────────────────────────

describe('findPathBFS', () => {
  it('returns single-element path when start equals end', () => {
    const persons = new Map([['p1', makePerson('p1')]]);
    const families = new Map<string, Family>();
    expect(findPathBFS('p1', 'p1', persons, families)).toEqual(['p1']);
  });

  it('finds direct parent-child path', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['f1'])],
      ['child', makePerson('child', 'f1')],
    ]);
    const families = new Map([['f1', makeFamily('f1', ['parent'], ['child'])]]);
    const path = findPathBFS('parent', 'child', persons, families);
    expect(path).toEqual(['parent', 'child']);
  });

  it('finds sibling path through shared family', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['f1'])],
      ['sib1', makePerson('sib1', 'f1')],
      ['sib2', makePerson('sib2', 'f1')],
    ]);
    const families = new Map([['f1', makeFamily('f1', ['parent'], ['sib1', 'sib2'])]]);
    const path = findPathBFS('sib1', 'sib2', persons, families);
    // sib1 → parent → sib2  OR  sib1 → sib2 (siblings share familyAsChild)
    expect(path.length).toBeGreaterThanOrEqual(2);
    expect(path[0]).toBe('sib1');
    expect(path[path.length - 1]).toBe('sib2');
  });

  it('returns empty array when no path exists', () => {
    const persons = new Map([
      ['A', makePerson('A')],
      ['B', makePerson('B')],
    ]);
    const families = new Map<string, Family>();
    expect(findPathBFS('A', 'B', persons, families)).toEqual([]);
  });

  it('returns empty array when person is not in map', () => {
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    expect(findPathBFS('ghost', 'other', persons, families)).toEqual([]);
  });

  it('finds multi-hop path', () => {
    const persons = new Map([
      ['A', makePerson('A', null, ['f1'])],
      ['B', makePerson('B', 'f1', ['f2'])],
      ['C', makePerson('C', 'f2', ['f3'])],
      ['D', makePerson('D', 'f3')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['A'], ['B'])],
      ['f2', makeFamily('f2', ['B'], ['C'])],
      ['f3', makeFamily('f3', ['C'], ['D'])],
    ]);
    const path = findPathBFS('A', 'D', persons, families);
    expect(path[0]).toBe('A');
    expect(path[path.length - 1]).toBe('D');
    expect(path.length).toBeLessThanOrEqual(4);
  });

  it('finds path through spouse relationship', () => {
    const persons = new Map([
      ['s1', makePerson('s1', null, ['f1'])],
      ['s2', makePerson('s2', null, ['f1'])],
      ['child', makePerson('child', 'f1')],
    ]);
    const families = new Map([['f1', makeFamily('f1', ['s1', 's2'], ['child'])]]);
    const path = findPathBFS('s1', 's2', persons, families);
    expect(path[0]).toBe('s1');
    expect(path[path.length - 1]).toBe('s2');
  });
});

// ── getNeighborPersonIds ─────────────────────────────────────────────────────

describe('getNeighborPersonIds', () => {
  it('returns empty set when person is not in map', () => {
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    expect(getNeighborPersonIds('ghost', persons, families).size).toBe(0);
  });

  it('returns parents and siblings from familyAsChild', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['f1'])],
      ['sib1', makePerson('sib1', 'f1')],
      ['sib2', makePerson('sib2', 'f1')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['parent'], ['sib1', 'sib2'])],
    ]);
    const neighbors = getNeighborPersonIds('sib1', persons, families);
    expect(neighbors.has('parent')).toBe(true);
    expect(neighbors.has('sib2')).toBe(true);
    expect(neighbors.has('sib1')).toBe(false);
  });

  it('returns spouse and children from familiesAsSpouse', () => {
    const persons = new Map([
      ['s1', makePerson('s1', null, ['f1'])],
      ['s2', makePerson('s2', null, ['f1'])],
      ['child', makePerson('child', 'f1')],
    ]);
    const families = new Map([['f1', makeFamily('f1', ['s1', 's2'], ['child'])]]);
    const neighbors = getNeighborPersonIds('s1', persons, families);
    expect(neighbors.has('s2')).toBe(true);
    expect(neighbors.has('child')).toBe(true);
    expect(neighbors.has('s1')).toBe(false);
  });

  it('combines all relationships', () => {
    // person 'P' has a parent family and is a spouse in another family
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['P', makePerson('P', 'f1', ['f2'])],
      ['sib', makePerson('sib', 'f1')],
      ['spouse', makePerson('spouse', null, ['f2'])],
      ['child', makePerson('child', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['P', 'sib'])],
      ['f2', makeFamily('f2', ['P', 'spouse'], ['child'])],
    ]);
    const neighbors = getNeighborPersonIds('P', persons, families);
    expect(neighbors).toEqual(new Set(['gp', 'sib', 'spouse', 'child']));
  });

  it('returns empty set for person with no families', () => {
    const persons = new Map([['loner', makePerson('loner')]]);
    const families = new Map<string, Family>();
    expect(getNeighborPersonIds('loner', persons, families).size).toBe(0);
  });
});

// ── addSpousesForVisibleSet ──────────────────────────────────────────────────

describe('addSpousesForVisibleSet', () => {
  it('does nothing when there are no spouses to add', () => {
    const persons = new Map([['p1', makePerson('p1')]]);
    const families = new Map<string, Family>();
    const visible = new Set(['p1']);
    const allowed = new Set(['p1']);
    addSpousesForVisibleSet(visible, persons, families, allowed);
    expect(visible).toEqual(new Set(['p1']));
  });

  it('adds direct spouse', () => {
    const persons = new Map([
      ['s1', makePerson('s1', null, ['f1'])],
      ['s2', makePerson('s2', null, ['f1'])],
    ]);
    const families = new Map([['f1', makeFamily('f1', ['s1', 's2'], [])]]);
    const visible = new Set(['s1']);
    const allowed = new Set(['s1', 's2']);
    addSpousesForVisibleSet(visible, persons, families, allowed);
    expect(visible.has('s2')).toBe(true);
  });

  it('adds chained spouses (A married B, B married C via different family)', () => {
    const persons = new Map([
      ['A', makePerson('A', null, ['f1'])],
      ['B', makePerson('B', null, ['f1', 'f2'])],
      ['C', makePerson('C', null, ['f2'])],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['A', 'B'], [])],
      ['f2', makeFamily('f2', ['B', 'C'], [])],
    ]);
    const visible = new Set(['A']);
    const allowed = new Set(['A', 'B', 'C']);
    addSpousesForVisibleSet(visible, persons, families, allowed);
    expect(visible).toEqual(new Set(['A', 'B', 'C']));
  });

  it('respects allowed set', () => {
    const persons = new Map([
      ['s1', makePerson('s1', null, ['f1'])],
      ['s2', makePerson('s2', null, ['f1'])],
    ]);
    const families = new Map([['f1', makeFamily('f1', ['s1', 's2'], [])]]);
    const visible = new Set(['s1']);
    const allowed = new Set(['s1']); // s2 NOT allowed
    addSpousesForVisibleSet(visible, persons, families, allowed);
    expect(visible.has('s2')).toBe(false);
  });

  it('does not add self as spouse', () => {
    // Family with only one spouse listed
    const persons = new Map([['s1', makePerson('s1', null, ['f1'])]]);
    const families = new Map([['f1', makeFamily('f1', ['s1'], [])]]);
    const visible = new Set(['s1']);
    const allowed = new Set(['s1']);
    addSpousesForVisibleSet(visible, persons, families, allowed);
    expect(visible.size).toBe(1);
  });

  it('does not add already-visible spouses again (idempotent)', () => {
    const persons = new Map([
      ['s1', makePerson('s1', null, ['f1'])],
      ['s2', makePerson('s2', null, ['f1'])],
    ]);
    const families = new Map([['f1', makeFamily('f1', ['s1', 's2'], [])]]);
    const visible = new Set(['s1', 's2']);
    const allowed = new Set(['s1', 's2']);
    addSpousesForVisibleSet(visible, persons, families, allowed);
    expect(visible.size).toBe(2);
  });
});

// ── computeInitialLazyVisibleIds ─────────────────────────────────────────────

describe('computeInitialLazyVisibleIds', () => {
  it('returns empty set when rootId is not in allowed', () => {
    const persons = new Map([['r', makePerson('r')]]);
    const families = new Map<string, Family>();
    const allowed = new Set<string>(); // root not allowed
    const result = computeInitialLazyVisibleIds('r', persons, families, allowed, 2, 2);
    expect(result.size).toBe(0);
  });

  it('returns empty set when rootId is not in personsMap', () => {
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    const allowed = new Set(['r']);
    const result = computeInitialLazyVisibleIds('r', persons, families, allowed, 2, 2);
    expect(result.size).toBe(0);
  });

  it('collects ancestors up to ancestorGens', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    const allowed = new Set(['gp', 'p', 'c']);
    // From 'c', 1 ancestor gen → should include 'p' but not 'gp'
    const result = computeInitialLazyVisibleIds('c', persons, families, allowed, 1, 0);
    expect(result.has('c')).toBe(true);
    expect(result.has('p')).toBe(true);
    expect(result.has('gp')).toBe(false);
  });

  it('collects descendants up to descendantGens', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    const allowed = new Set(['gp', 'p', 'c']);
    // From 'gp', 1 descendant gen → should include 'p' but not 'c'
    const result = computeInitialLazyVisibleIds('gp', persons, families, allowed, 0, 1);
    expect(result.has('gp')).toBe(true);
    expect(result.has('p')).toBe(true);
    expect(result.has('c')).toBe(false);
  });

  it('includes spouse closure', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['f1'])],
      ['spouse', makePerson('spouse', null, ['f1'])],
      ['child', makePerson('child', 'f1')],
    ]);
    const families = new Map([['f1', makeFamily('f1', ['parent', 'spouse'], ['child'])]]);
    const allowed = new Set(['parent', 'spouse', 'child']);
    // From 'child', 1 ancestor gen → parent, then spouse via addSpousesForVisibleSet
    const result = computeInitialLazyVisibleIds('child', persons, families, allowed, 1, 0);
    expect(result.has('child')).toBe(true);
    expect(result.has('parent')).toBe(true);
    expect(result.has('spouse')).toBe(true);
  });

  it('returns only root when ancestorGens=0 and descendantGens=0 (plus spouse closure)', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    const allowed = new Set(['gp', 'p', 'c']);
    const result = computeInitialLazyVisibleIds('p', persons, families, allowed, 0, 0);
    // Only root 'p', plus spouse closure (no spouse here)
    expect(result.has('p')).toBe(true);
    expect(result.has('gp')).toBe(false);
    expect(result.has('c')).toBe(false);
  });

  it('handles full expansion with both ancestor and descendant gens', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    const allowed = new Set(['gp', 'p', 'c']);
    const result = computeInitialLazyVisibleIds('p', persons, families, allowed, 5, 5);
    expect(result).toEqual(new Set(['gp', 'p', 'c']));
  });

  it('skips ancestors not in allowed set', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    const allowed = new Set(['p', 'c']); // gp NOT allowed
    const result = computeInitialLazyVisibleIds('c', persons, families, allowed, 5, 0);
    expect(result.has('c')).toBe(true);
    expect(result.has('p')).toBe(true);
    expect(result.has('gp')).toBe(false);
  });

  it('skips descendants not in allowed set', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    const allowed = new Set(['gp', 'p']); // c NOT allowed
    const result = computeInitialLazyVisibleIds('gp', persons, families, allowed, 0, 5);
    expect(result.has('gp')).toBe(true);
    expect(result.has('p')).toBe(true);
    expect(result.has('c')).toBe(false);
  });
});
