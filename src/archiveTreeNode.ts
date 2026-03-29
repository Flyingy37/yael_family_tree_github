/** Narrative archive tree node (GEDCOM-style fields + optional flags used in notes/cards). */
export type ArchiveTreeNode = {
  id: string;
  name: string;
  note?: string;
  /** Long-form narrative; shown in a modal (source footer appended in UI). */
  story?: string;
  birth?: string;
  birthPlace?: string;
  children?: ArchiveTreeNode[];
  isDNAVerified?: boolean;
  isResearchTarget?: boolean;
  isSurvivor?: boolean;
  isVictim?: boolean;
  isHero?: boolean;
  /** Prominent “story card” affordance (e.g. Mary / Rachel-Leah Fine). */
  highlightStoryCard?: boolean;
  [key: string]: unknown;
};
