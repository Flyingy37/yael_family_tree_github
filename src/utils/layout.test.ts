import { describe, it, expect } from 'vitest';
import { computeLayout, NODE_WIDTH, NODE_HEIGHT } from './layout';
import type { Person, Family } from '../types';

/** Minimal Person factory – only the fields computeLayout reads */
function makePerson(id: string, overrides?: Partial<Person>): Person {
  return {
    id,
    fullName: `Person ${id}`,
    givenName: 'Given',
    surname: 'Surname',
    surnameFinal: 'Surname',
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

describe('computeLayout', () => {
  it('returns empty result for empty inputs', () => {
    const persons = new Map<string, Person>();
    const families = new Map<string, Family>();
    const filtered = new Set<string>();

    const { nodes, edges } = computeLayout(persons, families, filtered);
    expect(nodes).toEqual([]);
    expect(edges).toEqual([]);
  });

  it('returns a single node for one person with no families', () => {
    const p = makePerson('@I1@');
    const persons = new Map([['@I1@', p]]);
    const families = new Map<string, Family>();
    const filtered = new Set(['@I1@']);

    const { nodes, edges } = computeLayout(persons, families, filtered);
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
    expect(nodes[0].id).toBe('@I1@');
    expect(nodes[0].type).toBe('person');
    expect(nodes[0].data).toBe(p);
    expect(nodes[0].width).toBe(NODE_WIDTH);
    expect(nodes[0].height).toBe(NODE_HEIGHT);
  });

  it('creates spouse edges when two visible spouses exist', () => {
    const p1 = makePerson('@I1@', { familiesAsSpouse: ['@F1@'] });
    const p2 = makePerson('@I2@', { familiesAsSpouse: ['@F1@'] });
    const fam = makeFamily('@F1@', ['@I1@', '@I2@'], []);
    const persons = new Map([['@I1@', p1], ['@I2@', p2]]);
    const families = new Map([['@F1@', fam]]);
    const filtered = new Set(['@I1@', '@I2@']);

    const { nodes, edges } = computeLayout(persons, families, filtered);
    expect(nodes).toHaveLength(2);
    const spouseEdges = edges.filter(e => e.type === 'spouse');
    expect(spouseEdges).toHaveLength(1);
    expect(spouseEdges[0].id).toBe('spouse-@F1@');
  });

  it('does NOT create spouse edge when only one spouse is visible', () => {
    const p1 = makePerson('@I1@', { familiesAsSpouse: ['@F1@'] });
    const p2 = makePerson('@I2@', { familiesAsSpouse: ['@F1@'] });
    const fam = makeFamily('@F1@', ['@I1@', '@I2@'], []);
    const persons = new Map([['@I1@', p1], ['@I2@', p2]]);
    const families = new Map([['@F1@', fam]]);
    const filtered = new Set(['@I1@']); // only one spouse visible

    const { edges } = computeLayout(persons, families, filtered);
    const spouseEdges = edges.filter(e => e.type === 'spouse');
    expect(spouseEdges).toHaveLength(0);
  });

  it('creates parent-child edges when parents and children are visible', () => {
    const parent = makePerson('@I1@', { familiesAsSpouse: ['@F1@'] });
    const child = makePerson('@I2@', { familyAsChild: '@F1@' });
    const fam = makeFamily('@F1@', ['@I1@'], ['@I2@']);
    const persons = new Map([['@I1@', parent], ['@I2@', child]]);
    const families = new Map([['@F1@', fam]]);
    const filtered = new Set(['@I1@', '@I2@']);

    const { edges } = computeLayout(persons, families, filtered);
    const childEdges = edges.filter(e => e.type === 'parent-child');
    expect(childEdges).toHaveLength(1);
    expect(childEdges[0].source).toBe('@I1@');
    expect(childEdges[0].target).toBe('@I2@');
    expect(childEdges[0].familyId).toBe('@F1@');
  });

  it('creates edges for multiple children', () => {
    const parent = makePerson('@I1@', { familiesAsSpouse: ['@F1@'] });
    const child1 = makePerson('@I2@', { familyAsChild: '@F1@' });
    const child2 = makePerson('@I3@', { familyAsChild: '@F1@' });
    const fam = makeFamily('@F1@', ['@I1@'], ['@I2@', '@I3@']);
    const persons = new Map([['@I1@', parent], ['@I2@', child1], ['@I3@', child2]]);
    const families = new Map([['@F1@', fam]]);
    const filtered = new Set(['@I1@', '@I2@', '@I3@']);

    const { edges } = computeLayout(persons, families, filtered);
    const childEdges = edges.filter(e => e.type === 'parent-child');
    expect(childEdges).toHaveLength(2);
  });

  it('does NOT create child edges when children are not in filteredPersonIds', () => {
    const parent = makePerson('@I1@', { familiesAsSpouse: ['@F1@'] });
    const child = makePerson('@I2@', { familyAsChild: '@F1@' });
    const fam = makeFamily('@F1@', ['@I1@'], ['@I2@']);
    const persons = new Map([['@I1@', parent], ['@I2@', child]]);
    const families = new Map([['@F1@', fam]]);
    const filtered = new Set(['@I1@']); // child not visible

    const { edges } = computeLayout(persons, families, filtered);
    const childEdges = edges.filter(e => e.type === 'parent-child');
    expect(childEdges).toHaveLength(0);
  });

  it('positions nodes with valid numeric x/y coordinates', () => {
    const p1 = makePerson('@I1@', { familiesAsSpouse: ['@F1@'] });
    const p2 = makePerson('@I2@', { familyAsChild: '@F1@' });
    const fam = makeFamily('@F1@', ['@I1@'], ['@I2@']);
    const persons = new Map([['@I1@', p1], ['@I2@', p2]]);
    const families = new Map([['@F1@', fam]]);
    const filtered = new Set(['@I1@', '@I2@']);

    const { nodes } = computeLayout(persons, families, filtered);
    for (const node of nodes) {
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    }
  });

  it('parent node is above child node (lower y value in TB layout)', () => {
    const parent = makePerson('@I1@', { familiesAsSpouse: ['@F1@'] });
    const child = makePerson('@I2@', { familyAsChild: '@F1@' });
    const fam = makeFamily('@F1@', ['@I1@'], ['@I2@']);
    const persons = new Map([['@I1@', parent], ['@I2@', child]]);
    const families = new Map([['@F1@', fam]]);
    const filtered = new Set(['@I1@', '@I2@']);

    const { nodes } = computeLayout(persons, families, filtered);
    const parentNode = nodes.find(n => n.id === '@I1@')!;
    const childNode = nodes.find(n => n.id === '@I2@')!;
    expect(parentNode.y).toBeLessThan(childNode.y);
  });

  it('excludes virtual family nodes from output', () => {
    const parent = makePerson('@I1@', { familiesAsSpouse: ['@F1@'] });
    const child = makePerson('@I2@', { familyAsChild: '@F1@' });
    const fam = makeFamily('@F1@', ['@I1@'], ['@I2@']);
    const persons = new Map([['@I1@', parent], ['@I2@', child]]);
    const families = new Map([['@F1@', fam]]);
    const filtered = new Set(['@I1@', '@I2@']);

    const { nodes } = computeLayout(persons, families, filtered);
    // All nodes should be person type, no virtual nodes
    expect(nodes.every(n => n.type === 'person')).toBe(true);
    // No virtual node IDs in output
    expect(nodes.every(n => !n.id.startsWith('fam-'))).toBe(true);
  });

  it('handles a three-generation family', () => {
    const grandparent = makePerson('@I1@', { familiesAsSpouse: ['@F1@'] });
    const parent = makePerson('@I2@', { familyAsChild: '@F1@', familiesAsSpouse: ['@F2@'] });
    const child = makePerson('@I3@', { familyAsChild: '@F2@' });
    const fam1 = makeFamily('@F1@', ['@I1@'], ['@I2@']);
    const fam2 = makeFamily('@F2@', ['@I2@'], ['@I3@']);
    const persons = new Map([['@I1@', grandparent], ['@I2@', parent], ['@I3@', child]]);
    const families = new Map([['@F1@', fam1], ['@F2@', fam2]]);
    const filtered = new Set(['@I1@', '@I2@', '@I3@']);

    const { nodes, edges } = computeLayout(persons, families, filtered);
    expect(nodes).toHaveLength(3);
    const childEdges = edges.filter(e => e.type === 'parent-child');
    expect(childEdges).toHaveLength(2);

    // Verify generational ordering
    const gpNode = nodes.find(n => n.id === '@I1@')!;
    const pNode = nodes.find(n => n.id === '@I2@')!;
    const cNode = nodes.find(n => n.id === '@I3@')!;
    expect(gpNode.y).toBeLessThan(pNode.y);
    expect(pNode.y).toBeLessThan(cNode.y);
  });

  it('skips persons in filteredIds that are not in the persons map', () => {
    const p = makePerson('@I1@');
    const persons = new Map([['@I1@', p]]);
    const families = new Map<string, Family>();
    const filtered = new Set(['@I1@', '@I_MISSING@']);

    const { nodes } = computeLayout(persons, families, filtered);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('@I1@');
  });

  it('produces deterministic output regardless of insertion order', () => {
    const p1 = makePerson('@I1@', { familiesAsSpouse: ['@F1@'] });
    const p2 = makePerson('@I2@', { familiesAsSpouse: ['@F1@'] });
    const p3 = makePerson('@I3@', { familyAsChild: '@F1@' });
    const fam = makeFamily('@F1@', ['@I1@', '@I2@'], ['@I3@']);

    // Order A
    const personsA = new Map([['@I1@', p1], ['@I2@', p2], ['@I3@', p3]]);
    const familiesA = new Map([['@F1@', fam]]);
    const filteredA = new Set(['@I1@', '@I2@', '@I3@']);
    const resultA = computeLayout(personsA, familiesA, filteredA);

    // Order B (reversed)
    const personsB = new Map([['@I3@', p3], ['@I2@', p2], ['@I1@', p1]]);
    const familiesB = new Map([['@F1@', fam]]);
    const filteredB = new Set(['@I3@', '@I2@', '@I1@']);
    const resultB = computeLayout(personsB, familiesB, filteredB);

    // Node positions should be identical
    for (const nodeA of resultA.nodes) {
      const nodeB = resultB.nodes.find(n => n.id === nodeA.id)!;
      expect(nodeA.x).toBe(nodeB.x);
      expect(nodeA.y).toBe(nodeB.y);
    }

    // Edge sets should be identical
    const edgeIdsA = resultA.edges.map(e => e.id).sort();
    const edgeIdsB = resultB.edges.map(e => e.id).sort();
    expect(edgeIdsA).toEqual(edgeIdsB);
  });

  it('creates both spouse and parent-child edges in a full family', () => {
    const husband = makePerson('@I1@', { familiesAsSpouse: ['@F1@'] });
    const wife = makePerson('@I2@', { familiesAsSpouse: ['@F1@'] });
    const child = makePerson('@I3@', { familyAsChild: '@F1@' });
    const fam = makeFamily('@F1@', ['@I1@', '@I2@'], ['@I3@']);
    const persons = new Map([['@I1@', husband], ['@I2@', wife], ['@I3@', child]]);
    const families = new Map([['@F1@', fam]]);
    const filtered = new Set(['@I1@', '@I2@', '@I3@']);

    const { edges } = computeLayout(persons, families, filtered);
    expect(edges.filter(e => e.type === 'spouse')).toHaveLength(1);
    expect(edges.filter(e => e.type === 'parent-child')).toHaveLength(1);
  });
});

describe('NODE_WIDTH / NODE_HEIGHT constants', () => {
  it('NODE_WIDTH is 200', () => {
    expect(NODE_WIDTH).toBe(200);
  });

  it('NODE_HEIGHT is 220', () => {
    expect(NODE_HEIGHT).toBe(220);
  });
});
