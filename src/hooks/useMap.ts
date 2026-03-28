/**
 * useMap — provides map-related derived data (persons with coordinates).
 */
import { useMemo } from 'react';
import { useFamilyData } from './useFamilyData';
import type { Person, BirthplaceLocation } from '../types';

export interface MapData {
  /** Persons that have valid lat/lng coordinates */
  mappablePersons: Person[];
  /** Persons organised by birthplace for birthplace-centric map rendering */
  birthplaceLocations: BirthplaceLocation[];
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

  const birthplaceLocations = useMemo(() => {
    const locationMap = new Map<string, BirthplaceLocation>();
    for (const person of personList) {
      if (!person.birthPlace) continue;
      const personCoords = person.birthplaceCoordinates ?? person.coordinates ?? null;
      if (!locationMap.has(person.birthPlace)) {
        locationMap.set(person.birthPlace, {
          birthplace: person.birthPlace,
          coordinates: personCoords,
          persons: [],
          personCount: 0,
        });
      }
      const loc = locationMap.get(person.birthPlace)!;
      // Update coordinates if we now have them for this birthplace
      if (!loc.coordinates) loc.coordinates = personCoords;
      loc.persons.push(person);
      loc.personCount++;
    }
    return Array.from(locationMap.values());
  }, [personList]);

  return { mappablePersons, birthplaceLocations, loading, error };
}
