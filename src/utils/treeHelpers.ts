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
 * Counts total descendants (all generations) for every person in the map.
 * Returns Map<personId, count>. Memoised via DFS so each node is visited once.
 */
export function countDescendantsMap(
  personsMap: Map<string, Person>,
  familiesMap: Map<string, Family>
): Map<string, number> {
  const memo = new Map<string, number>();

  function dfs(id: string): number {
    if (memo.has(id)) return memo.get(id)!;
    memo.set(id, 0); // guard against cycles
    const person = personsMap.get(id);
    if (!person) return 0;
    let total = 0;
    for (const famId of person.familiesAsSpouse) {
      const fam = familiesMap.get(famId);
      if (!fam) continue;
      for (const childId of fam.children) {
        total += 1 + dfs(childId);
      }
    }
    memo.set(id, total);
    return total;
  }

  for (const id of personsMap.keys()) dfs(id);
  return memo;
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

/**
 * All graph neighbors of a person: parents, siblings, children, spouses
 * (same adjacency as findPathBFS).
 */
export function getNeighborPersonIds(
  personId: string,
  personsMap: Map<string, Person>,
  familiesMap: Map<string, Family>
): Set<string> {
  const out = new Set<string>();
  const person = personsMap.get(personId);
  if (!person) return out;

  if (person.familyAsChild) {
    const family = familiesMap.get(person.familyAsChild);
    if (family) {
      for (const id of family.spouses) {
        if (id !== personId) out.add(id);
      }
      for (const id of family.children) {
        if (id !== personId) out.add(id);
      }
    }
  }

  for (const famId of person.familiesAsSpouse) {
    const family = familiesMap.get(famId);
    if (!family) continue;
    for (const id of family.spouses) {
      if (id !== personId) out.add(id);
    }
    for (const id of family.children) {
      if (id !== personId) out.add(id);
    }
  }

  return out;
}

/**
 * Mutates `visible`: adds any spouse (same family unit) that appears in `allowed`.
 * Repeats until closure stable so both partners of a marriage stay visible together.
 */
export function addSpousesForVisibleSet(
  visible: Set<string>,
  personsMap: Map<string, Person>,
  familiesMap: Map<string, Family>,
  allowed: Set<string>
): void {
  let changed = true;
  while (changed) {
    changed = false;
    const snapshot = [...visible];
    for (const id of snapshot) {
      const p = personsMap.get(id);
      if (!p) continue;
      for (const famId of p.familiesAsSpouse) {
        const fam = familiesMap.get(famId);
        if (!fam) continue;
        for (const sid of fam.spouses) {
          if (sid !== id && allowed.has(sid) && !visible.has(sid)) {
            visible.add(sid);
            changed = true;
          }
        }
      }
    }
  }
}

/**
 * Starting subset for lazy tree: root, up to `ancestorGens` parent generations,
 * up to `descendantGens` child generations, then spouse closure within `allowed`.
 */
export function computeInitialLazyVisibleIds(
  rootId: string,
  personsMap: Map<string, Person>,
  familiesMap: Map<string, Family>,
  allowed: Set<string>,
  ancestorGens: number,
  descendantGens: number
): Set<string> {
  const out = new Set<string>();
  if (!allowed.has(rootId) || !personsMap.has(rootId)) return out;
  out.add(rootId);

  let frontier = [rootId];
  for (let g = 0; g < ancestorGens; g++) {
    const next: string[] = [];
    for (const id of frontier) {
      const p = personsMap.get(id);
      if (!p?.familyAsChild) continue;
      const fam = familiesMap.get(p.familyAsChild);
      if (!fam) continue;
      for (const pid of fam.spouses) {
        if (allowed.has(pid) && !out.has(pid)) {
          out.add(pid);
          next.push(pid);
        }
      }
    }
    frontier = next;
  }

  frontier = [rootId];
  for (let g = 0; g < descendantGens; g++) {
    const next: string[] = [];
    for (const id of frontier) {
      const p = personsMap.get(id);
      if (!p) continue;
      for (const famId of p.familiesAsSpouse) {
        const fam = familiesMap.get(famId);
        if (!fam) continue;
        for (const cid of fam.children) {
          if (allowed.has(cid) && !out.has(cid)) {
            out.add(cid);
            next.push(cid);
          }
        }
      }
    }
    frontier = next;
  }

  addSpousesForVisibleSet(out, personsMap, familiesMap, allowed);
  return out;
}
