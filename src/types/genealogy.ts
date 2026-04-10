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

export type EvidenceType =
  | 'family-photo'
  | 'portrait'
  | 'annotated-photo'
  | 'document-scan'
  | 'testimony'
  | 'video-testimony'
  | 'document'
  | 'dna-clue'
  | 'external-tree-reference';

export type EvidenceConfidence = 'direct' | 'partial' | 'contextual';

export const EVIDENCE_TYPE_ORDER: EvidenceType[] = [
  'family-photo',
  'portrait',
  'annotated-photo',
  'document-scan',
  'testimony',
  'video-testimony',
  'document',
  'dna-clue',
  'external-tree-reference',
];

export interface BranchEvidenceBase {
  id: string;
  type: EvidenceType;
  title: string;
  titleHe?: string;
  description: string;
  descriptionHe?: string;
  source: string;
  confidence: EvidenceConfidence;
  note?: string;
  noteHe?: string;
  personIds?: string[];
}

export interface BranchTextEvidence extends BranchEvidenceBase {
  id: string;
  type: 'testimony' | 'document' | 'dna-clue' | 'external-tree-reference';
}

export type ImageEvidenceItem = {
  id: string;
  type: 'family-photo' | 'portrait' | 'annotated-photo' | 'document-scan';
  title: string;
  titleHe?: string;
  description: string;
  descriptionHe?: string;
  assetPath: string;
  relatedPersonIds?: string[];
  relatedPersonDisplayNames?: string[];
  relatedPlaceIds?: string[];
  year?: number;
  yearApprox?: string;
  source: string;
  confidence: EvidenceConfidence;
  note?: string;
  noteHe?: string;
};

export interface VideoTestimonyEvidence extends BranchEvidenceBase {
  type: 'video-testimony';
  shortTitleHe?: string;
  descriptionHe?: string;
  speakerPersonId: string;
  relatedPersonIds?: string[];
  relatedPlaceIds?: string[];
  topics?: string[];
  url?: string;
  embedUrl?: string;
  transcript?: string;
  language: 'he' | 'en' | 'mixed';
  confidence: EvidenceConfidence;
}

export type BranchEvidenceItem = BranchTextEvidence | ImageEvidenceItem | VideoTestimonyEvidence;

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
