/**
 * dataService — fetches and caches the pre-built family-graph.json.
 *
 * This module provides a low-level fetch helper that the useFamilyData hook
 * wraps with React state management.  Use the hook in components; use this
 * service in non-React contexts (scripts, tests, SSR).
 */
import type { FamilyGraph } from '../types';

const GRAPH_URL = '/family-graph.json';

let _cache: FamilyGraph | null = null;

/**
 * Fetch the family graph JSON.
 * Results are cached in module scope so repeated calls within the same
 * page load are served from memory.
 */
export async function fetchFamilyGraph(
  signal?: AbortSignal
): Promise<FamilyGraph> {
  if (_cache) return _cache;

  const res = await fetch(GRAPH_URL, { signal });
  if (!res.ok) {
    throw new Error(`Failed to load family graph: HTTP ${res.status}`);
  }
  const data: FamilyGraph = await res.json();
  _cache = data;
  return data;
}

/** Invalidate the module-level cache (useful in tests or after hot reload) */
export function invalidateCache(): void {
  _cache = null;
}
