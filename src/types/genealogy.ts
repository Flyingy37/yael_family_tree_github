/**
 * Genealogy domain types — Person, Family, and related interfaces.
 * These types mirror the shape emitted by scripts/build-graph.ts.
 * The canonical source is src/types.ts; re-exported here for module path consistency.
 */
export type { Person, Family, FamilyGraph } from '../types';

export type GenealogyClaim = {
  id: string;
  type: 'identity' | 'parent' | 'spouse' | 'maternal-line' | 'sibling-status' | 'branch-context';
  subjectId: string;
  objectId?: string;
  value?: string;
  evidenceIds: string[];
  confidence: 'direct' | 'partial' | 'conflicting';
  note?: string;
};

export type ImageEvidenceItem = {
  id: string;
  type: 'family-photo' | 'portrait' | 'annotated-photo' | 'document-scan';
  title: string;
  description: string;
  assetPath: string;
  relatedPersonIds?: string[];
  relatedPersonDisplayNames?: string[];
  relatedPlaceIds?: string[];
  year?: number;
  yearApprox?: string;
  source: string;
  confidence: 'direct' | 'partial' | 'contextual';
  note?: string;
};

/** Relationship category labels used in curated CSV */
export type RelationshipCategory =
  | 'direct'
  | 'sibling'
  | 'cousin'
  | 'in-law'
  | 'step'
  | 'unknown';

/** Compact summary used by statistics panels */
export interface PersonSummary {
  id: string;
  fullName: string;
  generation: number | null;
  birthYear: number | null;
  deathYear: number | null;
  birthCountry: string | null;
  sex: 'M' | 'F' | 'U';
}
