import type { Person, Family } from '../types';

/**
 * Collect ancestors and descendants of a person up to a given depth.
 */
export function getSubtreeIds(
  personId: string,
  persons: Map<string, Person>,
  families: Map<string, Family>,
  ancestorDepth: number = 4,
  descendantDepth: number = 4
): Set<string> {
  const ids = new Set<string>();

  // BFS ancestors
  function collectAncestors(id: string, depth: number) {
    if (depth < 0 || ids.has(id)) return;
    ids.add(id);
    const person = persons.get(id);
    if (!person?.familyAsChild) return;
    const family = families.get(person.familyAsChild);
    if (!family) return;
    // Add spouse connections of parents
    for (const parentId of family.spouses) {
      collectAncestors(parentId, depth - 1);
    }
  }

  // BFS descendants
  function collectDescendants(id: string, depth: number) {
    if (depth < 0 || ids.has(id)) return;
    ids.add(id);
    const person = persons.get(id);
    if (!person) return;
    for (const famId of person.familiesAsSpouse) {
      const family = families.get(famId);
      if (!family) continue;
      // Add spouse
      for (const spouseId of family.spouses) {
        if (!ids.has(spouseId)) ids.add(spouseId);
      }
      // Add children
      for (const childId of family.children) {
        collectDescendants(childId, depth - 1);
      }
    }
  }

  collectAncestors(personId, ancestorDepth);
  // Reset to allow descendant traversal from root
  const ancestorIds = new Set(ids);
  collectDescendants(personId, descendantDepth);

  // Also collect siblings
  const person = persons.get(personId);
  if (person?.familyAsChild) {
    const family = families.get(person.familyAsChild);
    if (family) {
      for (const sibId of family.children) {
        ids.add(sibId);
      }
    }
  }

  return ids;
}
