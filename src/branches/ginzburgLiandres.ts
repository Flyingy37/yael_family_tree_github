import type { Person } from '../types';
import { formatDateConcise, formatLifespan } from '../utils/formatters';

export type EvidenceType =
  | 'family-photo'
  | 'testimony'
  | 'document'
  | 'dna-clue'
  | 'external-tree-reference';

export type EvidenceConfidence = 'direct' | 'partial' | 'contextual';

export const EVIDENCE_TYPE_ORDER: EvidenceType[] = [
  'family-photo',
  'testimony',
  'document',
  'dna-clue',
  'external-tree-reference',
];

export interface BranchEvidenceItem {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  source: string;
  confidence: EvidenceConfidence;
  note?: string;
  personIds: string[];
}

export interface BranchRelationshipNote {
  id: string;
  title: string;
  detail: string;
  personIds: string[];
}

export interface BranchPersonDisplayProfile {
  personId: string;
  canonicalDisplayName: string;
  aliases: string[];
  primarySurname: string | null;
  birthSurname: string | null;
  marriedSurname: string | null;
  conciseBirthDate: string;
  conciseDeathDate: string;
  conciseLifespan: string;
  identityWarnings: string[];
}

export interface BranchRelationshipOverlay {
  personId: string;
  relationshipChips: string[];
  notes: string[];
}

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

export interface BranchVirtualPerson {
  id: string;
  canonicalDisplayName: string;
  aliases: string[];
  note: string;
}

type BranchPersonConfig = {
  canonicalDisplayName: string;
  aliases?: string[];
  birthSurname?: string | null;
  marriedSurname?: string | null;
  primarySurname?: string | null;
  identityWarnings?: string[];
};

const BRANCH_PERSON_CONFIG: Record<string, BranchPersonConfig> = {
  '@I86@': {
    canonicalDisplayName: 'Arie-Leib Ginzburg',
    aliases: ['Arie Leib Ginzburg', 'Arie-Leib Ginsburg', 'Arie-Leib Ginzberg'],
    primarySurname: 'Ginzburg',
  },
  '@I87@': {
    canonicalDisplayName: 'Basia Liandres',
    aliases: ['Basia Ginzburg', 'Bashete Ginzburg', 'Basya Liandres', 'Bashete Liandres', 'Basia Landres', 'Basia Lyandres'],
    birthSurname: 'Liandres',
    marriedSurname: 'Ginzburg',
    primarySurname: 'Liandres',
  },
  '@I37@': {
    canonicalDisplayName: 'Sofia Ginzburg Duberstein',
    aliases: ['Sofia Duberstein', 'Sofia (Ginzburg) Duberstein'],
    birthSurname: 'Ginzburg',
    marriedSurname: 'Duberstein',
    primarySurname: 'Ginzburg',
  },
  '@I36@': {
    canonicalDisplayName: 'Vladimir Reuvenovich Duberstein',
    aliases: ['Vladimir Duberstein', 'Vladimir Duberstein (Duberstein)'],
    primarySurname: 'Duberstein',
  },
  '@I12@': {
    canonicalDisplayName: 'Tzila Cilia Duberstein Alperovitz',
    aliases: ['Cilia Sara Cipora Duberstein', 'Cilia Duberstein', 'Tzila Duberstein', 'Cilia Sara Duberstein Alperovitch'],
    birthSurname: 'Duberstein',
    marriedSurname: 'Alperovitz',
    primarySurname: 'Duberstein',
  },
  '@I58@': {
    canonicalDisplayName: 'Ruve Roman Duberstein',
    aliases: ['Ruven Duberstein', 'Ruve Duberstein', 'Roman Duberstein'],
    primarySurname: 'Duberstein',
    identityWarnings: ['Current graph may under-specify this identity; display layer merges Ruve/Ruven/Roman variants for this branch.'],
  },
  '@I59@': {
    canonicalDisplayName: 'Michael Duberstein',
    aliases: [],
    primarySurname: 'Duberstein',
  },
  '@I60@': {
    canonicalDisplayName: 'Valentina "Valia" Duberstein',
    aliases: ['Valia Axelrod', 'Valia Duberstein', 'Valentina Duberstein', 'Vala Duberstein'],
    birthSurname: 'Duberstein',
    marriedSurname: 'Axelrod',
    primarySurname: 'Duberstein',
  },
  '@I131@': {
    canonicalDisplayName: 'Aharon Ginzburg',
    aliases: ['Ore Ginzburg'],
    primarySurname: 'Ginzburg',
    identityWarnings: ['Raw record currently uses variants that may collapse Aharon/Ore; branch display keeps Aharon as canonical.'],
  },
  '@I132@': {
    canonicalDisplayName: 'Gershon (Grigory) Ginzburg',
    aliases: ['Gershon Ginzburg', 'Grigory Ginzburg'],
    primarySurname: 'Ginzburg',
  },
  '@I133@': {
    canonicalDisplayName: 'Yankel Berl Ginzburg',
    aliases: ['Berl Ginzburg', 'Yankel Ginzburg'],
    primarySurname: 'Ginzburg',
  },
  '@I134@': {
    canonicalDisplayName: 'Isaak Ginzburg',
    aliases: ['Iche Ginzburg'],
    primarySurname: 'Ginzburg',
  },
  '@I203@': {
    canonicalDisplayName: 'Eti Ginzburg Charny',
    aliases: ['Eti Ginzburg-Charny', 'Eti Charny'],
    birthSurname: 'Ginzburg',
    marriedSurname: 'Charny',
    primarySurname: 'Ginzburg',
  },
};

const BRANCH_ALIAS_RULES = [
  ['ginzburg', 'ginsburg', 'ginzberg'],
  ['liandres', 'lyandres', 'landres', 'lianders'],
  ['cilia', 'tzila'],
  ['valentina', 'valia', 'vala'],
  ['ruve', 'ruven', 'roman'],
  ['gershon', 'grigory'],
  ['yehuda', 'yuri'],
  ['basia', 'basya', 'bashete'],
] as const;

export const GINZBURG_LIANDRES_BRANCH_SUMMARY = {
  id: 'ginzburg-liandres',
  title: 'Ginzburg-Liandres',
  intro:
    'Branch package focused on the Ginzburg-Liandres maternal line, emphasizing canonical English display names, alias control, and evidence-first relationship notes.',
  rootCouple: {
    husbandId: '@I86@',
    wifeId: '@I87@',
    label: 'Arie-Leib Ginzburg and Basia Liandres',
  },
  familyStructure: [
    {
      label: 'First marriage',
      spouseLabel: 'Unknown first wife',
      spousePersonId: null,
      note: 'Display correction only: raw data currently uses "First wife Ginzburg". Maiden name remains unknown.',
      relationshipType: 'unknown-first-wife',
    },
    {
      label: 'Second marriage',
      spouseLabel: 'Basia Liandres',
      spousePersonId: '@I87@',
      children: ['@I37@', '@I131@', '@I132@', '@I133@', '@I134@'],
      relationshipType: 'biological-children',
    },
    {
      label: 'Third marriage',
      spouseLabel: 'Esther Lipschitz',
      spousePersonId: null,
      children: ['@I203@'],
      note:
        'Research correction layer only: branch presentation records Esther Lipschitz as a third-wife identity, but the current raw graph does not yet contain a canonical linked person record for her.',
      relationshipType: 'half-sibling-and-stepfamily',
      stepchildren: [
        'Three unnamed stepchildren from Esther Lipschitz’s previous family are kept out of the biological-child display.',
      ],
    },
  ],
  maternalLine: [
    { label: 'Yael', personId: '@I1@' },
    { label: 'Pola', personId: '@I5@' },
    { label: 'Tzila Cilia Duberstein Alperovitz', personId: '@I12@' },
    { label: 'Sofia Ginzburg Duberstein', personId: '@I37@' },
    { label: 'Basia Liandres', personId: '@I87@' },
    { label: 'Druzia Lyandres', personId: null },
  ],
  borisovBranchIds: ['@I87@', '@I37@', '@I131@', '@I132@', '@I133@', '@I134@', '@I203@'],
  relationshipSummary: [
    'Eti Ginzburg Charny is represented as a half-sister of Sofia, Gershon, Aharon, Yankel Berl, and Isaak.',
    'Maiden names remain explicit in display profiles and are not overwritten by married surnames.',
    'Nickname-only variants are grouped as aliases instead of separate display identities.',
    'Druzia Lyandres is preserved in the branch package as Basia’s mother where branch-level presentation needs the maternal chain, even though the raw graph does not yet contain a canonical linked person record.',
  ],
  virtualPersons: [
    {
      id: 'virtual-esther-lipschitz',
      canonicalDisplayName: 'Esther Lipschitz',
      aliases: [],
      note: 'Presentation-layer person only. No canonical linked raw graph record is currently assigned with confidence.',
    },
    {
      id: 'virtual-druzia-lyandres',
      canonicalDisplayName: 'Druzia Lyandres',
      aliases: ['Druzia Liandres'],
      note: 'Presentation-layer maternal-line anchor only. No canonical linked raw graph record is currently assigned with confidence.',
    },
  ] as BranchVirtualPerson[],
} as const;

const BRANCH_EVIDENCE: BranchEvidenceItem[] = [
  {
    id: 'maternal-line-mtdna',
    type: 'dna-clue',
    title: 'Maternal line mtDNA anchor',
    description:
      'Sofia is treated as the earliest known maternal anchor in the current line summary, with branch display preserving the chain Basia -> Sofia -> Tzila Cilia -> Pola -> Yael.',
    source: 'Existing title metadata on Sofia plus branch research instructions.',
    confidence: 'partial',
    note: 'Partial evidence only. The mtDNA clue supports the maternal-line framing but does not resolve every intermediate historical connection.',
    personIds: ['@I37@', '@I12@', '@I5@', '@I1@', '@I87@'],
  },
  {
    id: 'daniel-ginzburg-dna',
    type: 'dna-clue',
    title: 'DNA clue for the Ginzburg-Liandres surname cluster',
    description:
      'The match notes mention Landres/Liandres within the broader Ginzburg surname cluster, supporting alias normalization without splitting separate display identities.',
    source: 'public/dna-matches.json',
    confidence: 'contextual',
    note: 'Contextual clue only. This supports surname clustering and alias handling, not a full branch reconstruction by itself.',
    personIds: ['@I87@', '@I37@', '@I12@'],
  },
  {
    id: 'cilia-migration-note',
    type: 'testimony',
    title: 'Cilia/Tzila migration note',
    description:
      'Current data states she was born in Haifa during the British Mandate, with family origin in the Pleshchenitsy area and a return to Belarus around 1930.',
    source: 'Existing migrationInfo on @I12@',
    confidence: 'partial',
    note: 'Retained as a testimony-style research note from the current data layer. It should be read as archival context, not as a standalone proof document.',
    personIds: ['@I12@'],
  },
  {
    id: 'cilia-myheritage-summary',
    type: 'document',
    title: 'MyHeritage update summary for Cilia Sara Duberstein',
    description:
      'A local review summary notes one new sibling-related update for Cilia Sara Duberstein (Alperovitch), the maternal grandmother in this branch context.',
    source: 'data/myheritage_new_info_summary_2026-03-29.csv',
    confidence: 'partial',
    note: 'This is a secondary research document summary, not the original source record itself.',
    personIds: ['@I12@'],
  },
  {
    id: 'raw-family-structure',
    type: 'external-tree-reference',
    title: 'Family-graph structural reference',
    description:
      'The branch package keeps the raw graph intact and layers display corrections over family IDs F19/F71 for spouse ordering and half-sibling interpretation.',
    source: 'public/family-graph.json',
    confidence: 'direct',
    personIds: ['@I86@', '@I87@', '@I203@'],
  },
  {
    id: 'livnat-report-cross-reference',
    type: 'external-tree-reference',
    title: 'Livnat report cross-reference for Ginzburg and Duberstein names',
    description:
      'The generated report includes parallel name forms such as Bashete Basia Ginzburg, Sofia Soshe Duberstein, and Gershon Grigory Ginzburg, which helps justify alias-aware display grouping.',
    source: 'public/livnat-report.json',
    confidence: 'contextual',
    note: 'Useful as a cross-reference for name variants; it should not be treated as an original historical source on its own.',
    personIds: ['@I87@', '@I37@', '@I132@'],
  },
];

const BRANCH_RELATIONSHIP_NOTES: BranchRelationshipNote[] = [
  {
    id: 'arie-leib-marriages',
    title: 'Marriage order correction',
    detail:
      'Display logic treats Arie-Leib as having an unknown first wife, Basia Liandres as second wife, and Esther Lipschitz as third wife. This is a presentation correction layered over the current raw graph.',
    personIds: ['@I86@', '@I87@'],
  },
  {
    id: 'esther-stepchildren',
    title: 'Stepchildren are not biological children',
    detail:
      'Esther Lipschitz is not presented as the biological mother of the three children who came with her from a previous family. They remain stepchildren in branch-level interpretation.',
    personIds: ['@I203@'],
  },
  {
    id: 'eti-half-sister',
    title: 'Eti is a half-sister',
    detail:
      'Eti Ginzburg Charny is displayed as a half-sister of Sofia, Gershon, Aharon, Yankel Berl, and Isaak rather than a full sibling.',
    personIds: ['@I203@', '@I37@', '@I131@', '@I132@', '@I133@', '@I134@'],
  },
];

const BRANCH_GENEALOGY_CLAIMS: GenealogyClaim[] = [
  {
    id: 'claim-basia-identity',
    type: 'identity',
    subjectId: '@I87@',
    value: 'Basia Liandres',
    evidenceIds: ['raw-family-structure', 'livnat-report-cross-reference'],
    confidence: 'direct',
    note: 'Canonical branch display name. Married surname should not replace maiden surname in normalized presentation.',
  },
  {
    id: 'claim-basia-spouse-arie-leib',
    type: 'spouse',
    subjectId: '@I87@',
    objectId: '@I86@',
    evidenceIds: ['raw-family-structure'],
    confidence: 'direct',
  },
  {
    id: 'claim-basia-mother-sofia',
    type: 'parent',
    subjectId: '@I87@',
    objectId: '@I37@',
    evidenceIds: ['raw-family-structure', 'maternal-line-mtdna'],
    confidence: 'direct',
  },
  {
    id: 'claim-druzia-maternal-line-mother-of-basia',
    type: 'maternal-line',
    subjectId: '@I87@',
    value: 'Druzia Lyandres',
    evidenceIds: ['maternal-line-mtdna'],
    confidence: 'partial',
    note: 'Maternal-line anchor in the normalized branch chain. Preserve ambiguity if the raw graph does not yet contain a canonical linked person record for Druzia Lyandres.',
  },
  {
    id: 'claim-sofia-identity',
    type: 'identity',
    subjectId: '@I37@',
    value: 'Sofia Ginzburg Duberstein',
    evidenceIds: ['raw-family-structure', 'livnat-report-cross-reference'],
    confidence: 'direct',
    note: 'Canonical normalized English display name for branch presentation.',
  },
  {
    id: 'claim-sofia-spouse-vladimir',
    type: 'spouse',
    subjectId: '@I37@',
    objectId: '@I36@',
    evidenceIds: ['raw-family-structure'],
    confidence: 'direct',
  },
  {
    id: 'claim-sofia-mother-tzila',
    type: 'parent',
    subjectId: '@I37@',
    objectId: '@I12@',
    evidenceIds: ['raw-family-structure', 'maternal-line-mtdna', 'cilia-migration-note'],
    confidence: 'direct',
  },
  {
    id: 'claim-arie-leib-third-wife-esther',
    type: 'spouse',
    subjectId: '@I86@',
    value: 'Esther Lipschitz',
    evidenceIds: ['raw-family-structure'],
    confidence: 'partial',
    note: 'Presentation-layer correction only. Current raw graph may not yet contain a canonical linked person record for Esther Lipschitz.',
  },
  {
    id: 'claim-esther-stepchildren-not-biological',
    type: 'branch-context',
    subjectId: '@I86@',
    value: 'Stepchildren are not biological',
    evidenceIds: ['raw-family-structure'],
    confidence: 'partial',
    note: 'Branch-context only. Preserve stepchildren as non-biological in the presentation layer.',
  },
  {
    id: 'claim-eti-half-sibling-status',
    type: 'sibling-status',
    subjectId: '@I203@',
    value: 'Half-sister of Sofia, Gershon, Aharon, Yankel Berl, and Isaak',
    evidenceIds: ['raw-family-structure', 'livnat-report-cross-reference'],
    confidence: 'direct',
    note: 'This should be rendered explicitly as half-sibling status, not full sibling status.',
  },
];

const BRANCH_RELATIONSHIP_OVERLAYS: Record<string, BranchRelationshipOverlay> = {
  '@I203@': {
    personId: '@I203@',
    relationshipChips: ['Half-sister', 'Third marriage cluster'],
    notes: [
      'Eti is displayed as a half-sister of Sofia, Gershon, Aharon, Yankel Berl, and Isaak.',
    ],
  },
  '@I37@': {
    personId: '@I37@',
    relationshipChips: ['Maternal line', 'Second marriage cluster'],
    notes: [
      'Sofia is displayed as a biological child of Arie-Leib Ginzburg and Basia Liandres.',
    ],
  },
  '@I131@': {
    personId: '@I131@',
    relationshipChips: ['Second marriage cluster'],
    notes: [
      'Aharon is displayed in the Basia Liandres child cluster.',
    ],
  },
  '@I132@': {
    personId: '@I132@',
    relationshipChips: ['Second marriage cluster'],
    notes: [
      'Gershon/Grigory is displayed in the Basia Liandres child cluster with merged aliases.',
    ],
  },
  '@I133@': {
    personId: '@I133@',
    relationshipChips: ['Second marriage cluster'],
    notes: [
      'Yankel Berl remains a single display identity despite shortened-name variants.',
    ],
  },
  '@I134@': {
    personId: '@I134@',
    relationshipChips: ['Second marriage cluster'],
    notes: [
      'Isaak remains in the Basia Liandres biological-child cluster.',
    ],
  },
};

function normalizeBranchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function canonicalizeVariantToken(value: string): string {
  const normalized = normalizeBranchText(value).replace(/\s+/g, '');
  for (const variants of BRANCH_ALIAS_RULES) {
    const [canonical, ...aliases] = variants as readonly string[];
    if (normalized === canonical || aliases.includes(normalized)) {
      return canonical;
    }
  }
  return normalized;
}

function canonicalizeAliasPhrase(value: string): string {
  return normalizeBranchText(value)
    .split(/\s+/)
    .map((token) => canonicalizeVariantToken(token))
    .join(' ')
    .trim();
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const cleaned = value.trim();
    if (!cleaned) continue;
    const key = canonicalizeAliasPhrase(cleaned);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }
  return result;
}

export function isGinzburgLiandresBranchPerson(person: Person): boolean {
  return person.id in BRANCH_PERSON_CONFIG;
}

export function getCanonicalGinzburgLiandresDisplayName(person: Person): string {
  return BRANCH_PERSON_CONFIG[person.id]?.canonicalDisplayName || person.fullName;
}

export function getGinzburgLiandresAliases(person: Person): string[] {
  const config = BRANCH_PERSON_CONFIG[person.id];
  if (!config) return [];
  return unique([
    ...(config.aliases || []),
    person.fullName,
    person.givenName,
    person.birthName || '',
    person.hebrewName || '',
  ]).filter((alias) => alias !== config.canonicalDisplayName);
}

export function getGinzburgLiandresDisplayProfile(person: Person): BranchPersonDisplayProfile | null {
  const config = BRANCH_PERSON_CONFIG[person.id];
  if (!config) return null;

  const birthSurname =
    config.birthSurname ||
    (person.surname && person.surnameFinal && person.surname !== person.surnameFinal ? person.surname : null) ||
    null;

  const marriedSurname =
    config.marriedSurname ||
    (person.surnameFinal && birthSurname && person.surnameFinal !== birthSurname ? person.surnameFinal : null) ||
    null;

  return {
    personId: person.id,
    canonicalDisplayName: config.canonicalDisplayName,
    aliases: getGinzburgLiandresAliases(person),
    primarySurname: config.primarySurname || person.surnameFinal || person.surname || null,
    birthSurname,
    marriedSurname,
    conciseBirthDate: formatDateConcise(person.birthDate),
    conciseDeathDate: formatDateConcise(person.deathDate),
    conciseLifespan: formatLifespan(person.birthDate, person.deathDate),
    identityWarnings: config.identityWarnings || [],
  };
}

export function getGinzburgLiandresEvidenceForPerson(personId: string): BranchEvidenceItem[] {
  return BRANCH_EVIDENCE.filter((item) => item.personIds.includes(personId));
}

export function getGinzburgLiandresBranchEvidence(): BranchEvidenceItem[] {
  return BRANCH_EVIDENCE;
}

export function getGinzburgLiandresRelationshipNotes(personId: string): BranchRelationshipNote[] {
  return BRANCH_RELATIONSHIP_NOTES.filter((item) => item.personIds.includes(personId));
}

export function getGinzburgLiandresRelationshipOverlay(personId: string): BranchRelationshipOverlay | null {
  return BRANCH_RELATIONSHIP_OVERLAYS[personId] || null;
}

export function getGinzburgLiandresClaimsForPerson(personId: string): GenealogyClaim[] {
  return BRANCH_GENEALOGY_CLAIMS.filter((claim) => claim.subjectId === personId);
}

export function getGinzburgLiandresBranchClaims(): GenealogyClaim[] {
  return BRANCH_GENEALOGY_CLAIMS;
}

export function getGinzburgLiandresBranchSummary() {
  return GINZBURG_LIANDRES_BRANCH_SUMMARY;
}
