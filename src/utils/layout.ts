import dagre from '@dagrejs/dagre';
import type { Person, Family } from '../types';

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'person';
  data: Person;
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  type: 'parent-child' | 'spouse';
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 70;

export function computeLayout(
  persons: Map<string, Person>,
  families: Map<string, Family>,
  filteredPersonIds: Set<string>
): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB',
    nodesep: 40,
    ranksep: 100,
    edgesep: 20,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Add person nodes
  for (const personId of filteredPersonIds) {
    const person = persons.get(personId);
    if (!person) continue;
    g.setNode(personId, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  const edges: LayoutEdge[] = [];

  // Add edges from family relationships
  for (const [famId, family] of families) {
    const visibleSpouses = family.spouses.filter(id => filteredPersonIds.has(id));
    const visibleChildren = family.children.filter(id => filteredPersonIds.has(id));

    // Spouse edges (horizontal connection)
    if (visibleSpouses.length === 2) {
      const edgeId = `spouse-${famId}`;
      edges.push({
        id: edgeId,
        source: visibleSpouses[0],
        target: visibleSpouses[1],
        type: 'spouse',
      });
    }

    // Create a virtual family node to connect parents to children
    if (visibleSpouses.length > 0 && visibleChildren.length > 0) {
      const virtualId = `fam-${famId}`;
      g.setNode(virtualId, { width: 1, height: 1 });

      // Connect first spouse (or both) to family node
      for (const spouseId of visibleSpouses) {
        g.setEdge(spouseId, virtualId);
      }

      // Connect family node to children
      for (const childId of visibleChildren) {
        g.setEdge(virtualId, childId);
        edges.push({
          id: `child-${famId}-${childId}`,
          source: visibleSpouses[0],
          target: childId,
          type: 'parent-child',
        });
      }
    } else if (visibleChildren.length > 0) {
      // No visible parents, but children exist - just add children as standalone
    }
  }

  // Run dagre layout
  dagre.layout(g);

  // Extract positioned nodes (only person nodes, skip virtual)
  const nodes: LayoutNode[] = [];
  for (const personId of filteredPersonIds) {
    const person = persons.get(personId);
    const nodeData = g.node(personId);
    if (!person || !nodeData) continue;
    nodes.push({
      id: personId,
      x: nodeData.x - NODE_WIDTH / 2,
      y: nodeData.y - NODE_HEIGHT / 2,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      type: 'person',
      data: person,
    });
  }

  return { nodes, edges };
}
