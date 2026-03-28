import { describe, it, expect } from 'vitest';
import type { Person, Family } from '../../types';
import { computeLayout, NODE_WIDTH, NODE_HEIGHT } from '../layout';

// ---------------------------------------------------------------------------
// Minimal fixture helpers
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
// Tests
// ---------------------------------------------------------------------------

describe('NODE_WIDTH / NODE_HEIGHT constants', () => {
  it('exports positive non-zero dimensions', () => {
    expect(NODE_WIDTH).toBeGreaterThan(0);
    expect(NODE_HEIGHT).toBeGreaterThan(0);
  });
});

describe('computeLayout', () => {
  it('returns empty nodes and edges for an empty filteredPersonIds set', () => {
    const { pMap, fMap } = buildMaps([], []);
    const { nodes, edges } = computeLayout(pMap, fMap, new Set());
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });

  it('returns a single node for a single person', () => {
    const p = makePerson({ id: 'A' });
    const { pMap, fMap } = buildMaps([p], []);
    const { nodes, edges } = computeLayout(pMap, fMap, new Set(['A']));
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('A');
    expect(edges).toHaveLength(0);
  });

  it('assigns correct NODE_WIDTH and NODE_HEIGHT to each node', () => {
    const p = makePerson({ id: 'A' });
    const { pMap, fMap } = buildMaps([p], []);
    const { nodes } = computeLayout(pMap, fMap, new Set(['A']));
    expect(nodes[0].width).toBe(NODE_WIDTH);
    expect(nodes[0].height).toBe(NODE_HEIGHT);
  });

  it('attaches the Person data to the node', () => {
    const p = makePerson({ id: 'A', fullName: 'Alice' });
    const { pMap, fMap } = buildMaps([p], []);
    const { nodes } = computeLayout(pMap, fMap, new Set(['A']));
    expect(nodes[0].data.fullName).toBe('Alice');
  });

  it('sets node type to "person"', () => {
    const p = makePerson({ id: 'A' });
    const { pMap, fMap } = buildMaps([p], []);
    const { nodes } = computeLayout(pMap, fMap, new Set(['A']));
    expect(nodes[0].type).toBe('person');
  });

  it('produces a spouse edge between two spouses in the same family', () => {
    const a = makePerson({ id: 'A', familiesAsSpouse: ['fam1'] });
    const b = makePerson({ id: 'B', familiesAsSpouse: ['fam1'] });
    const fam = makeFamily({ id: 'fam1', spouses: ['A', 'B'], children: [] });
    const { pMap, fMap } = buildMaps([a, b], [fam]);
    const { edges } = computeLayout(pMap, fMap, new Set(['A', 'B']));
    const spouseEdge = edges.find(e => e.type === 'spouse');
    expect(spouseEdge).toBeDefined();
    expect([spouseEdge!.source, spouseEdge!.target].sort()).toEqual(['A', 'B']);
  });

  it('does not produce a spouse edge when only one spouse is visible', () => {
    const a = makePerson({ id: 'A', familiesAsSpouse: ['fam1'] });
    const b = makePerson({ id: 'B', familiesAsSpouse: ['fam1'] });
    const fam = makeFamily({ id: 'fam1', spouses: ['A', 'B'], children: [] });
    const { pMap, fMap } = buildMaps([a, b], [fam]);
    // Only A is filtered in
    const { edges } = computeLayout(pMap, fMap, new Set(['A']));
    expect(edges.filter(e => e.type === 'spouse')).toHaveLength(0);
  });

  it('produces parent-child edges', () => {
    const parent = makePerson({ id: 'PAR', familiesAsSpouse: ['fam1'] });
    const child = makePerson({ id: 'CHI', familyAsChild: 'fam1' });
    const fam = makeFamily({ id: 'fam1', spouses: ['PAR'], children: ['CHI'] });
    const { pMap, fMap } = buildMaps([parent, child], [fam]);
    const { edges } = computeLayout(pMap, fMap, new Set(['PAR', 'CHI']));
    const pcEdge = edges.find(e => e.type === 'parent-child');
    expect(pcEdge).toBeDefined();
    expect(pcEdge!.source).toBe('PAR');
    expect(pcEdge!.target).toBe('CHI');
    expect(pcEdge!.familyId).toBe('fam1');
  });

  it('excludes persons not in filteredPersonIds', () => {
    const a = makePerson({ id: 'A' });
    const b = makePerson({ id: 'B' });
    const { pMap, fMap } = buildMaps([a, b], []);
    // Only A is filtered
    const { nodes } = computeLayout(pMap, fMap, new Set(['A']));
    expect(nodes.map(n => n.id)).not.toContain('B');
  });

  it('produces numeric x and y coordinates for laid-out nodes', () => {
    const parent = makePerson({ id: 'PAR', familiesAsSpouse: ['fam1'] });
    const child = makePerson({ id: 'CHI', familyAsChild: 'fam1' });
    const fam = makeFamily({ id: 'fam1', spouses: ['PAR'], children: ['CHI'] });
    const { pMap, fMap } = buildMaps([parent, child], [fam]);
    const { nodes } = computeLayout(pMap, fMap, new Set(['PAR', 'CHI']));
    for (const node of nodes) {
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
    }
  });

  it('is deterministic: same inputs produce the same output', () => {
    const a = makePerson({ id: 'A', familiesAsSpouse: ['fam1'] });
    const b = makePerson({ id: 'B', familiesAsSpouse: ['fam1'] });
    const c = makePerson({ id: 'C', familyAsChild: 'fam1' });
    const fam = makeFamily({ id: 'fam1', spouses: ['A', 'B'], children: ['C'] });
    const { pMap, fMap } = buildMaps([a, b, c], [fam]);
    const filtered = new Set(['A', 'B', 'C']);
    const result1 = computeLayout(pMap, fMap, filtered);
    const result2 = computeLayout(pMap, fMap, filtered);
    const xById1 = Object.fromEntries(result1.nodes.map(n => [n.id, n.x]));
    const xById2 = Object.fromEntries(result2.nodes.map(n => [n.id, n.x]));
    expect(xById1).toEqual(xById2);
  });
});
