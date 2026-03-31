import type { Person } from '../types';

const MAX_PATHS = 9999;

/**
 * `family-graph.json` should store a positive integer; coerce bad exports (strings, notes) to null.
 */
export function coerceConnectionPathCount(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw < 1) return null;
    return Math.min(Math.trunc(raw), MAX_PATHS);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(n) || n < 1) return null;
    return Math.min(n, MAX_PATHS);
  }
  return null;
}

export function normalizeGraphPerson(person: Person): Person {
  return {
    ...person,
    connectionPathCount: coerceConnectionPathCount(person.connectionPathCount as unknown),
    relationToYaelEn: person.relationToYaelEn ?? null,
    birthPlaceEn: person.birthPlaceEn ?? null,
    migrationInfoEn: person.migrationInfoEn ?? null,
    titleEn: person.titleEn ?? null,
  };
}
