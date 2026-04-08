import { describe, expect, it } from 'vitest';
import type { Person } from '../types';
import { formatDateConcise } from '../utils/formatters';
import {
  getCanonicalGinzburgLiandresDisplayName,
  getGinzburgLiandresAliases,
  getGinzburgLiandresBranchSummary,
  getGinzburgLiandresDisplayProfile,
} from './ginzburgLiandres';

function person(overrides: Partial<Person>): Person {
  return {
    id: '@T1@',
    fullName: 'Test Person',
    givenName: 'Test',
    surname: 'Test',
    surnameFinal: 'Test',
    sex: 'F',
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
    story: null,
    ...overrides,
  };
}

describe('formatDateConcise', () => {
  it('formats full GEDCOM dates year-first', () => {
    expect(formatDateConcise('18 APR 1926')).toBe('1926-04-18');
  });

  it('formats qualified dates concisely', () => {
    expect(formatDateConcise('ABT 1950')).toBe('c. 1950');
    expect(formatDateConcise('AFT 1888')).toBe('> 1888');
  });
});

describe('ginzburgLiandres helpers', () => {
  it('returns canonical display name for Basia Liandres', () => {
    const basia = person({
      id: '@I87@',
      fullName: 'Basia (Liandres) Ginzburg',
      givenName: 'Basia',
      surname: 'Liandres',
      surnameFinal: 'Ginzburg',
      birthDate: '1868',
    });

    expect(getCanonicalGinzburgLiandresDisplayName(basia)).toBe('Basia Liandres');
    expect(getGinzburgLiandresAliases(basia)).toContain('Bashete Ginzburg');
  });

  it('deduplicates full-name alias variants after normalization', () => {
    const basia = person({
      id: '@I87@',
      fullName: 'Basya Lyandres',
      givenName: 'Bashete',
      surname: 'Lyandres',
      surnameFinal: 'Ginzburg',
      birthName: 'Basia Liandres',
    });

    const aliases = getGinzburgLiandresAliases(basia);
    expect(aliases).toContain('Basya Lyandres');
    expect(aliases).not.toContain('Basia Liandres');
  });

  it('keeps maiden and married surnames explicit for branch profiles', () => {
    const eti = person({
      id: '@I203@',
      fullName: 'Eti Ginzburg-Charny',
      givenName: 'Eti',
      surname: 'Ginzburg',
      surnameFinal: 'Charny',
      birthDate: '1 JAN 1930',
    });

    const profile = getGinzburgLiandresDisplayProfile(eti);
    expect(profile?.birthSurname).toBe('Ginzburg');
    expect(profile?.marriedSurname).toBe('Charny');
    expect(profile?.conciseBirthDate).toBe('1930-01-01');
  });

  it('exposes the branch summary relationship correction for Eti', () => {
    const summary = getGinzburgLiandresBranchSummary();
    expect(summary.relationshipSummary.some((line) => line.includes('Eti'))).toBe(true);
  });
});
