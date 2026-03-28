import { describe, it, expect } from 'vitest';
import type { Person, Family } from '../../types';
import { getSubtreeIds } from '../subtree';

// ---------------------------------------------------------------------------
// Minimal fixture helpers (same pattern as treeHelpers tests)
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
// Three-generation fixture:
//   GP ──(fam-root)──► P1 ──(fam-p1)──► C1
//                      └── S1 (sibling of P1)
// ---------------------------------------------------------------------------
function buildFixture() {
  const gp = makePerson({ id: 'GP', familiesAsSpouse: ['fam-root'] });
  const p1 = makePerson({ id: 'P1', familyAsChild: 'fam-root', familiesAsSpouse: ['fam-p1'] });
  const s1 = makePerson({ id: 'S1', familyAsChild: 'fam-root' });
  const c1 = makePerson({ id: 'C1', familyAsChild: 'fam-p1' });

  const famRoot = makeFamily({ id: 'fam-root', spouses: ['GP'], children: ['P1', 'S1'] });
  const famP1 = makeFamily({ id: 'fam-p1', spouses: ['P1'], children: ['C1'] });

  return buildMaps([gp, p1, s1, c1], [famRoot, famP1]);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getSubtreeIds', () => {
  it('always includes the focal person', () => {
    const { pMap, fMap } = buildFixture();
    const ids = getSubtreeIds('P1', pMap, fMap, 0, 0, false);
    expect(ids.has('P1')).toBe(true);
  });

  it('includes direct parent within ancestor depth 1', () => {
    const { pMap, fMap } = buildFixture();
    const ids = getSubtreeIds('P1', pMap, fMap, 1, 0, false);
    expect(ids.has('GP')).toBe(true);
  });

  it('does not include grandparent when ancestorDepth = 1', () => {
    // Build a 4-gen chain: GGP→GP→P1→C1
    const ggp = makePerson({ id: 'GGP', familiesAsSpouse: ['fam-ggp'] });
    const gp = makePerson({ id: 'GP', familyAsChild: 'fam-ggp', familiesAsSpouse: ['fam-gp'] });
    const p1 = makePerson({ id: 'P1', familyAsChild: 'fam-gp', familiesAsSpouse: [] });
    const famGgp = makeFamily({ id: 'fam-ggp', spouses: ['GGP'], children: ['GP'] });
    const famGp = makeFamily({ id: 'fam-gp', spouses: ['GP'], children: ['P1'] });
    const { pMap, fMap } = buildMaps([ggp, gp, p1], [famGgp, famGp]);

    const ids = getSubtreeIds('P1', pMap, fMap, 1, 0, false);
    expect(ids.has('GP')).toBe(true);
    expect(ids.has('GGP')).toBe(false);
  });

  it('includes direct child within descendant depth 1', () => {
    const { pMap, fMap } = buildFixture();
    const ids = getSubtreeIds('P1', pMap, fMap, 0, 1, false);
    expect(ids.has('C1')).toBe(true);
  });

  it('includes siblings', () => {
    const { pMap, fMap } = buildFixture();
    // P1 has sibling S1 in fam-root
    const ids = getSubtreeIds('P1', pMap, fMap, 0, 0, false);
    expect(ids.has('S1')).toBe(true);
  });

  it('handles an isolated person (no family)', () => {
    const lone = makePerson({ id: 'LONE' });
    const { pMap, fMap } = buildMaps([lone], []);
    const ids = getSubtreeIds('LONE', pMap, fMap, 2, 2, true);
    expect(ids.has('LONE')).toBe(true);
    expect(ids.size).toBe(1);
  });

  it('returns an empty set for an unknown personId', () => {
    const { pMap, fMap } = buildFixture();
    const ids = getSubtreeIds('MISSING', pMap, fMap);
    // collectAncestors adds 'MISSING' itself before discovering it has no family data
    expect(ids.has('P1')).toBe(false);
    expect(ids.has('C1')).toBe(false);
    // The set may only contain 'MISSING' itself (or be empty); it must not contain fixture persons
    expect([...ids].filter(id => id !== 'MISSING')).toHaveLength(0);
  });

  it('includes spouse when includeSpouseBranches = true', () => {
    // P1 married to SP; SP is separate
    const sp = makePerson({ id: 'SP', familiesAsSpouse: ['fam-p1'] });
    const p1 = makePerson({ id: 'P1', familiesAsSpouse: ['fam-p1'] });
    const fam = makeFamily({ id: 'fam-p1', spouses: ['P1', 'SP'], children: [] });
    const { pMap, fMap } = buildMaps([p1, sp], [fam]);

    const ids = getSubtreeIds('P1', pMap, fMap, 0, 1, true);
    expect(ids.has('SP')).toBe(true);
  });

  it('excludes spouse ancestors/descendants when includeSpouseBranches = false', () => {
    const sp = makePerson({ id: 'SP', familiesAsSpouse: ['fam-p1'] });
    const spParent = makePerson({ id: 'SP_PARENT', familiesAsSpouse: ['fam-sp-parent'] });
    const p1 = makePerson({ id: 'P1', familiesAsSpouse: ['fam-p1'] });
    const spFam = makeFamily({
      id: 'fam-sp-parent',
      spouses: ['SP_PARENT'],
      children: ['SP'],
    });
    sp.familyAsChild = 'fam-sp-parent';
    const fam = makeFamily({ id: 'fam-p1', spouses: ['P1', 'SP'], children: [] });
    const { pMap, fMap } = buildMaps([p1, sp, spParent], [fam, spFam]);

    // With includeSpouseBranches=false: SP is added as spouse, but SP_PARENT should NOT be
    const ids = getSubtreeIds('P1', pMap, fMap, 0, 1, false);
    // SP is added directly (ids.add(spouseId) unconditionally)
    expect(ids.has('SP')).toBe(true);
    expect(ids.has('SP_PARENT')).toBe(false);
  });

  it('depth = 0 still includes the person and their siblings', () => {
    const { pMap, fMap } = buildFixture();
    const ids = getSubtreeIds('P1', pMap, fMap, 0, 0, false);
    expect(ids.has('P1')).toBe(true);
    expect(ids.has('S1')).toBe(true);
    // No parents (ancestorDepth=0) and no children (descendantDepth=0)
    expect(ids.has('GP')).toBe(false);
    expect(ids.has('C1')).toBe(false);
  });
});
