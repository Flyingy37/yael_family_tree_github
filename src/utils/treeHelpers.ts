import type { Person, Family } from '../types';

/**
 * Walks upward from targetId via familyAsChild, collecting the direct
 * ancestor chain: [oldest-known, ..., grandparent, parent, targetId].
 *
 * Uses the first spouse in each family as the "primary parent" for the
 * breadcrumb. Stops after maxDepth steps to prevent infinite loops.
 */
export function getAncestorChain(
  targetId: string,
  personsMap: Map<string, Person>,
  familiesMap: Map<string, Family>,
  maxDepth = 10
): string[] {
  const chain: string[] = [targetId];
  const seen = new Set<string>([targetId]);
  let currentId = targetId;

  for (let i = 0; i < maxDepth; i++) {
    const person = personsMap.get(currentId);
    if (!person?.familyAsChild) break;

    const family = familiesMap.get(person.familyAsChild);
    if (!family || family.spouses.length === 0) break;

    // Primary parent = first spouse listed in the family
    const parentId = family.spouses[0];
    if (seen.has(parentId)) break; // cycle guard

    chain.unshift(parentId);
    seen.add(parentId);
    currentId = parentId;
  }

  return chain;
}

/**
 * Returns all descendant person IDs of the given person (not including startId itself).
 * Traverses through familiesAsSpouse → children recursively.
 */
export function getDescendantIds(
  startId: string,
  personsMap: Map<string, Person>,
  familiesMap: Map<string, Family>
): Set<string> {
  const result = new Set<string>();
  const queue = [startId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const person = personsMap.get(currentId);
    if (!person) continue;

    for (const famId of person.familiesAsSpouse) {
      const family = familiesMap.get(famId);
      if (!family) continue;
      for (const childId of family.children) {
        if (!result.has(childId) && childId !== startId) {
          result.add(childId);
          queue.push(childId);
        }
      }
    }
  }

  return result;
}

/**
 * BFS shortest path between two people through the family graph.
 * Neighbors of a person = spouses, parents, siblings, and children
 * (all relationships reachable through familyAsChild and familiesAsSpouse).
 * Returns ordered array of person IDs on the path, or an empty array if no path exists.
 */
export function findPathBFS(
  startId: string,
  endId: string,
  personsMap: Map<string, Person>,
  familiesMap: Map<string, Family>
): string[] {
  if (startId === endId) return [startId];

  const visited = new Set<string>([startId]);
  const queue: Array<{ id: string; path: string[] }> = [{ id: startId, path: [startId] }];

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    const person = personsMap.get(id);
    if (!person) continue;

    const neighbors: string[] = [];

    // Parents and siblings (via familyAsChild)
    if (person.familyAsChild) {
      const family = familiesMap.get(person.familyAsChild);
      if (family) {
        neighbors.push(...family.spouses);
        neighbors.push(...family.children);
      }
    }

    // Spouses and children (via familiesAsSpouse)
    for (const famId of person.familiesAsSpouse) {
      const family = familiesMap.get(famId);
      if (!family) continue;
      neighbors.push(...family.spouses);
      neighbors.push(...family.children);
    }

    for (const neighborId of neighbors) {
      if (neighborId === id || visited.has(neighborId)) continue;
      const newPath = [...path, neighborId];
      if (neighborId === endId) return newPath;
      visited.add(neighborId);
      queue.push({ id: neighborId, path: newPath });
    }
  }

  return [];
}
