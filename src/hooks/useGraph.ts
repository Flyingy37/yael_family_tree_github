/**
 * useGraph — thin wrapper around useFamilyData that exposes graph-centric helpers.
 *
 * Returns the same data as useFamilyData plus convenience selectors so that
 * consuming components do not need to import from two places.
 */
import { useMemo } from 'react';
import { useFamilyData, type FamilyData } from './useFamilyData';
import type { Person, Family } from '../types';

export interface GraphData extends FamilyData {
  /** All persons as an array (alias for personList) */
  allPersons: Person[];
  /** All families as an array */
  allFamilies: Family[];
  /** Look up a person by ID — returns undefined if not found */
  getPerson: (id: string) => Person | undefined;
  /** Look up a family by ID — returns undefined if not found */
  getFamily: (id: string) => Family | undefined;
  /** Children of a family */
  getChildren: (familyId: string) => Person[];
  /** Spouses in a family */
  getSpouses: (familyId: string) => Person[];
}

export function useGraph(): GraphData {
  const familyData = useFamilyData();

  const allFamilies = useMemo(
    () => Array.from(familyData.families.values()),
    [familyData.families]
  );

  const getPerson = useMemo(
    () => (id: string) => familyData.persons.get(id),
    [familyData.persons]
  );

  const getFamily = useMemo(
    () => (id: string) => familyData.families.get(id),
    [familyData.families]
  );

  const getChildren = useMemo(
    () => (familyId: string): Person[] => {
      const fam = familyData.families.get(familyId);
      if (!fam) return [];
      return fam.children
        .map(id => familyData.persons.get(id))
        .filter((p): p is Person => p !== undefined);
    },
    [familyData.families, familyData.persons]
  );

  const getSpouses = useMemo(
    () => (familyId: string): Person[] => {
      const fam = familyData.families.get(familyId);
      if (!fam) return [];
      return fam.spouses
        .map(id => familyData.persons.get(id))
        .filter((p): p is Person => p !== undefined);
    },
    [familyData.families, familyData.persons]
  );

  return {
    ...familyData,
    allPersons: familyData.personList,
    allFamilies,
    getPerson,
    getFamily,
    getChildren,
    getSpouses,
  };
}
