import type { Person } from '../types';
import type {
  BranchEvidenceItem,
  GenealogyClaim,
  ImageEvidenceItem,
  RelationType,
  VideoTestimonyEvidence,
} from '../types/genealogy';
import { formatDateConcise, formatLifespan } from '../utils/formatters';

export interface BranchRelationshipNote {
  id: string;
  title: string;
  detail: string;
  personIds: string[];
  relationType?: RelationType;
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
    aliases: ['Arie Leib Ginzburg', 'Arie-Leib Ginsburg', 'Arie-Leib Ginzberg', 'Leiba Ginzburg'],
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
    aliases: [
      'Cilia Sara Cipora Duberstein',
      'Cilia Duberstein',
      'Tzila Duberstein',
      'Cilia Sara Duberstein Alperovitch',
      'Tzila Sara Tzipora Duberstein',
      'Tzila Sara Tzipora Duberstein Alperovitz',
    ],
    birthSurname: 'Duberstein',
    marriedSurname: 'Alperovitz',
    primarySurname: 'Duberstein',
  },
  '@I58@': {
    canonicalDisplayName: 'Ruve Roman Duberstein',
    aliases: ['Ruven Duberstein', 'Ruve Duberstein', 'Roman Duberstein', 'Rube Duberstein', 'Ruven/Rube Duberstein'],
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
    aliases: ['Valia Axelrod', 'Valia Duberstein', 'Valentina Duberstein', 'Vala Duberstein', 'Vola Duberstein'],
    birthSurname: 'Duberstein',
    marriedSurname: 'Axelrod',
    primarySurname: 'Duberstein',
  },
  '@I61@': {
    canonicalDisplayName: 'Ema Duberstein Meirson',
    aliases: ['Ema Meirson', 'Ema Bash Eta Duberstein', 'Bashata Ema Duberstein', 'Bashata Ema', 'Ema Duberstein'],
    birthSurname: 'Duberstein',
    marriedSurname: 'Meirson',
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
  showOnlyBloodline: true,
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
      spouseLabel: 'Unknown wife (given name and maiden name unknown).',
      spousePersonId: null,
      children: ['@I203@'],
      note: 'Known child from this marriage: Eti Ginzburg Charny.',
      relationshipType: 'unknown-first-wife',
      relationType: 'blood',
    },
    {
      label: 'Second marriage',
      spouseLabel: 'Basia Liandres',
      spousePersonId: '@I87@',
      children: ['@I37@', '@I131@', '@I132@', '@I133@', '@I134@'],
      relationshipType: 'biological-children',
      relationType: 'blood',
    },
  {
    label: 'Third marriage',
    spouseLabel: 'Esther Lipschitz',
    spousePersonId: null,
    note:
      'Research correction layer only: branch presentation records Esther Lipschitz as a third-wife identity, but the current raw graph does not yet contain a canonical linked person record for her.',
    relationshipType: 'half-sibling-and-stepfamily',
    relationType: 'marriage',
    stepchildren: [
      'The children associated with Esther Lipschitz’s household in display: Dobe, Dora, and Haim. The display keeps them distinct from biological children.',
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

const BRANCH_RELATIONSHIP_NOTES: BranchRelationshipNote[] = [
  {
    id: 'arie-leib-marriages',
    title: 'Marriage order correction',
    detail:
      'Display logic treats Arie-Leib as having an unknown first wife (given name and maiden name unknown) with known child Eti Ginzburg Charny, Basia Liandres as second wife, and Esther Lipschitz as third wife. This is a presentation correction layered over the current raw graph.',
    personIds: ['@I86@', '@I87@'],
    relationType: 'marriage',
  },
  {
    id: 'esther-stepchildren',
    title: 'Household children associated with Esther Lipschitz',
    detail:
      'The children associated with Esther Lipschitz’s household in display are Dobe, Dora, and Haim. The display keeps them distinct from biological children.',
    personIds: ['@I203@'],
    relationType: 'marriage',
  },
  {
    id: 'eti-half-sister',
    title: 'Eti is a half-sister',
    detail:
      'Eti Ginzburg Charny is displayed as a half-sister of Sofia, Gershon, Aharon, Yankel Berl, and Isaak rather than a full sibling.',
    personIds: ['@I203@', '@I37@', '@I131@', '@I132@', '@I133@', '@I134@'],
    relationType: 'blood',
  },
  {
    id: 'ela-iche-ambiguity',
    title: 'Ela / Iche ambiguity',
    detail:
      'Ela / Iche may refer to one person or two people in the Duberstein generation; keep this ambiguous in the presentation layer.',
    personIds: ['@I36@'],
    relationType: 'unknown',
  },
  {
    id: 'iche-first-wife-household',
    title: 'Iche in the first-wife household',
    detail:
      'Iche is kept as a low-confidence household placement under Leiba’s first-wife household.',
    personIds: ['@I86@'],
    relationType: 'marriage',
  },
  {
    id: 'asna-lifshitz-sister',
    title: 'Asna Lifshitz uncertainty',
    detail:
      'Asna Lifshitz may be Esther’s sister; preserve this as uncertain.',
    personIds: ['@I86@'],
    relationType: 'unknown',
  },
  {
    id: 'dobe-dora-haim-stepchildren',
    title: 'Household children associated with Esther Lipschitz',
    detail:
      'The children associated with Esther Lipschitz’s household in display are Dobe, Dora, and Haim. The display keeps them distinct from biological children.',
    personIds: ['@I86@'],
    relationType: 'marriage',
  },
];

export const tzilaVideoEvidence: VideoTestimonyEvidence[] = [
  {
    id: 'ev-video-tzila-duberstein-01',
    type: 'video-testimony',
    title: 'Part A: Tzila Alperovitz on the Duberstein family structure',
    shortTitleHe: 'חלק א: מבנה משפחת דוברשטיין',
    speakerPersonId: '@I12@',
    relatedPersonIds: ['@I36@', '@I37@', '@I58@', '@I59@', '@I60@', '@I61@', '@I12@'],
    topics: ['family structure', 'parents', 'siblings', 'childhood'],
    description:
      'Video testimony describing Vladimir Duberstein, Sofia Duberstein, and their children: Ruven/Rube, Michael, Bashata Ema, Tzila Sara Tzipora, and Vola.',
    descriptionHe: 'עדות מצולמת המתארת את ולדימיר דוברשטיין, סופיה דוברשטיין וילדיהם.',
    source: 'Tzila family testimony transcript',
    url: 'https://www.youtube.com/watch?v=xdzVR8kqcJE&t=1062s',
    embedUrl: 'https://www.youtube.com/embed/xdzVR8kqcJE?si=f_du8oD1Ujiin_Fa',
    language: 'he',
    confidence: 'direct',
    note: 'Use as oral-history evidence. Preserve uncertainty where wording is approximate.',
    personIds: ['@I12@', '@I36@', '@I37@', '@I58@', '@I59@', '@I60@', '@I61@'],
  },
  {
    id: 'ev-video-tzila-duberstein-02',
    type: 'video-testimony',
    title: 'Part B: Tzila Alperovitz on war, flight, and the bank story',
    shortTitleHe: 'חלק ב: מלחמה, בריחה וסיפור הבנק',
    speakerPersonId: '@I12@',
    relatedPersonIds: ['@I12@', '@I36@', '@I37@'],
    topics: ['war', 'flight', 'bank', 'bombing', 'pogrom', 'Pleshchenitsy'],
    description:
      'Video testimony recounting Vladimir’s bank role, attempted escape with bank funds, military interception, bombing, family flight, and the Pleshchenitsy context in the Byelorussian SSR, Soviet Union.',
    descriptionHe: 'עדות מצולמת על תפקידו של ולדימיר בבנק, הבריחה, ההפצצות וההקשר של גטו פלשניץ.',
    source: 'Tzila family testimony transcript',
    url: 'https://www.youtube.com/watch?v=u5Ut8_JtsDE&t=996s',
    embedUrl: 'https://www.youtube.com/embed/u5Ut8_JtsDE?si=m7GP8Yi1waZpLIoX',
    language: 'he',
    confidence: 'direct',
    note: 'Historical sequence should remain marked as testimony unless independently corroborated.',
    personIds: ['@I12@', '@I36@', '@I37@'],
  },
  {
    id: 'ev-video-tzila-ginzburg-01',
    type: 'video-testimony',
    title: 'Tzila Alperovitz on the Ginzburg branch',
    shortTitleHe: 'ענף גינזבורג',
    speakerPersonId: '@I12@',
    relatedPersonIds: ['@I86@', '@I87@', '@I131@', '@I132@', '@I133@', '@I134@', '@I203@'],
    topics: ['Ginzburg branch', 'Leiba Ginzburg', 'wives', 'children', 'family memory'],
    description:
      'Video testimony describing Leiba Ginzburg, his wives, the children attributed to the Bashata branch, and the later Gershon–Fania Feigl household.',
    descriptionHe: 'עדות מצולמת על לייבה גינזבורג, נשותיו, ילדיו, ועל בית גרשון ופאניה פייגל.',
    source: 'Tzila family testimony transcript',
    language: 'he',
    confidence: 'partial',
    note: 'Contains oral-history ambiguities around wives, child attribution, and repeated names.',
    personIds: ['@I12@', '@I86@', '@I87@', '@I131@', '@I132@', '@I133@', '@I134@', '@I203@'],
  },
  {
    id: 'ev-video-tzila-photo-memory-01',
    type: 'video-testimony',
    title: 'Tzila Alperovitz on the family photo and Ema Meirson',
    shortTitleHe: 'זיכרון התמונה המשפחתית',
    speakerPersonId: '@I12@',
    relatedPersonIds: ['@I12@', '@I61@'],
    topics: ['family photo', 'sisters', 'identity matching', 'memory'],
    description:
      'Video testimony recalling a family photograph in which Tzila appears alongside her sister, probably Ema Meirson née Duberstein / Bashata Ema Duberstein.',
    descriptionHe: 'עדות מצולמת על תמונה משפחתית שבה צילה מופיעה לצד אחותה, כנראה אמה מאירסון לבית דוברשטיין.',
    source: 'Tzila family testimony transcript',
    language: 'he',
    confidence: 'partial',
    note: 'Useful for identity linkage, but should remain explicitly probabilistic until matched to a documented photo record.',
    personIds: ['@I12@', '@I61@'],
  },
];

export const tzilaImageEvidence: ImageEvidenceItem[] = [
  {
    id: 'ev-image-aharon-military-portrait',
    type: 'portrait',
    title: 'Military portrait of Aharon Ginzburg',
    description: 'A military portrait of Aharon Ginzburg in uniform, attributed from the source file and branch context.',
    assetPath: '/images/ginzburg/aharon_ginzburg_1935_large-Enhanced.jpg',
    relatedPersonIds: ['@I131@'],
    yearApprox: '1935',
    source: 'Uploaded Ginzburg materials',
    confidence: 'partial',
    note: 'Family attribution only; keep it reviewable unless a primary inscription or equivalent support is found.',
  },
  {
    id: 'ev-image-berl-yakov-ginzburg-1944',
    type: 'portrait',
    title: 'Military portrait attributed to Berl Yakov Ginzburg',
    description:
      'Studio-style military portrait preserved in the family archive and labeled as Berl Yakov Ginzburg, dated 1944.',
    assetPath: '/images/ginzburg/akov_ginzburg_1944_large-Enhanced.jpg',
    relatedPersonIds: ['@I133@'],
    relatedPersonDisplayNames: ['Yankel Berl Ginzburg'],
    year: 1944,
    source: 'Family archive filename and branch research context',
    confidence: 'partial',
    note: 'Identity should remain tentative unless confirmed by a dated inscription, reverse-side note, or independent family documentation.',
  },
  {
    id: 'ev-image-zinaida-dubershtein-ginzburg-portrait',
    type: 'portrait',
    title: 'Portrait attributed to Dr. Zinaida Zina Dubershtein (Ginzburg)',
    description: 'Archival portrait associated in family labeling with Dr. Zinaida Zina Dubershtein (Ginzburg).',
    assetPath: '/images/ginzburg/Zinaida Dubershtein Ginzburg-Enhanced.jpg',
    relatedPersonDisplayNames: ['Dr. Zinaida Zina Dubershtein (Ginzburg)'],
    source: 'Family archive',
    confidence: 'partial',
    note: 'Identity follows the current family attribution and should remain reviewable unless matched to a dated inscription or parallel source.',
  },
  {
    id: 'ev-image-zinaida-dubershtein-ginzburg-portrait-alt',
    type: 'portrait',
    title: 'Alternate portrait attributed to Dr. Zinaida Zina Dubershtein (Ginzburg)',
    description: 'Alternate archival portrait version associated with Dr. Zinaida Zina Dubershtein (Ginzburg).',
    assetPath: '/images/ginzburg/zina-Enhanced.jpg',
    relatedPersonDisplayNames: ['Dr. Zinaida Zina Dubershtein (Ginzburg)'],
    source: 'Family archive',
    confidence: 'partial',
    note: 'Treat as the same portrait subject only if the family archive confirms both scans belong to the same person.',
  },
  {
    id: 'ev-image-cilia-two-person-portrait',
    type: 'portrait',
    title: 'Portrait of Tzila Cilia Duberstein Alperovitz with Liri Livnat-Tal',
    description: 'A two-person portrait showing Cilia with Liri Livnat-Tal.',
    assetPath: '/ginzburg-media/cilia-two-person-portrait.jpg',
    relatedPersonIds: ['@I12@'],
    relatedPersonDisplayNames: ['Liri Livnat-Tal'],
    source: 'Uploaded Ginzburg materials',
    confidence: 'partial',
    note: 'Keep the family attribution reviewable unless a primary inscription or parallel source confirms it.',
  },
  {
    id: 'ev-image-ginzburg-family-1946-annotated',
    type: 'annotated-photo',
    title: 'Annotated Ginzburg family group photo',
    description: 'An annotated family group photo from the 1946 Ginzburg material set.',
    assetPath: '/ginzburg-media/ginzburg-family-1946-annotated-photo.jpg',
    relatedPersonIds: ['@I86@', '@I87@', '@I37@', '@I131@', '@I132@', '@I133@', '@I134@', '@I203@'],
    yearApprox: '1946',
    source: 'Uploaded Ginzburg materials',
    confidence: 'partial',
    note: 'Annotation marks are part of the source image; some identifications remain interpretive.',
  },
  {
    id: 'ev-image-ginzburg-family-1946-clean',
    type: 'family-photo',
    title: 'Ginzburg family group photo',
    description: 'A clean family group photo from the 1946 Ginzburg material set.',
    assetPath: '/ginzburg-media/ginzburg-family-1946-clean-photo.jpg',
    relatedPersonIds: ['@I86@', '@I87@', '@I37@', '@I131@', '@I132@', '@I133@', '@I134@', '@I203@'],
    yearApprox: '1946',
    source: 'Uploaded Ginzburg materials',
    confidence: 'partial',
    note: 'Use as the unannotated reference version of the family grouping.',
  },
  {
    id: 'ev-image-ginzburg-family-annotated-group',
    type: 'annotated-photo',
    title: 'Annotated Ginzburg family group photograph',
    description: 'Family group photograph with handwritten identification lines and names added later for working identification.',
    assetPath: '/images/ginzburg/image.png',
    relatedPersonDisplayNames: [
      'Boris Ginzburg',
      'Yudik Ginzburg',
      'Ema Duberstein Meirson',
      'Tzila Cilia Duberstein Alperovitz',
      'Vladimir Reuvenovich Duberstein',
      'Sofia Ginzburg Duberstein',
    ],
    source: 'Family archive annotated reference image',
    sourceHe: 'צילום עם זיהוי משפחתי מתוך הארכיון המשפחתי',
    confidence: 'partial',
    note: 'This is a research-use annotated image. Individual identifications should be treated as family working labels unless corroborated by an original caption or parallel source.',
  },
  {
    id: 'ev-image-ginzburg-duberstein-family-group-identified',
    type: 'annotated-photo',
    title: 'Identified Ginzburg–Duberstein family group photograph',
    description: 'Family group photograph with detailed family-supplied identification across the Ginzburg, Duberstein, Meirson, and Charny lines.',
    assetPath: '/images/ginzburg/image.png',
    relatedPersonDisplayNames: [
      'Roman Ginzburg',
      'Isaak Ginzburg',
      'Yankel Berl Ginzburg',
      'Vladimir Reuvenovich Duberstein',
      'Anshel Meirson',
      'Ema Meirson',
      'Cilia Sara Alperovich',
      'Vera-Dvora Charny',
      'Shimon Ginzburg',
      'Sonya Charny',
      'Boris Ginzburg',
      'Gershon (Grigory) Ginzburg',
      'Feiga-Feigl Ginzburg',
      'Eti Ginzburg-Charny',
      'Sofia Sosha (Ginzburg) Duberstein',
      'Don Charny',
      'Boris Hudenko',
      'Marek Meirson',
      'Nina Sokolova',
      'Eduard Sokolov',
      'Yehuda(Yuri) Ginzburg',
    ],
    source: 'Family archive with family-supplied identification',
    confidence: 'partial',
    note:
      'Identification supplied by family annotation. The image connects the Ginzburg, Duberstein, Meirson, Charny, Hudenko, and Sokolov lines in one grouped family photograph. The child seated below Roman Ginzburg is identified by family note as Yehuda(Yuri) Ginzburg (1933–1960).',
  },
  {
    id: 'ev-image-ginzburg-family-group-1946-a',
    type: 'family-photo',
    title: 'Ginzburg family group photograph, postwar Byelorussian SSR, Soviet Union',
    description: 'Clean family group photograph from the postwar period in Byelorussian SSR, Soviet Union, preserved without the later handwritten overlay.',
    assetPath: '/images/ginzburg/ginzburg_family_1946_-_1_original.jpg',
    relatedPersonIds: ['@I261@', '@I61@', '@I12@', '@I36@', '@I37@'],
    relatedPersonDisplayNames: ['Yudik Ginzburg'],
    yearApprox: 'circa 1946',
    source: 'Family archive',
    confidence: 'partial',
    note: 'Use together with the annotated version for identification support, but do not convert photo-based positional assumptions into hard genealogy facts without separate confirmation.',
  },
  {
    id: 'ev-image-ginzburg-family-group-1946-b',
    type: 'family-photo',
    title: 'Alternate Ginzburg family group photograph, postwar Byelorussian SSR, Soviet Union',
    description:
      'Second family group photograph from the same broader postwar family context in Byelorussian SSR, Soviet Union, likely related to the annotated identification set.',
    assetPath: '/images/ginzburg/ginzburg_family_1946_-_2_original.jpg',
    relatedPersonIds: ['@I261@', '@I61@', '@I12@', '@I36@', '@I37@'],
    relatedPersonDisplayNames: ['Yudik Ginzburg'],
    yearApprox: 'circa 1946',
    source: 'Family archive',
    confidence: 'partial',
    note: 'Keep person-level identification tentative unless anchored by the annotated counterpart or another source.',
  },
  {
    id: 'ev-document-yankel-berl-ginzburg-autobiography',
    type: 'document-scan',
    title: 'Scanned autobiographical document linked to Yankel Berl Ginzburg',
    description:
      'Archival scan of a Russian-language biographical or autobiographical form containing family-history information and parental details.',
    assetPath: '/images/ginzburg/yankel-berl_ginzburg_autobiography_original.jpg',
    relatedPersonIds: ['@I133@'],
    relatedPersonDisplayNames: ['Yankel Berl Ginzburg'],
    source: 'Family archive document scan',
    confidence: 'direct',
    note: 'The document is primary documentary evidence as an archival record, but any extracted transcription or interpretation should remain separately reviewable.',
  },
  {
    id: 'ev-document-yankel-berl-ginzburg-memoir-yiddish',
    type: 'document-scan',
    title: 'Short memoir of Yankel-Berl Ginzburg (Yiddish manuscript)',
    titleHe: 'זיכרונות Yankel-Berl Ginzburg ביידיש',
    description:
      'Yiddish memoir text attributed to Yankel-Berl Ginzburg, describing his birth in 1894 in Pleshchenitsy, Borisov District, Minsk Governorate, Russian Empire, and naming his parents as Arie-Leib Ginzburg and Basia-Bashata née Landres.',
    descriptionHe: 'כתב זיכרונות משפחתי ביידיש, עם פרטים על הלידה ב־Pleshchenitsy, Borisov District, Minsk Governorate, Russian Empire, ועל הוריו של Yankel-Berl Ginzburg.',
    assetPath: '/images/ginzburg/yankel-berl_ginzburg_autobiography_original(2).jpg',
    relatedPersonIds: ['@I133@', '@I86@'],
    relatedPersonDisplayNames: ['Yankel Berl Ginzburg', 'Arie-Leib Ginzburg', 'Basia-Bashata née Landres'],
    yearApprox: '20th century manuscript / memoir copy',
    source: 'Family archive, Yiddish memoir text and family translation',
    confidence: 'direct',
    note:
      'Primary family-source autobiographical text. The memoir states that Yankel-Berl Ginzburg was born in 1894 in Pleshchenitsy, Borisov District, Minsk Governorate, Russian Empire; that his father Arie-Leib Ginzburg was a melamed for young children; and that his mother was Basia-Bashata née Landres.',
    noteHe: 'לפי הטקסט, אביו הוא Arie-Leib Ginzburg ואמו היא Basia-Bashata née Landres; מקום הלידה הוא Pleshchenitsy, Borisov District, Minsk Governorate, Russian Empire.',
  },
  {
    id: 'ev-document-haifa-voters-list-1930',
    type: 'document-scan',
    title: 'Voter List for Haifa, 1928',
    titleHe: 'פנקס הבוחרים של חיפה, 1928',
    description: 'Scanned page from the Voter List for Haifa, 1928, preserved as a supporting civic document from Haifa, Mandatory Palestine.',
    descriptionHe: 'סריקה של עמוד מתוך פנקס הבוחרים של חיפה, 1928, כפריט תיעוד מסייע מחיפה, Mandatory Palestine.',
    assetPath: '/images/ginzburg/1930_Voters_List_Haifa_040(1).jpg',
    source: 'Voter List for Haifa, 1928, from the “Voters Knesset Israel 1928” database, document 109, list 5, page 25, IGRA no. 7867. Original records: City Archives - Haifa. Record added to the search engine on 13 October 2012.',
    sourceHe: 'פנקס הבוחרים של חיפה, 1928, מתוך מאגר “בוחרי כנסת ישראל 1928”, מסמך 109, רשימה 5, דף 25, מספר IGRA 7867. מקור הרשומות: ארכיון העיר חיפה. הרשומה נוספה למנוע החיפוש ב־13 October 2012.',
    year: 1928,
    confidence: 'partial',
    note:
      'The metadata for this record states document 109, list 5, page 25, IGRA no. 7867. However, the scan shown here carries the header mark “קף 40”. Therefore, the catalog details of the record and the page number visible in the uploaded scan should be kept distinct.',
    noteHe: 'המטא־דאטה של הרשומה מציין: מסמך 109, רשימה 5, דף 25, מספר IGRA 7867. עם זאת, הסריקה המוצגת כאן נושאת בראש העמוד את הסימון “קף 40”. לכן יש להבחין בין פרטי הקטלוג של הרשומה לבין מספר העמוד המופיע בסריקה שהועלתה בפועל.',
  },
  {
    id: 'ev-image-tzila-family-testimony-scan',
    type: 'document-scan',
    title: 'Scanned Tzila family testimony page',
    description: 'A scanned testimony page in Hebrew that preserves the family story as a document image.',
    assetPath: '/ginzburg-media/tzila-family-testimony-scan.png',
    relatedPersonIds: ['@I12@', '@I36@', '@I37@'],
    source: 'Uploaded Ginzburg materials',
    confidence: 'direct',
    note: 'Treat this as a scan of documentary evidence, not as a transcription.',
  },
  {
    id: 'ev-image-cilia-alperovitz-liri-livnat-tal',
    type: 'family-photo',
    title: 'Tzila Cilia Alperovitz née Dubershtein with Liri Livnat-Tal',
    description: 'Later family photograph showing Tzila Cilia Alperovitz née Dubershtein holding Liri Livnat-Tal.',
    assetPath: '/images/ginzburg/grandmother_cilia_alperovich_nee_dubershtein_liri_livnat-tal.jpg',
    relatedPersonDisplayNames: ['Tzila Cilia Alperovitz née Dubershtein', 'Liri Livnat-Tal'],
    source: 'Family archive',
    confidence: 'direct',
    note: 'Modern family photograph from the maternal line archive.',
  },
  {
    id: 'ev-image-isaak-ginzburg-1936',
    type: 'portrait',
    title: 'Portrait attributed to Iche Isaak Ginzburg',
    description: 'Archival portrait associated in family labeling with Iche Isaak Ginzburg.',
    assetPath: '/images/ginzburg/isaak_ginzburg_1936_large-Enhanced.jpg',
    relatedPersonIds: ['@I134@'],
    relatedPersonDisplayNames: ['Iche Isaak Ginzburg'],
    year: 1936,
    source: 'Family archive',
    confidence: 'partial',
    note: 'Year follows the current family identification.',
  },
  {
    id: 'ev-image-tzila-prewar-class-photo-1941',
    type: 'annotated-photo',
    title: 'Prewar class photo linked to Tzila Cilia Alperovitz née Dubershtein',
    description:
      'A family-annotated class photo from before June 1941, used as documented research context and associated in the archive with the girl at the lower right, with braids.',
    assetPath: '/images/ginzburg/tzila_prewar_class_photo_1941_original.jpg',
    relatedPersonIds: ['@I12@'],
    relatedPersonDisplayNames: ['Tzila Cilia Alperovitz née Dubershtein'],
    yearApprox: 'before June 1941',
    source: 'Family archive annotation',
    confidence: 'partial',
    note: 'The identification remains family-supplied research context; family notes also state that about half of her classmates perished during the war in the Byelorussian SSR, Soviet Union.',
  },
];

const BRANCH_EVIDENCE: BranchEvidenceItem[] = [
  ...tzilaImageEvidence,
  ...tzilaVideoEvidence,
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
    type: 'video-testimony',
    title: 'Cilia/Tzila migration context note',
    description:
      'Documented research context places her in Haifa, Mandatory Palestine, traces family origin to Pleshchenitsy, Borisov District, Minsk Governorate, Russian Empire, and notes a return to the Byelorussian SSR, Soviet Union, around 1930.',
    source: 'Existing migrationInfo on @I12@',
    confidence: 'partial',
    note: 'Research context entry. No video URL or transcript is currently attached in the branch package.',
    personIds: ['@I12@'],
    speakerPersonId: '@I12@',
    language: 'en',
  },
  {
    id: 'cilia-myheritage-summary',
    type: 'document',
    title: 'MyHeritage update summary for Cilia Sara Duberstein',
    description:
      'A local review summary notes one new sibling-related update for Cilia Sara Duberstein (Alperovitz), the maternal grandmother in this branch context.',
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

export const tzilaTestimonyClaims: GenealogyClaim[] = [
  {
    id: 'claim-vladimir-sofia-spouse',
    type: 'spouse',
    subjectId: '@I36@',
    objectId: '@I37@',
    evidenceIds: ['ev-video-tzila-duberstein-01'],
    confidence: 'direct',
    note: 'Supported by oral testimony summary.',
  },
  {
    id: 'claim-vladimir-parent-ruven',
    type: 'parent',
    subjectId: '@I36@',
    objectId: '@I58@',
    evidenceIds: ['ev-video-tzila-duberstein-01'],
    confidence: 'direct',
    note: 'Ruven/Rube listed as child of Vladimir and Sofia.',
  },
  {
    id: 'claim-sofia-parent-ruven',
    type: 'parent',
    subjectId: '@I37@',
    objectId: '@I58@',
    evidenceIds: ['ev-video-tzila-duberstein-01'],
    confidence: 'direct',
  },
  {
    id: 'claim-vladimir-parent-michael',
    type: 'parent',
    subjectId: '@I36@',
    objectId: '@I59@',
    evidenceIds: ['ev-video-tzila-duberstein-01'],
    confidence: 'direct',
  },
  {
    id: 'claim-sofia-parent-michael',
    type: 'parent',
    subjectId: '@I37@',
    objectId: '@I59@',
    evidenceIds: ['ev-video-tzila-duberstein-01'],
    confidence: 'direct',
  },
  {
    id: 'claim-vladimir-parent-ema',
    type: 'parent',
    subjectId: '@I36@',
    objectId: '@I61@',
    evidenceIds: ['ev-video-tzila-duberstein-01'],
    confidence: 'direct',
  },
  {
    id: 'claim-sofia-parent-ema',
    type: 'parent',
    subjectId: '@I37@',
    objectId: '@I61@',
    evidenceIds: ['ev-video-tzila-duberstein-01'],
    confidence: 'direct',
  },
  {
    id: 'claim-vladimir-parent-tzila',
    type: 'parent',
    subjectId: '@I36@',
    objectId: '@I12@',
    evidenceIds: ['ev-video-tzila-duberstein-01'],
    confidence: 'direct',
  },
  {
    id: 'claim-sofia-parent-tzila',
    type: 'parent',
    subjectId: '@I37@',
    objectId: '@I12@',
    evidenceIds: ['ev-video-tzila-duberstein-01'],
    confidence: 'direct',
  },
  {
    id: 'claim-vladimir-parent-vola',
    type: 'parent',
    subjectId: '@I36@',
    objectId: '@I60@',
    evidenceIds: ['ev-video-tzila-duberstein-01'],
    confidence: 'direct',
  },
  {
    id: 'claim-sofia-parent-vola',
    type: 'parent',
    subjectId: '@I37@',
    objectId: '@I60@',
    evidenceIds: ['ev-video-tzila-duberstein-01'],
    confidence: 'direct',
  },
  {
    id: 'claim-leiba-spouse-bashata',
    type: 'spouse',
    subjectId: '@I86@',
    value: 'Bashata',
    evidenceIds: ['ev-video-tzila-ginzburg-01'],
    confidence: 'partial',
    note: 'Oral testimony supports this pairing, but household history contains ambiguity.',
  },
  {
    id: 'claim-gershon-spouse-fania-feigl',
    type: 'spouse',
    subjectId: '@I132@',
    value: 'Fania Feigl',
    evidenceIds: ['ev-video-tzila-ginzburg-01'],
    confidence: 'partial',
    note: 'Presentation-layer testimony reference only. Preserve uncertainty if the raw graph does not yet contain a canonical linked person record for Fania Feigl.',
  },
  {
    id: 'claim-gershon-parent-boris',
    type: 'parent',
    subjectId: '@I132@',
    objectId: '@I261@',
    evidenceIds: ['ev-video-tzila-ginzburg-01'],
    confidence: 'partial',
  },
  {
    id: 'claim-gershon-parent-ema',
    type: 'parent',
    subjectId: '@I132@',
    objectId: '@I268@',
    evidenceIds: ['ev-video-tzila-ginzburg-01'],
    confidence: 'partial',
  },
  {
    id: 'claim-gershon-parent-sioma',
    type: 'parent',
    subjectId: '@I132@',
    objectId: '@I262@',
    evidenceIds: ['ev-video-tzila-ginzburg-01'],
    confidence: 'partial',
  },
  {
    id: 'claim-gershon-parent-yudik',
    type: 'parent',
    subjectId: '@I132@',
    objectId: '@I3855@',
    evidenceIds: ['ev-video-tzila-ginzburg-01'],
    confidence: 'partial',
  },
];

const BRANCH_GENEALOGY_CLAIMS: GenealogyClaim[] = [
  {
    id: 'claim-arie-leib-identity',
    type: 'identity',
    subjectId: '@I86@',
    value: 'Arie-Leib Ginzburg',
    evidenceIds: ['raw-family-structure', 'livnat-report-cross-reference'],
    confidence: 'direct',
  },
  {
    id: 'claim-arie-leib-first-wife-unknown',
    type: 'branch-context',
    subjectId: '@I86@',
    value: 'Unknown wife (given name and maiden name unknown)',
    evidenceIds: ['raw-family-structure'],
    confidence: 'partial',
    note: 'Known child from this marriage: Eti Ginzburg Charny.',
  },
  {
    id: 'claim-yankel-berl-birth-1894-pleshchenitsy',
    type: 'identity',
    subjectId: '@I133@',
    value: 'Born in 1894 in Pleshchenitsy, Borisov District, Minsk Governorate, Russian Empire',
    evidenceIds: ['ev-document-yankel-berl-ginzburg-memoir-yiddish'],
    confidence: 'direct',
    note: 'Stated in first-person memoir text.',
  },
  {
    id: 'claim-yankel-berl-parent-arie-leib',
    type: 'parent',
    subjectId: '@I86@',
    objectId: '@I133@',
    evidenceIds: ['ev-document-yankel-berl-ginzburg-memoir-yiddish'],
    confidence: 'direct',
    note: 'Memoir explicitly names Arie-Leib Ginzburg as father.',
  },
  {
    id: 'claim-yankel-berl-parent-basia-bashata-landres',
    type: 'parent',
    subjectId: '@I87@',
    objectId: '@I133@',
    evidenceIds: ['ev-document-yankel-berl-ginzburg-memoir-yiddish'],
    confidence: 'direct',
    note: 'Memoir explicitly names Basia-Bashata née Landres as mother.',
  },
  {
    id: 'claim-arie-leib-role-melamed',
    type: 'branch-context',
    subjectId: '@I86@',
    value: 'Arie-Leib Ginzburg is described as a melamed for young children.',
    evidenceIds: ['ev-document-yankel-berl-ginzburg-memoir-yiddish'],
    confidence: 'direct',
    note: 'From the first-person memoir text.',
  },
  {
    id: 'claim-arie-leib-spouse-basia',
    type: 'spouse',
    subjectId: '@I86@',
    objectId: '@I87@',
    evidenceIds: ['raw-family-structure'],
    confidence: 'direct',
  },
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
  ...tzilaTestimonyClaims,
  {
    id: 'claim-vladimir-identity',
    type: 'identity',
    subjectId: '@I36@',
    value: 'Vladimir Duberstein',
    evidenceIds: ['ev-video-tzila-duberstein-01', 'ev-video-tzila-duberstein-02', 'raw-family-structure'],
    confidence: 'direct',
  },
  {
    id: 'claim-vladimir-parent-couple',
    type: 'branch-context',
    subjectId: '@I36@',
    value: 'Reuven and Rivka Duberstein',
    evidenceIds: ['raw-family-structure'],
    confidence: 'partial',
  },
  {
    id: 'claim-vladimir-children-summary',
    type: 'branch-context',
    subjectId: '@I36@',
    value: 'Ruven/Rube, Michael, Bashata Ema, Tzila Sara Tzipora, Vola',
    evidenceIds: ['ev-video-tzila-duberstein-01', 'ev-video-tzila-duberstein-02', 'raw-family-structure'],
    confidence: 'direct',
  },
  {
    id: 'claim-sofia-children-summary',
    type: 'branch-context',
    subjectId: '@I37@',
    value: 'Ruven/Rube, Michael, Bashata Ema, Tzila Sara Tzipora, Vola',
    evidenceIds: ['ev-video-tzila-duberstein-01', 'ev-video-tzila-duberstein-02', 'raw-family-structure'],
    confidence: 'direct',
  },
  {
    id: 'claim-ruven-identity',
    type: 'identity',
    subjectId: '@I58@',
    value: 'Ruven/Rube Duberstein (born 1920)',
    evidenceIds: ['ev-video-tzila-duberstein-01', 'raw-family-structure'],
    confidence: 'direct',
  },
  {
    id: 'claim-michael-identity',
    type: 'identity',
    subjectId: '@I59@',
    value: 'Michael Duberstein (born 1922; died in Poland before age two)',
    evidenceIds: ['ev-video-tzila-duberstein-01', 'raw-family-structure'],
    confidence: 'direct',
  },
  {
    id: 'claim-bashata-identity',
    type: 'identity',
    subjectId: '@I61@',
    value: 'Bashata Ema Duberstein (born 1924)',
    evidenceIds: ['ev-video-tzila-duberstein-01', 'raw-family-structure'],
    confidence: 'direct',
  },
  {
    id: 'claim-tzila-identity',
    type: 'identity',
    subjectId: '@I12@',
    value: 'Tzila Sara Tzipora Duberstein later Alperovitz (born 1926; probably in Haifa)',
    evidenceIds: ['ev-video-tzila-duberstein-01', 'ev-video-tzila-duberstein-02', 'cilia-migration-note'],
    confidence: 'partial',
  },
  {
    id: 'claim-vola-identity',
    type: 'identity',
    subjectId: '@I60@',
    value: 'Vola Duberstein (born 1928; probably in Tel Aviv)',
    evidenceIds: ['ev-video-tzila-duberstein-01', 'raw-family-structure'],
    confidence: 'partial',
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
    id: 'claim-leiba-multiple-wives',
    type: 'branch-context',
    subjectId: '@I86@',
    value: 'Leiba Ginzburg, senior figure with multiple wives',
    evidenceIds: ['ev-video-tzila-ginzburg-01', 'raw-family-structure'],
    confidence: 'partial',
  },
  {
    id: 'claim-gershon-identity',
    type: 'identity',
    subjectId: '@I132@',
    value: 'Gershon (Grigory) Ginzburg',
    evidenceIds: ['ev-video-tzila-ginzburg-01', 'raw-family-structure', 'livnat-report-cross-reference'],
    confidence: 'direct',
  },
  {
    id: 'claim-gershon-children-summary',
    type: 'branch-context',
    subjectId: '@I132@',
    value: 'Boris, Ema, Sioma, and Yudik/Yudel',
    evidenceIds: ['ev-video-tzila-ginzburg-01', 'raw-family-structure', 'livnat-report-cross-reference'],
    confidence: 'partial',
  },
  {
    id: 'claim-esther-stepchildren-not-biological',
    type: 'branch-context',
    subjectId: '@I86@',
    value: 'Dobe, Dora, and Haim',
    evidenceIds: ['raw-family-structure'],
    confidence: 'partial',
    note: 'Household children associated with Esther Lipschitz in display; keep them distinct from biological children.',
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
  return BRANCH_EVIDENCE.filter((item) => {
    const anchors = getEvidenceAnchors(item);
    return anchors.includes(personId);
  });
}

function getEvidenceAnchors(item: BranchEvidenceItem): string[] {
  switch (item.type) {
    case 'video-testimony':
      return [
        item.speakerPersonId,
        ...(item.relatedPersonIds || []),
        ...(item.personIds || []),
      ];
    case 'family-photo':
    case 'portrait':
    case 'annotated-photo':
    case 'document-scan':
      return item.relatedPersonIds || [];
    default:
      return item.personIds || [];
  }
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
