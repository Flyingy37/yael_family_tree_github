/**
 * Graph types for ReactFlow visualisation.
 * NodeData / EdgeData carry the domain-specific payload attached to each
 * ReactFlow node and edge in TreeView.
 */
import type { Person, Family } from './genealogy';

/** Data attached to a person node in the ReactFlow tree */
export interface PersonNodeData {
  person: Person;
  isRoot: boolean;
  isHighlighted: boolean;
  isCollapsed: boolean;
  generation: number | null;
}

/** Data attached to a family (couple) node in the ReactFlow tree */
export interface FamilyNodeData {
  family: Family;
  spouses: Person[];
}

/** Union type for all node data variants */
export type NodeData = PersonNodeData | FamilyNodeData;

/** Extra payload on ReactFlow edges (currently minimal) */
export interface EdgeData {
  relationLabel?: string;
}

/** Lookup maps built from FamilyGraph for O(1) access */
export interface GraphMaps {
  persons: Map<string, Person>;
  families: Map<string, Family>;
  rootPersonId: string;
}
