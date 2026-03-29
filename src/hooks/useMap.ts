/**
 * useMap — provides map-related derived data (persons with coordinates).
 */
import { useMemo } from 'react';
import { useFamilyData } from './useFamilyData';
import type { Person } from '../types';

export interface MapData {
  /** Persons that have valid lat/lng coordinates */
  mappablePersons: Person[];
  loading: boolean;
  error: string | null;
}

export function useMap(): MapData {
  const { personList, loading, error } = useFamilyData();

  const mappablePersons = useMemo(
    () => personList.filter((p): p is Person & { coordinates: [number, number] } =>
      Array.isArray(p.coordinates) &&
      p.coordinates.length === 2 &&
      typeof p.coordinates[0] === 'number' &&
      typeof p.coordinates[1] === 'number' &&
      p.coordinates[0] >= -90 && p.coordinates[0] <= 90 &&
      p.coordinates[1] >= -180 && p.coordinates[1] <= 180
    ),
    [personList]
  );

  return { mappablePersons, loading, error };
}
