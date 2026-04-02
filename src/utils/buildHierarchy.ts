import type { Person, Family } from '../types';

/**
 * A node in the D3-compatible hierarchy tree.
 * Wraps a Person with a `children` array for recursive tree structures.
 */
export interface HierarchyNode extends Person {
  children: HierarchyNode[];
}

/**
 * Converts a flat persons/families graph into a hierarchical tree rooted
 * at `rootId`, suitable for D3 tree layouts.
 *
 * Each person becomes a `HierarchyNode` whose `children` array contains
 * their biological children (resolved through Family relationships).
 * Spouses are **not** included as children — only actual child members
 * of each family appear in the hierarchy.
 *
 * Returns `undefined` when `rootId` is not present in `personsMap`.
 */
export function buildHierarchy(
  personsMap: Map<string, Person>,
  familiesMap: Map<string, Family>,
  rootId: string
): HierarchyNode | undefined {
  // Build lookup of fresh HierarchyNode wrappers so the original map is not mutated.
  const nodeMap = new Map<string, HierarchyNode>();
  for (const [id, person] of personsMap) {
    nodeMap.set(id, { ...person, children: [] });
  }

  // Wire parent → child edges through families.
  for (const family of familiesMap.values()) {
    for (const parentId of family.spouses) {
      const parentNode = nodeMap.get(parentId);
      if (!parentNode) continue;
      for (const childId of family.children) {
        const childNode = nodeMap.get(childId);
        if (childNode) {
          parentNode.children.push(childNode);
        }
      }
    }
  }

  return nodeMap.get(rootId);
}
