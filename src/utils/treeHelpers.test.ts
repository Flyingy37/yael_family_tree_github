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

// ── getAncestorChain ──────────────────────────────────────────────────────────

describe('getAncestorChain', () => {
  it('returns [targetId] when person has no familyAsChild', () => {
    const persons = new Map([['p1', makePerson('p1')]]);
    const families = new Map<string, Family>();
    expect(getAncestorChain('p1', persons, families)).toEqual(['p1']);
  });

  it('returns two-element chain for one parent generation', () => {
    // grandparent ← parent ← child
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f-parent'])],
      ['p', makePerson('p', 'f-parent', ['f-child'])],
      ['c', makePerson('c', 'f-child')],
    ]);
    const families = new Map([
      ['f-parent', makeFamily('f-parent', ['gp'], ['p'])],
      ['f-child', makeFamily('f-child', ['p'], ['c'])],
    ]);
    const chain = getAncestorChain('c', persons, families);
    expect(chain).toEqual(['gp', 'p', 'c']);
  });

  it('respects maxDepth to prevent deep traversal', () => {
    const persons = new Map([
      ['a', makePerson('a', null, ['f-ab'])],
      ['b', makePerson('b', 'f-ab', ['f-bc'])],
      ['c', makePerson('c', 'f-bc', ['f-cd'])],
      ['d', makePerson('d', 'f-cd')],
    ]);
    const families = new Map([
      ['f-ab', makeFamily('f-ab', ['a'], ['b'])],
      ['f-bc', makeFamily('f-bc', ['b'], ['c'])],
      ['f-cd', makeFamily('f-cd', ['c'], ['d'])],
    ]);
    // maxDepth=1: only goes up one generation from d → c
    const chain = getAncestorChain('d', persons, families, 1);
    expect(chain).toEqual(['c', 'd']);
  });

  it('stops when family has no spouses', () => {
    const persons = new Map([
      ['p', makePerson('p', 'f-empty')],
    ]);
    const families = new Map([
      ['f-empty', makeFamily('f-empty', [], ['p'])],
    ]);
    expect(getAncestorChain('p', persons, families)).toEqual(['p']);
  });

  it('returns just the target for an unknown targetId', () => {
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    expect(getAncestorChain('ghost', persons, families)).toEqual(['ghost']);
  });
});

// ── getDescendantIds ──────────────────────────────────────────────────────────

describe('getDescendantIds', () => {
  it('returns empty set for a leaf person', () => {
    const persons = new Map([['p', makePerson('p')]]);
    const families = new Map<string, Family>();
    expect(getDescendantIds('p', persons, families).size).toBe(0);
  });

  it('returns direct children', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['fam1'])],
      ['child1', makePerson('child1')],
      ['child2', makePerson('child2')],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['parent'], ['child1', 'child2'])],
    ]);
    const descendants = getDescendantIds('parent', persons, families);
    expect(descendants).toEqual(new Set(['child1', 'child2']));
  });

  it('returns all generations of descendants', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', null, ['f2'])],
      ['c', makePerson('c')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    const descendants = getDescendantIds('gp', persons, families);
    expect(descendants.has('p')).toBe(true);
    expect(descendants.has('c')).toBe(true);
    expect(descendants.size).toBe(2);
  });

  it('does not include startId itself', () => {
    const persons = new Map([
      ['p', makePerson('p', null, ['fam1'])],
      ['c', makePerson('c')],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['p'], ['c'])],
    ]);
    const descendants = getDescendantIds('p', persons, families);
    expect(descendants.has('p')).toBe(false);
  });
});

// ── countDescendantsMap ───────────────────────────────────────────────────────

describe('countDescendantsMap', () => {
  it('returns zeros for persons with no children', () => {
    const persons = new Map([
      ['a', makePerson('a')],
      ['b', makePerson('b')],
    ]);
    const families = new Map<string, Family>();
    const counts = countDescendantsMap(persons, families);
    expect(counts.get('a')).toBe(0);
    expect(counts.get('b')).toBe(0);
  });

  it('counts one generation correctly', () => {
    const persons = new Map([
      ['p', makePerson('p', null, ['fam1'])],
      ['c1', makePerson('c1')],
      ['c2', makePerson('c2')],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['p'], ['c1', 'c2'])],
    ]);
    const counts = countDescendantsMap(persons, families);
    expect(counts.get('p')).toBe(2);
    expect(counts.get('c1')).toBe(0);
  });

  it('counts two generations correctly', () => {
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', null, ['f2'])],
      ['c', makePerson('c')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    const counts = countDescendantsMap(persons, families);
    // gp → p → c  =  2 descendants for gp
    expect(counts.get('gp')).toBe(2);
    expect(counts.get('p')).toBe(1);
    expect(counts.get('c')).toBe(0);
  });
});

// ── findPathBFS ───────────────────────────────────────────────────────────────

describe('findPathBFS', () => {
  it('returns [startId] when start equals end', () => {
    const persons = new Map([['p', makePerson('p')]]);
    const families = new Map<string, Family>();
    expect(findPathBFS('p', 'p', persons, families)).toEqual(['p']);
  });

  it('returns empty array when no path exists', () => {
    const persons = new Map([
      ['a', makePerson('a')],
      ['b', makePerson('b')],
    ]);
    const families = new Map<string, Family>();
    expect(findPathBFS('a', 'b', persons, families)).toEqual([]);
  });

  it('finds direct parent-child path', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['fam1'])],
      ['child', makePerson('child', 'fam1')],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['parent'], ['child'])],
    ]);
    const path = findPathBFS('parent', 'child', persons, families);
    expect(path).toEqual(['parent', 'child']);
  });

  it('finds sibling path through shared family', () => {
    const persons = new Map([
      ['parent', makePerson('parent', null, ['fam1'])],
      ['sib1', makePerson('sib1', 'fam1')],
      ['sib2', makePerson('sib2', 'fam1')],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['parent'], ['sib1', 'sib2'])],
    ]);
    const path = findPathBFS('sib1', 'sib2', persons, families);
    expect(path[0]).toBe('sib1');
    expect(path[path.length - 1]).toBe('sib2');
    // siblings are both in family.children so BFS reaches sib2 as a direct
    // neighbor of sib1 — path length is 2, not 3
    expect(path.length).toBe(2);
  });

  it('finds multi-hop path across generations', () => {
    // gp → parent → child
    const persons = new Map([
      ['gp', makePerson('gp', null, ['f1'])],
      ['p', makePerson('p', 'f1', ['f2'])],
      ['c', makePerson('c', 'f2')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['gp'], ['p'])],
      ['f2', makeFamily('f2', ['p'], ['c'])],
    ]);
    const path = findPathBFS('gp', 'c', persons, families);
    expect(path[0]).toBe('gp');
    expect(path[path.length - 1]).toBe('c');
    expect(path.length).toBe(3);
  });
});

// ── getNeighborPersonIds ──────────────────────────────────────────────────────

describe('getNeighborPersonIds', () => {
  it('returns empty set for unknown person', () => {
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    expect(getNeighborPersonIds('ghost', persons, families).size).toBe(0);
  });

  it('returns parents and siblings from familyAsChild', () => {
    const persons = new Map([
      ['p', makePerson('p', null, ['f1'])],
      ['sib', makePerson('sib', 'f1')],
      ['c', makePerson('c', 'f1')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['p'], ['sib', 'c'])],
    ]);
    const neighbors = getNeighborPersonIds('sib', persons, families);
    expect(neighbors.has('p')).toBe(true);
    expect(neighbors.has('c')).toBe(true);
    expect(neighbors.has('sib')).toBe(false); // excludes self
  });

  it('returns spouse and children from familiesAsSpouse', () => {
    const persons = new Map([
      ['p1', makePerson('p1', null, ['f1'])],
      ['p2', makePerson('p2', null, ['f1'])],
      ['child', makePerson('child')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['p1', 'p2'], ['child'])],
    ]);
    const neighbors = getNeighborPersonIds('p1', persons, families);
    expect(neighbors.has('p2')).toBe(true);   // spouse
    expect(neighbors.has('child')).toBe(true); // child
    expect(neighbors.has('p1')).toBe(false);   // excludes self
  });
});

// ── addSpousesForVisibleSet ───────────────────────────────────────────────────

describe('addSpousesForVisibleSet', () => {
  it('adds the spouse when they are in allowed and one partner is visible', () => {
    const persons = new Map([
      ['s1', makePerson('s1', null, ['fam1'])],
      ['s2', makePerson('s2', null, ['fam1'])],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['s1', 's2'], [])],
    ]);
    const allowed = new Set(['s1', 's2']);
    const visible = new Set(['s1']);

    addSpousesForVisibleSet(visible, persons, families, allowed);

    expect(visible.has('s2')).toBe(true);
  });

  it('does not add spouse when they are not in allowed', () => {
    const persons = new Map([
      ['s1', makePerson('s1', null, ['fam1'])],
      ['s2', makePerson('s2', null, ['fam1'])],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['s1', 's2'], [])],
    ]);
    const allowed = new Set(['s1']); // s2 NOT allowed
    const visible = new Set(['s1']);

    addSpousesForVisibleSet(visible, persons, families, allowed);

    expect(visible.has('s2')).toBe(false);
  });

  it('handles chain of spouses (transitive closure)', () => {
    // s1 married to s2 (fam1), s2 married to s3 (fam2)
    const persons = new Map([
      ['s1', makePerson('s1', null, ['fam1'])],
      ['s2', makePerson('s2', null, ['fam1', 'fam2'])],
      ['s3', makePerson('s3', null, ['fam2'])],
    ]);
    const families = new Map([
      ['fam1', makeFamily('fam1', ['s1', 's2'], [])],
      ['fam2', makeFamily('fam2', ['s2', 's3'], [])],
    ]);
    const allowed = new Set(['s1', 's2', 's3']);
    const visible = new Set(['s1']);

    addSpousesForVisibleSet(visible, persons, families, allowed);

    expect(visible.has('s2')).toBe(true);
    expect(visible.has('s3')).toBe(true);
  });
});

// ── computeInitialLazyVisibleIds ──────────────────────────────────────────────

describe('computeInitialLazyVisibleIds', () => {
  it('returns empty set when rootId is not in allowed', () => {
    const persons = new Map([['r', makePerson('r')]]);
    const families = new Map<string, Family>();
    const result = computeInitialLazyVisibleIds('r', persons, families, new Set(), 2, 2);
    expect(result.size).toBe(0);
  });

  it('returns just root when no parents or children', () => {
    const persons = new Map([['r', makePerson('r')]]);
    const families = new Map<string, Family>();
    const allowed = new Set(['r']);
    const result = computeInitialLazyVisibleIds('r', persons, families, allowed, 2, 2);
    expect(result).toEqual(new Set(['r']));
  });

  it('includes ancestor generations up to ancestorGens', () => {
    const persons = new Map([
      ['ggp', makePerson('ggp', null, ['f1'])],
      ['gp', makePerson('gp', 'f1', ['f2'])],
      ['p', makePerson('p', 'f2', ['f3'])],
      ['root', makePerson('root', 'f3')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['ggp'], ['gp'])],
      ['f2', makeFamily('f2', ['gp'], ['p'])],
      ['f3', makeFamily('f3', ['p'], ['root'])],
    ]);
    const allowed = new Set(['ggp', 'gp', 'p', 'root']);
    const result = computeInitialLazyVisibleIds('root', persons, families, allowed, 2, 0);
    expect(result.has('root')).toBe(true);
    expect(result.has('p')).toBe(true);
    expect(result.has('gp')).toBe(true);
    // ggp is 3 gens away, beyond limit of 2
    expect(result.has('ggp')).toBe(false);
  });

  it('includes descendant generations up to descendantGens', () => {
    const persons = new Map([
      ['root', makePerson('root', null, ['f1'])],
      ['child', makePerson('child', null, ['f2'])],
      ['grandchild', makePerson('grandchild')],
    ]);
    const families = new Map([
      ['f1', makeFamily('f1', ['root'], ['child'])],
      ['f2', makeFamily('f2', ['child'], ['grandchild'])],
    ]);
    const allowed = new Set(['root', 'child', 'grandchild']);
    const result = computeInitialLazyVisibleIds('root', persons, families, allowed, 0, 1);
    expect(result.has('root')).toBe(true);
    expect(result.has('child')).toBe(true);
    // grandchild is 2 gens away, beyond limit of 1
    expect(result.has('grandchild')).toBe(false);
  });
});
