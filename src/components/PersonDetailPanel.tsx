import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Person, Family } from '../types';
import { DEFAULT_FILTERS, isUnknownPlaceholderPerson, type Filters } from './FilterPanel';
import { getCanonicalSurnameLabel } from '../utils/surname';
import { formatDateConcise } from '../utils/formatters';
import { StoryModal } from './StoryModal';
import { useIsMobile } from '../hooks/useIsMobile';
import { X } from 'lucide-react';
import {
  Dna, Swords, GitMerge, Shield, Star, BookMarked, Scroll, Landmark, Ship, BookOpen,
  type LucideIcon,
} from 'lucide-react';
import CollapsibleSection from './CollapsibleSection';
import { ArchivalCard } from './ArchivalCard';
import { BranchEvidenceCard } from './BranchEvidenceCard';
import { EvidenceBadge } from './EvidenceBadge';
import { RelationshipChip } from './RelationshipChip';
import {
  type BranchRelationshipNote,
  getCanonicalGinzburgLiandresDisplayName,
  getGinzburgLiandresAliases,
  getGinzburgLiandresDisplayProfile,
  getGinzburgLiandresClaimsForPerson,
  getGinzburgLiandresEvidenceForPerson,
  getGinzburgLiandresRelationshipOverlay,
  getGinzburgLiandresRelationshipNotes,
  isGinzburgLiandresBranchPerson,
} from '../branches/ginzburgLiandres';
import type { BranchEvidenceItem, GenealogyClaim } from '../types/genealogy';

const TAG_ICONS: Record<string, { Icon: LucideIcon; color: string; bg: string; labelEn: string; labelHe: string }> = {
  DNA:       { Icon: Dna,          color: '#065f46', bg: '#d1fae5', labelEn: 'DNA',             labelHe: 'DNA' },
  Partisan:  { Icon: Shield,       color: '#374151', bg: '#f3f4f6', labelEn: 'Partisan',         labelHe: 'פרטיזן' },
  Famous:    { Icon: Star,         color: '#92400e', bg: '#fef3c7', labelEn: 'Notable',           labelHe: 'מפורסם' },
  Rabbi:     { Icon: BookMarked,   color: '#1e40af', bg: '#dbeafe', labelEn: 'Rabbi',             labelHe: 'רב' },
  Lineage:   { Icon: Scroll,       color: '#5b21b6', bg: '#ede9fe', labelEn: 'Notable lineage',   labelHe: 'ייחוס' },
  Heritage:  { Icon: Landmark,     color: '#065f46', bg: '#d1fae5', labelEn: 'Jewish heritage',   labelHe: 'מסורת' },
  Migration: { Icon: Ship, color: '#0e7490', bg: '#cffafe', labelEn: 'Migration', labelHe: 'הגירה' },
  warCasualty:    { Icon: Swords,    color: '#991b1b', bg: '#fee2e2', labelEn: 'War casualty',    labelHe: 'נפל במלחמה' },
  doubleBloodTie: { Icon: GitMerge, color: '#6d28d9', bg: '#ede9fe', labelEn: 'Double blood tie', labelHe: 'קשר דם כפול' },
};

interface Props {
  person: Person;
  persons: Map<string, Person>;
  families: Map<string, Family>;
  rootPersonId?: string;
  activeFilters: Filters;
  isConnectedToYael: boolean;
  onNavigate: (personId: string) => void;
  onClose: () => void;
  onShowSubtree?: (personId: string) => void;
  language?: 'en' | 'he';
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 py-1 border-b border-gray-100">
      <span className="text-gray-500 text-sm min-w-[80px]">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function PersonLink({ id, persons, onNavigate }: { id: string; persons: Map<string, Person>; onNavigate: (id: string) => void }) {
  const p = persons.get(id);
  if (!p) return <span className="text-gray-400 text-sm">{id}</span>;
  const label = isGinzburgLiandresBranchPerson(p)
    ? getCanonicalGinzburgLiandresDisplayName(p)
    : p.fullName;
  return (
    <button
      className="text-blue-600 hover:text-blue-800 text-sm underline text-right"
      onClick={() => onNavigate(id)}
    >
      {label}
    </button>
  );
}

function DataStatusBadge({
  tone,
  label,
}: {
  tone: 'verified' | 'inferred' | 'computed' | 'manual';
  label: string;
}) {
  const styles: Record<typeof tone, string> = {
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inferred: 'bg-amber-50 text-amber-700 border-amber-200',
    computed: 'bg-sky-50 text-sky-700 border-sky-200',
    manual: 'bg-violet-50 text-violet-700 border-violet-200',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles[tone]}`}>
      {label}
    </span>
  );
}

function mostCommonNonEmpty(values: string[]): string | null {
  const counts = new Map<string, { label: string; count: number }>();
  for (const raw of values) {
    const value = raw.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    const current = counts.get(key);
    if (current) {
      current.count += 1;
    } else {
      counts.set(key, { label: value, count: 1 });
    }
  }
  if (counts.size === 0) return null;
  return Array.from(counts.values())
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.label.length - a.label.length;
    })[0].label;
}

function collectAncestors(
  personId: string,
  persons: Map<string, Person>,
  families: Map<string, Family>,
  maxDepth: number = 6
): Set<string> {
  const ancestors = new Set<string>();
  const visited = new Set<string>();

  function walk(id: string, depth: number) {
    if (depth < 0 || visited.has(id)) return;
    visited.add(id);
    const person = persons.get(id);
    if (!person?.familyAsChild) return;
    const family = families.get(person.familyAsChild);
    if (!family) return;
    for (const parentId of family.spouses) {
      if (!ancestors.has(parentId)) ancestors.add(parentId);
      walk(parentId, depth - 1);
    }
  }

  walk(personId, maxDepth);
  return ancestors;
}

function hasSharedAncestor(
  personAId: string,
  personBId: string,
  persons: Map<string, Person>,
  families: Map<string, Family>
): boolean {
  const aAncestors = collectAncestors(personAId, persons, families);
  const bAncestors = collectAncestors(personBId, persons, families);
  for (const ancestorId of aAncestors) {
    if (bAncestors.has(ancestorId)) return true;
  }
  return false;
}

function normalizeSurnameToken(value: string | null | undefined): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\u0590-\u05ff]/g, '');
}

function isAlperovitzKastrollCluster(person: Person): boolean {
  const hay = [
    person.surnameFinal,
    person.surname,
    person.birthName,
    person.fullName,
  ]
    .map(normalizeSurnameToken)
    .join(' ');
  return (
    /alperov|alperovitch|alperowitz|halperov/.test(hay) ||
    /kastroll|kastrol|kastrel|kostrel|costrel|castro|kestrel|gurev/.test(hay)
  );
}

function buildBloodAdjacency(persons: Map<string, Person>, families: Map<string, Family>): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  for (const id of persons.keys()) adjacency.set(id, new Set<string>());

  for (const family of families.values()) {
    for (const parentId of family.spouses) {
      if (!adjacency.has(parentId)) continue;
      for (const childId of family.children) {
        if (!adjacency.has(childId)) continue;
        adjacency.get(parentId)!.add(childId);
        adjacency.get(childId)!.add(parentId);
      }
    }

    // Keep sibling relation as a direct blood edge to avoid duplicate
    // parent-route alternatives in path explanations.
    const visibleChildren = family.children.filter(id => adjacency.has(id));
    for (let i = 0; i < visibleChildren.length; i += 1) {
      for (let j = i + 1; j < visibleChildren.length; j += 1) {
        const a = visibleChildren[i];
        const b = visibleChildren[j];
        adjacency.get(a)!.add(b);
        adjacency.get(b)!.add(a);
      }
    }
  }

  return adjacency;
}

function bfsDistances(startId: string, adjacency: Map<string, Set<string>>): Map<string, number> {
  const dist = new Map<string, number>();
  if (!adjacency.has(startId)) return dist;

  const queue: string[] = [startId];
  dist.set(startId, 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDist = dist.get(current)!;
    for (const next of adjacency.get(current) || []) {
      if (dist.has(next)) continue;
      dist.set(next, currentDist + 1);
      queue.push(next);
    }
  }

  return dist;
}

function getShortestPathExamples(
  rootId: string,
  targetId: string,
  adjacency: Map<string, Set<string>>,
  maxPaths: number = 3
): string[][] {
  if (rootId === targetId) return [[rootId]];

  const distFromRoot = bfsDistances(rootId, adjacency);
  const shortestDistance = distFromRoot.get(targetId);
  if (shortestDistance === undefined) return [];

  const distToTarget = bfsDistances(targetId, adjacency);
  const results: string[][] = [];
  const path: string[] = [rootId];

  function dfs(currentId: string) {
    if (results.length >= maxPaths) return;
    if (currentId === targetId) {
      results.push([...path]);
      return;
    }

    const currentDist = distFromRoot.get(currentId);
    if (currentDist === undefined) return;

    const neighbors = Array.from(adjacency.get(currentId) || [])
      .sort((a, b) => a.localeCompare(b));

    for (const nextId of neighbors) {
      if (results.length >= maxPaths) return;
      const nextDist = distFromRoot.get(nextId);
      const nextToTarget = distToTarget.get(nextId);
      if (nextDist === undefined || nextToTarget === undefined) continue;

      // Stay inside shortest-path DAG from root -> target.
      if (nextDist !== currentDist + 1) continue;
      if (nextDist + nextToTarget !== shortestDistance) continue;

      path.push(nextId);
      dfs(nextId);
      path.pop();
    }
  }

  dfs(rootId);
  return results;
}

export function PersonDetailPanel({
  person,
  persons,
  families,
  rootPersonId = '@I1@',
  activeFilters,
  isConnectedToYael,
  onNavigate,
  onClose,
  onShowSubtree,
  language = 'en',
}: Props) {
  const t = language === 'he';
  const [showPathDetails, setShowPathDetails] = useState(false);
  const [showWhyShown, setShowWhyShown] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const isUnknownPlaceholder = isUnknownPlaceholderPerson(person);
  const branchProfile = useMemo(() => getGinzburgLiandresDisplayProfile(person), [person]);
  const branchAliases = useMemo(() => getGinzburgLiandresAliases(person), [person]);
  const branchEvidence = useMemo(() => getGinzburgLiandresEvidenceForPerson(person.id), [person.id]);
  const branchClaims = useMemo(() => getGinzburgLiandresClaimsForPerson(person.id), [person.id]);
  const branchOverlay = useMemo(() => getGinzburgLiandresRelationshipOverlay(person.id), [person.id]);
  const branchRelationshipNotes = useMemo(() => getGinzburgLiandresRelationshipNotes(person.id), [person.id]);
  const personDisplayName = isUnknownPlaceholder
    ? (t ? 'אדם לא מזוהה' : 'Unknown person')
    : branchProfile?.canonicalDisplayName || person.fullName;

  // Find parents
  const parentFamily = person.familyAsChild ? families.get(person.familyAsChild) : null;
  const parents = parentFamily?.spouses || [];

  // Find spouses and children
  const spouseFamilies = person.familiesAsSpouse.map(fid => families.get(fid)).filter(Boolean) as Family[];
  const spouses = new Set<string>();
  const children: string[] = [];
  for (const fam of spouseFamilies) {
    for (const sid of fam.spouses) {
      if (sid !== person.id) spouses.add(sid);
    }
    children.push(...fam.children);
  }
  const spouseSurnameCandidates = Array.from(spouses)
    .map(id => {
      const spouse = persons.get(id);
      return spouse?.surnameFinal || spouse?.surname || '';
    })
    .filter(Boolean);
  const marriedSurnameFromSpouse = mostCommonNonEmpty(spouseSurnameCandidates);

  const baseSurname = (person.surname || '').trim();
  const currentSurname = (person.surnameFinal || '').trim();
  const hasSurnameChange =
    baseSurname.length > 0 &&
    currentSurname.length > 0 &&
    baseSurname.toLowerCase() !== currentSurname.toLowerCase();
  const hasAnySpouseFamily = person.familiesAsSpouse.length > 0;
  const marriedSurnameRaw =
    marriedSurnameFromSpouse ||
    (currentSurname.length > 0 && (hasSurnameChange || hasAnySpouseFamily) ? currentSurname : null);
  // Do not repeat "Current/Married surname" when it matches the Surname row (surnameFinal).
  // Don't show "Current/Married surname" when it's identical to surnameFinal —
  // that field is already displayed as "Surname" above, so it would be a duplicate.
  const marriedSurname =
    marriedSurnameRaw && marriedSurnameRaw.toLowerCase() !== currentSurname.toLowerCase()
      ? marriedSurnameRaw
      : null;
  const originalSurname = hasSurnameChange ? baseSurname : null;
  const formerSurnameInline =
    originalSurname
      ? (t ? `לשעבר: ${originalSurname}` : `Formerly: ${originalSurname}`)
      : null;
  const spouseRelationFlags = new Map<string, boolean>();
  const spouseClusterMarriageFlags = new Map<string, boolean>();
  for (const spouseId of spouses) {
    const spouse = persons.get(spouseId);
    spouseRelationFlags.set(
      spouseId,
      hasSharedAncestor(person.id, spouseId, persons, families)
    );
    spouseClusterMarriageFlags.set(
      spouseId,
      !!spouse && isAlperovitzKastrollCluster(person) && isAlperovitzKastrollCluster(spouse)
    );
  }
  const hasClusterMarriageSignal = Array.from(spouseClusterMarriageFlags.values()).some(Boolean);

  // Find siblings
  const siblings = parentFamily
    ? parentFamily.children.filter(id => id !== person.id)
    : [];

  const shortestPathExamples = useMemo(() => {
    if (!person.doubleBloodTie) return [];
    const adjacency = buildBloodAdjacency(persons, families);
    return getShortestPathExamples(rootPersonId, person.id, adjacency, 4);
  }, [person.doubleBloodTie, person.id, persons, families, rootPersonId]);

  const trustBadges = useMemo(() => {
    const badges: Array<{ tone: 'verified' | 'inferred' | 'computed' | 'manual'; label: string }> = [];
    if (person.tags.includes('DNA')) {
      badges.push({ tone: 'verified', label: t ? 'קשרי DNA מאומתים' : 'Verified DNA links' });
    }
    if (person.doubleBloodTie) {
      badges.push({ tone: 'computed', label: t ? 'מסלולי קרבה מחושבים' : 'Computed kinship paths' });
    }
    if (person.holocaustVictim || person.warCasualty || !!person.migrationInfo) {
      badges.push({ tone: 'inferred', label: t ? 'סימון מבוסס כללים' : 'Rule-based signal' });
    }
    return badges;
  }, [person.tags, person.doubleBloodTie, person.holocaustVictim, person.warCasualty, person.migrationInfo, t]);

  const activeFilterReasons = useMemo(() => {
    const reasons: string[] = [];
    const f = activeFilters;
    const d = DEFAULT_FILTERS;

    const generationChanged = f.generationMin !== d.generationMin || f.generationMax !== d.generationMax;
    if (generationChanged && person.generation !== null && person.generation >= f.generationMin && person.generation <= f.generationMax) {
      reasons.push(t ? `בתוך טווח דורות ${f.generationMin} עד ${f.generationMax}` : `Within generation range ${f.generationMin} to ${f.generationMax}`);
    }
    if (f.sex !== d.sex && person.sex === f.sex) {
      reasons.push(t ? `תואם פילטר מין (${f.sex === 'M' ? 'זכר' : 'נקבה'})` : `Matches sex filter (${f.sex === 'M' ? 'Male' : 'Female'})`);
    }
    if (f.surname !== d.surname && getCanonicalSurnameLabel(person.surnameFinal || person.surname || '') === f.surname) {
      reasons.push(t ? `תואם פילטר שם משפחה (${f.surname})` : `Matches surname filter (${f.surname})`);
    }
    if (f.connectedToYaelOnly && isConnectedToYael) {
      reasons.push(t ? 'מחובר ליעל' : 'Connected to Yael');
    }
    if (f.hasDna && person.tags.includes('DNA')) {
      reasons.push(t ? 'מסומן בקשרי DNA מאומתים' : 'Tagged with verified DNA links');
    }
    if (f.holocaustVictimsOnly && person.holocaustVictim) {
      reasons.push(t ? 'מסומן כקורבן שואה' : 'Marked as Holocaust victim');
    }
    if (f.hasHeritageTag && person.tags.includes('Heritage')) {
      reasons.push(t ? 'כולל תג מורשת' : 'Includes Heritage tag');
    }
    if (f.hasPartisanTag && person.tags.includes('Partisan')) {
      reasons.push(t ? 'כולל תג פרטיזן/מחתרת' : 'Includes Partisan/Resistance tag');
    }
    if (f.hasFamousTag && person.tags.includes('Famous')) {
      reasons.push(t ? 'כולל תג מפורסמים' : 'Includes Famous tag');
    }
    if (f.hasRabbiTag && person.tags.includes('Rabbi')) {
      reasons.push(t ? 'כולל תג רבנים' : 'Includes Rabbi tag');
    }
    if (f.hasLineageTag && person.tags.includes('Lineage')) {
      reasons.push(t ? 'כולל תג ייחוס' : 'Includes Lineage tag');
    }
    if (f.hasMigrationTag && person.tags.includes('Migration')) {
      reasons.push(t ? 'כולל תג הגירה' : 'Includes Migration tag');
    }
    if (f.hasDoubleBloodTieTag && person.tags.includes('DoubleBloodTie') && (person.connectionPathCount || 0) >= f.doubleBloodTieMinPaths) {
      reasons.push(
        t
          ? `קשרי דם כפולים (מינימום ${f.doubleBloodTieMinPaths})`
          : `Double blood ties (min ${f.doubleBloodTieMinPaths})`
      );
    }
    if (f.maxHops !== null && person.hops !== null && person.hops <= f.maxHops) {
      reasons.push(t ? `קפיצות ליעל עד ${f.maxHops}` : `Hops to Yael up to ${f.maxHops}`);
    }

    return reasons;
  }, [activeFilters, person, isConnectedToYael, t]);

  const isMobile = useIsMobile();
  const displayBirthDate = branchProfile?.conciseBirthDate || formatDateConcise(person.birthDate);
  const displayDeathDate = branchProfile?.conciseDeathDate || formatDateConcise(person.deathDate);
  const timelineItems = [
    displayBirthDate
      ? {
          label: t ? 'לידה' : 'Birth',
          value: [displayBirthDate, person.birthPlace].filter(Boolean).join(' - '),
        }
      : null,
    displayDeathDate
      ? {
          label: t ? 'פטירה' : 'Death',
          value: displayDeathDate,
        }
      : null,
    person.migrationInfo
      ? {
          label: t ? 'הגירה' : 'Migration',
          value: person.migrationInfo,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  const branchUi = t
    ? {
        packageLabel: 'חבילת ענף',
        branchName: 'ענף Ginzburg-Liandres',
        openBranchPage: 'פתח את דף הענף',
        halfSister: 'אחות למחצה',
        thirdMarriageCluster: 'אשכול נישואין שלישי',
        maternalLine: 'הקו האימהי',
        secondMarriageCluster: 'אשכול נישואין שניים',
        borisovCluster: 'אשכול בוריסוב',
      }
    : {
        packageLabel: 'Branch package',
        branchName: 'Ginzburg-Liandres branch',
        openBranchPage: 'Open branch page',
        halfSister: 'Half-sister',
        thirdMarriageCluster: 'Third marriage cluster',
        maternalLine: 'Maternal line',
        secondMarriageCluster: 'Second marriage cluster',
        borisovCluster: 'Borisov cluster',
      };
  const branchEvidenceCopy: Record<string, Partial<BranchEvidenceItem>> = t
    ? {
        'maternal-line-mtdna': {
          title: 'עוגן mtDNA לקו האימהי',
          description:
            'Sofia נחשבת כאן לנקודת העיגון האימהית המוקדמת ביותר בסיכום הנוכחי, ושכבת התצוגה משמרת את השרשרת Basia -> Sofia -> Tzila Cilia -> Pola -> Yael.',
          note: 'ראיה חלקית בלבד. רמז ה-mtDNA תומך במסגרת הקו האימהי אך אינו פותר לבדו כל קשר היסטורי ביניים.',
        },
        'daniel-ginzburg-dna': {
          title: 'רמז DNA לאשכול שם המשפחה Ginzburg-Liandres',
          description:
            'הערות ההתאמה מציינות את Landres / Liandres בתוך אשכול שם המשפחה Ginzburg, ולכן שכבת התצוגה יכולה לאחד וריאנטים מבלי לפצל זהויות תצוגה נפרדות.',
          note: 'רמז הקשרי בלבד. הוא תומך בקיבוץ וריאנטים של שם המשפחה, אך אינו מספיק לבדו לשחזור מלא של הענף.',
        },
        'cilia-migration-note': {
          title: 'הערת הגירה ל-Cilia / Tzila',
          description:
            'המידע הקיים מציין לידה בחיפה בתקופת המנדט הבריטי, מוצא משפחתי מאזור Pleshchenitsy, וחזרה לבלרוס סביב 1930.',
          note: 'נשמר כטיפוס הערת מחקר מן שכבת הנתונים הקיימת. יש לקרוא אותו כהקשר ארכיוני, לא כהוכחה עצמאית.',
        },
        'cilia-myheritage-summary': {
          title: 'סיכום עדכון MyHeritage ל-Cilia Sara Duberstein',
          description:
            'סיכום ביקורת מקומית מציין עדכון אחד נוסף הקשור לאחים עבור Cilia Sara Duberstein (Alperovitch), הסבתא האימהית בהקשר ענפי זה.',
          note: 'זהו סיכום מסמך מחקר משני, לא רשומת המקור הראשונית עצמה.',
        },
        'ev-image-aharon-military-portrait': {
          title: 'דיוקן משויך ל־Aharon Ginzburg',
          description: 'דיוקן ארכיוני המשויך לפי הזיהוי המשפחתי ל־Aharon Ginzburg.',
          note: 'השנה והזיהוי נשענים על הייחוס המשפחתי הנוכחי.',
          source: 'חומרי Ginzburg שהועלו',
        },
        'ev-image-berl-yakov-ginzburg-1944': {
          title: 'דיוקן משויך ל־Yankel Berl Ginzburg',
          description: 'דיוקן ארכיוני משופר המשויך לפי הזיהוי המשפחתי ל־Yankel Berl Ginzburg.',
          note: 'הייחוס המשפחתי המוצג הוא ל־Yankel Berl Ginzburg, ויש לשמר אותו כתיוג ארכיוני שניתן לבחינה מחודשת.',
          source: 'שם קובץ בארכיון המשפחתי והקשר מחקרי ענפי',
        },
        'ev-image-zinaida-dubershtein-ginzburg-portrait': {
          title: 'דיוקן משויך ל־Dr. Zinaida Zina Dubershtein (Ginzburg)',
          description: 'דיוקן ארכיוני המשויך לפי הזיהוי המשפחתי ל־Dr. Zinaida Zina Dubershtein (Ginzburg).',
          note: 'הזיהוי נשען על הייחוס המשפחתי הנוכחי, ויש להשאירו פתוח לבדיקה עד לאישור נוסף ממקור מתוארך או ממקור מקביל.',
          source: 'ארכיון משפחתי',
        },
        'ev-image-zinaida-dubershtein-ginzburg-portrait-alt': {
          title: 'דיוקן חלופי משויך ל־Dr. Zinaida Zina Dubershtein (Ginzburg)',
          description: 'גרסה חלופית של דיוקן ארכיוני המשויך לפי הזיהוי המשפחתי ל־Dr. Zinaida Zina Dubershtein (Ginzburg).',
          note: 'יש להתייחס לגרסה זו כזהה לדיוקן הראשון רק אם הארכיון המשפחתי מאשר ששני הסרוקים אכן שייכים לאותה דמות.',
          source: 'ארכיון משפחתי',
        },
        'ev-image-cilia-two-person-portrait': {
          title: 'דיוקן של Tzila Cilia Duberstein Alperovitz עם תינוק',
          description: 'צילום זוגי שבו Cilia מופיעה עם תינוק. הזיהוי של המבוגר חזק; זהות התינוק נשמרת כמשוערת.',
          note: 'יש לשמור את זהות התינוק כמשוערת עד להתאמה חזקה יותר של הצילום.',
          source: 'חומרי Ginzburg שהועלו',
        },
        'ev-image-ginzburg-family-1946-annotated': {
          title: 'תצלום משפחתי מסומן של Ginzburg',
          description: 'תצלום משפחתי מסומן מתוך סט חומרי Ginzburg לשנת 1946.',
          note: 'סימוני ההערה הם חלק מהתמונה המקורית; חלק מהזיהויים נותרים פרשניים.',
          source: 'חומרי Ginzburg שהועלו',
        },
        'ev-image-ginzburg-family-1946-clean': {
          title: 'תצלום משפחתי נקי של Ginzburg',
          description: 'גרסה נקייה של התצלום המשפחתי מתוך אותו סט חומרי Ginzburg לשנת 1946.',
          note: 'השתמשו בגרסה זו כנקודת ייחוס לא מסומנת של אותו מבנה משפחתי.',
          source: 'חומרי Ginzburg שהועלו',
        },
        'ev-image-ginzburg-family-annotated-group': {
          title: 'תצלום משפחתי מסומן של Ginzburg',
          description: 'תצלום משפחתי עם שורות זיהוי בכתב יד ושמות שנוספו מאוחר יותר לצורך זיהוי עבודה.',
          note: 'זהו צילום מחקרי מסומן. יש להתייחס לזיהויים האישיים כאל תוויות עבודה משפחתיות, אלא אם יאומתו בכיתוב מקורי או במקור מקביל.',
          source: 'תצלום הפניה מסומן מתוך הארכיון המשפחתי',
        },
        'ev-image-ginzburg-duberstein-family-group-identified': {
          title: 'צילום משפחתי קבוצתי מזוהה של משפחת Ginzburg–Duberstein',
          description: 'צילום משפחתי קבוצתי עם זיהוי משפחתי מפורט של בני ובנות משפחות Ginzburg, Duberstein, Meirson ו־Charny.',
          note: 'הזיהוי מבוסס על מיפוי משפחתי. התמונה מחברת בין קווי Ginzburg, Duberstein, Meirson, Charny, Hudenko ו־Sokolov. הילד היושב מתחת ל־Roman Ginzburg מזוהה לפי ההערה המשפחתית כ־Yehuda(Yuri) Ginzburg (1933–1960).',
          source: 'ארכיון משפחתי עם זיהוי שסופק על ידי המשפחה',
        },
        'ev-image-ginzburg-family-group-1946-a': {
          title: 'צילום משפחתי של משפחת Ginzburg, בלארוס שלאחר המלחמה (גרסה א)',
          description: 'צילום משפחתי נקי מהתקופה שלאחר המלחמה, שנשמר ללא שכבת הכיתוב בכתב יד.',
          note: 'מומלץ להשתמש בגרסה זו יחד עם התמונה המזוהה ועם ההערות המשפחתיות לצורך זיהוי עבודה.',
          source: 'ארכיון משפחתי',
        },
        'ev-image-ginzburg-family-group-1946-b': {
          title: 'צילום משפחתי של משפחת Ginzburg, בלארוס שלאחר המלחמה (גרסה ב)',
          description: 'גרסה נוספת של צילום משפחתי קבוצתי מאותו הקשר משפחתי רחב שלאחר המלחמה.',
          note: 'יש להשאיר זיהויים אישיים ברמת ודאות חלקית, אלא אם ניתן לקשור אותם לתמונה המזוהה או למקור נוסף.',
          source: 'ארכיון משפחתי',
        },
        'ev-document-yankel-berl-ginzburg-autobiography': {
          title: 'מסמך אוטוביוגרפי סרוק המקושר ל-Yankel Berl Ginzburg',
          description: 'סריקה ארכיונית של טופס ביוגרפי או אוטוביוגרפי ברוסית הכולל מידע משפחתי ופרטי הורים.',
          note: 'המסמך הוא ראיה ראשונית כפריט ארכיוני, אך כל תמלול או פרשנות ממנו צריכים להישאר ניתנים לבדיקה נפרדת.',
          source: 'סריקת מסמך מארכיון משפחתי',
        },
        'ev-document-yankel-berl-ginzburg-memoir-yiddish': {
          title: 'זיכרון קצר של Yankel-Berl Ginzburg (כתב יד ביידיש)',
          description:
            'טקסט זיכרון ביידיש המשויך ל־Yankel-Berl Ginzburg, המתאר לידה ב־1894 ב־Pleshchenitsy ומציין את הוריו Arie-Leib Ginzburg ו־Basia-Bashata née Landres.',
          note:
            'זהו טקסט אוטוביוגרפי ראשוני מתוך המשפחה. לפי הזיכרון, Yankel-Berl Ginzburg נולד ב־1894 ב־Pleshchenitsy, מחוז Borisov, מחוז Minsk; אביו Arie-Leib Ginzburg שימש melamed לילדים קטנים; ואמו הייתה Basia-Bashata née Landres.',
          source: 'ארכיון משפחתי, טקסט זיכרון ביידיש ותרגום משפחתי',
        },
        'ev-document-haifa-voters-list-1930': {
          title: 'רישום ברשימת הבוחרים של Haifa, 1930',
          description: 'עמוד סרוק מרשימת הבוחרים של Haifa משנת 1930, הנשמר כמסמך תומך מתקופת ההגירה.',
          note:
            'זהו פריט תיעודי שימושי כרשומה אזרחית מתקופת המנדט הבריטי. יש להשאירו משויך לשכבת המחקר על ההגירה עד לחילוץ מלא של הערכים המשפחתיים המדויקים ואימותם.',
          source: 'עמוד רשימת בוחרים ארכיוני, Haifa, 1930',
        },
        'ev-image-tzila-family-testimony-scan': {
          title: 'עמוד סרוק מעדות משפחת Tzila',
          description: 'עמוד עדות סרוק בעברית, המשמר את הסיפור המשפחתי כצילום מסמך.',
          note: 'יש להתייחס אליו כצילום של ראיה תיעודית, לא כתמלול.',
          source: 'חומרי Ginzburg שהועלו',
        },
        'ev-image-cilia-alperovitz-liri-livnat-tal': {
          title: 'Tzila Cilia Alperovitz née Dubershtein עם Liri Livnat-Tal',
          description: 'צילום משפחתי מאוחר שבו נראית Tzila Cilia Alperovitz née Dubershtein מחזיקה את Liri Livnat-Tal.',
          note: 'צילום משפחתי מאוחר מתוך ארכיון הקו האימהי.',
          source: 'ארכיון משפחתי',
        },
        'ev-image-isaak-ginzburg-1936': {
          title: 'דיוקן משויך ל־Iche Isaak Ginzburg',
          description: 'דיוקן ארכיוני המשויך לפי הזיהוי המשפחתי ל־Iche Isaak Ginzburg.',
          note: 'השנה נשענת על הזיהוי המשפחתי הנוכחי.',
          source: 'ארכיון משפחתי',
        },
        'ev-image-tzila-prewar-class-photo-1941': {
          title: 'צילום כיתה לפני הפלישה הנאצית, משויך ל־Tzila Alperovitz née Dubershtein',
          description: 'צילום כיתה מסיום כיתה ח׳, מהתקופה שלפני הפלישה הנאצית, עם זיהוי משפחתי של Tzila Alperovitz née Dubershtein בפינה הימנית התחתונה, עם צמות.',
          note: 'לפי ההערה המשפחתית, Tzila Alperovitz née Dubershtein מופיעה בפינה הימנית התחתונה. התמונה מתוארת כצילום כיתה מסיום כיתה ח׳ מלפני הפלישה הנאצית. לפי הזיכרון המשפחתי, כמחצית מבני ובנות הכיתה נספו במהלך המלחמה בבלארוס.',
          source: 'הערת ארכיון משפחתי',
        },
        'ev-image-tzila-dubershtein-class-photo-pre-1941': {
          title: 'צילום כיתה לפני הפלישה הנאצית, משויך ל־Tzila Alperovitz née Dubershtein',
          description: 'צילום כיתה מסיום כיתה ח׳, מהתקופה שלפני הפלישה הנאצית, עם זיהוי משפחתי של Tzila Alperovitz née Dubershtein בפינה הימנית התחתונה, עם צמות.',
          note: 'לפי ההערה המשפחתית, Tzila Alperovitz née Dubershtein מופיעה בפינה הימנית התחתונה. התמונה מתוארת כצילום כיתה מסיום כיתה ח׳ מלפני הפלישה הנאצית. לפי הזיכרון המשפחתי, כמחצית מבני ובנות הכיתה נספו במהלך המלחמה בבלארוס.',
          source: 'ארכיון משפחתי עם הערת זיהוי מאוחרת',
        },
        'raw-family-structure': {
          title: 'הפניה מבנית לגרף המשפחה',
          description:
            'חבילת הענף שומרת את הגרף הגולמי כפי שהוא, ומעליו מוסיפה תיקוני תצוגה עבור מזהי המשפחה F19 / F71 לצורך סדר בני זוג ופרשנות אחים למחצה.',
        },
        'livnat-report-cross-reference': {
          title: 'הפניה צולבת מדוח Livnat לשמות Ginzburg ו-Duberstein',
          description:
            'הדוח שנוצר כולל צורות שם מקבילות כגון Bashete Basia Ginzburg, Sofia Soshe Duberstein ו-Gershon Grigory Ginzburg, ולכן הוא תומך בקיבוץ וריאנטים לפי כינוי.',
          note: 'שימושי כהפניה לשמות וריאנטים; אין להתייחס אליו כמקור היסטורי ראשוני בפני עצמו.',
        },
      }
    : {};
  const branchResearchNoteCopy: Record<string, { title: string; detail: string }> = t
    ? {
        'arie-leib-marriages': {
          title: 'תיקון סדר הנישואין',
          detail:
            'שכבת התצוגה מתייחסת ל-Arie-Leib כמי שנשא תחילה אישה לא ידועה (השם הפרטי ושם הנעורים אינם ידועים) עם ילדה ידועה אחת, Eti Ginzburg Charny, אחר כך את Basia Liandres, ולבסוף את Esther Lipschitz. זהו תיקון הצגה המונח על הגרף הגולמי הקיים.',
        },
        'esther-stepchildren': {
          title: 'שמות הילדים המשויכים לבית Esther Lipschitz',
          detail:
            'שמות הילדים המשויכים לבית Esther Lipschitz בתצוגה: Dobe, Dora, and Haim. התצוגה שומרת על הבחנה בינם לבין ילדים ביולוגיים.',
        },
        'eti-half-sister': {
          title: 'Eti היא אחות למחצה',
          detail:
            'Eti Ginzburg Charny מוצגת כאחות למחצה של Sofia, Gershon, Aharon, Yankel Berl ו־Isaak, ולא כאחות מלאה.',
        },
        'ela-iche-ambiguity': {
          title: 'עמימות Ela / Iche',
          detail:
            'ייתכן ש־Ela / Iche מתייחס לאדם אחד או לשני אנשים בדור Duberstein; יש להשאיר זאת כעמימות בתצוגה.',
        },
        'iche-first-wife-household': {
          title: 'Iche בבית האישה הראשונה',
          detail:
            'Iche נשמר כאן כשיוך ביתי בדרגת ודאות נמוכה תחת ביתה של האישה הראשונה של Leiba.',
        },
        'asna-lifshitz-sister': {
          title: 'אי־ודאות סביב Asna Lifshitz',
          detail:
            'Asna Lifshitz עשויה להיות אחותה של Esther; יש לשמור זאת כקשר לא ודאי.',
        },
        'dobe-dora-haim-stepchildren': {
          title: 'שמות הילדים המשויכים לבית Esther Lipschitz',
          detail:
            'שמות הילדים המשויכים לבית Esther Lipschitz בתצוגה: Dobe, Dora, and Haim. התצוגה שומרת על הבחנה בינם לבין ילדים ביולוגיים.',
        },
      }
    : {};
  const branchClaimUi = t
    ? {
        sectionTitle: 'טענות גנאלוגיות',
        identity: 'זהות',
        parent: 'הורות',
        spouse: 'בן/בת זוג',
        maternalLine: 'קו אימהי',
        branchContext: 'הקשר ענפי',
        siblingStatus: 'סטטוס אחאות',
        confidenceLabel: 'ודאות',
        evidenceLabel: 'מזהי תיעוד',
        noClaims: 'אין כרגע טענות גנאלוגיות מצורפות.',
      }
    : {
        sectionTitle: 'Genealogy claims',
        identity: 'Identity',
        parent: 'Parent',
        spouse: 'Spouse',
        maternalLine: 'Maternal line',
        branchContext: 'Branch context',
        siblingStatus: 'Sibling status',
        confidenceLabel: 'Confidence',
        evidenceLabel: 'Evidence ids',
        noClaims: 'No genealogy claims attached yet.',
      };
  const claimConfidenceLabels: Record<GenealogyClaim['confidence'], string> = t
    ? {
        direct: 'ישיר',
        partial: 'חלקי',
        conflicting: 'סותר',
      }
    : {
        direct: 'Direct',
        partial: 'Partial',
        conflicting: 'Conflicting',
      };
  const branchClaimNoteCopy: Record<string, string> = t
    ? {
        'Canonical branch display name. Married surname should not replace maiden surname in normalized presentation.':
          'שם תצוגה קנוני של הענף. שם הנישואין לא אמור להחליף את שם הלידה בהצגה מנורמלת.',
        'Supported by oral testimony summary.':
          'נתמך בסיכום עדות בעל־פה.',
        'Ruven/Rube listed as child of Vladimir and Sofia.':
          'Ruven / Rube מופיע כילד של Vladimir ו־Sofia.',
        'Oral testimony supports this pairing, but household history contains ambiguity.':
          'העדות בעל־פה תומכת בזוגיות הזו, אך היסטוריית הבית כוללת עמימות.',
        'Presentation-layer testimony reference only. Preserve uncertainty if the raw graph does not yet contain a canonical linked person record for Fania Feigl.':
          'הפניה לעדות ברמת התצוגה בלבד. יש לשמר את העמימות אם הגרף הגולמי עדיין אינו מכיל רשומת אדם קנונית ומקושרת עבור Fania Feigl.',
        'Maternal-line anchor in the normalized branch chain. Preserve ambiguity if the raw graph does not yet contain a canonical linked person record for Druzia Lyandres.':
          'עוגן קו אימהי בשרשרת הענף המנורמלת. יש לשמר את העמימות אם הגרף הגולמי עדיין אינו מכיל רשומת אדם קנונית ומקושרת עבור Druzia Lyandres.',
        'Canonical normalized English display name for branch presentation.':
          'שם תצוגה אנגלי קנוני ומנורמל להצגת הענף.',
        'Stated in first-person memoir text.':
          'מצוין בטקסט זיכרון בגוף ראשון.',
        'Memoir explicitly names Arie-Leib Ginzburg as father.':
          'הזיכרון מציין במפורש את Arie-Leib Ginzburg כאב.',
        'Memoir explicitly names Basia-Bashata née Landres as mother.':
          'הזיכרון מציין במפורש את Basia-Bashata née Landres כאם.',
        'From the first-person memoir text.':
          'מתוך טקסט הזיכרון בגוף ראשון.',
      'Presentation-layer correction only. Current raw graph may not yet contain a canonical linked person record for Esther Lipschitz.':
          'תיקון שכבת תצוגה בלבד. הגרף הגולמי הנוכחי עדיין אינו מכיל רשומת אדם קנונית ומקושרת עבור Esther Lipschitz.',
      'Known child from this marriage: Eti Ginzburg Charny.':
          'הילדה הידועה מנישואין אלה: Eti Ginzburg Charny.',
      'Branch-context only. Preserve stepchildren as non-biological in the presentation layer.':
          'הקשר ענפי בלבד. שמות הילדים המשויכים לבית Esther Lipschitz בתצוגה: Dobe, Dora, and Haim. התצוגה שומרת על הבחנה בינם לבין ילדים ביולוגיים.',
      'This should be rendered explicitly as half-sibling status, not full sibling status.':
          'יש להציג זאת במפורש כסטטוס אחאות למחצה ולא כאחאות מלאה.',
      }
    : {};
  const translateBranchChip = (value: string): string => {
    if (!t) return value;
    const map: Record<string, string> = {
      'Half-sister': branchUi.halfSister,
      'Third marriage cluster': branchUi.thirdMarriageCluster,
      'Maternal line': branchUi.maternalLine,
      'Second marriage cluster': branchUi.secondMarriageCluster,
      'Borisov cluster': branchUi.borisovCluster,
    };
    return map[value] || value;
  };
  const translateBranchClaimNote = (value?: string): string | undefined => {
    if (!value) return undefined;
    if (!t) return value;
    return branchClaimNoteCopy[value] || value;
  };
  const translateBranchNote = (value: string): string => {
    if (!t) return value;
    const map: Record<string, string> = {
      'Current graph may under-specify this identity; display layer merges Ruve/Ruven/Roman variants for this branch.':
        'הגרף הנוכחי עשוי להגדיר את הזהות הזו באופן חסר; שכבת התצוגה מאחדת את הווריאנטים Ruve / Ruven / Roman עבור הענף הזה.',
      'Raw record currently uses variants that may collapse Aharon/Ore; branch display keeps Aharon as canonical.':
        'הרשומה הגולמית משתמשת בווריאנטים שעשויים לאחד את Aharon / Ore; תצוגת הענף שומרת על Aharon כצורה הקנונית.',
      'Eti is displayed as a half-sister of Sofia, Gershon, Aharon, Yankel Berl, and Isaak.':
        'Eti מוצגת כאחות למחצה של Sofia, Gershon, Aharon, Yankel Berl ו־Isaak.',
      'Sofia is displayed as a biological child of Arie-Leib Ginzburg and Basia Liandres.':
        'Sofia מוצגת כילדה ביולוגית של Arie-Leib Ginzburg ושל Basia Liandres.',
      'Aharon is displayed in the Basia Liandres child cluster.':
        'Aharon מוצג באשכול הילדים של Basia Liandres.',
      'Gershon/Grigory is displayed in the Basia Liandres child cluster with merged aliases.':
        'Gershon / Grigory מוצג באשכול הילדים של Basia Liandres עם כינויים מאוחדים.',
      'Yankel Berl remains a single display identity despite shortened-name variants.':
        'Yankel Berl נשאר זהות תצוגה אחת, למרות וריאנטים של שם מקוצר.',
      'Isaak remains in the Basia Liandres biological-child cluster.':
        'Isaak נשאר באשכול הילדים הביולוגיים של Basia Liandres.',
      'Display logic treats Arie-Leib as having an unknown first wife (given name and maiden name unknown) with known child Eti Ginzburg Charny, Basia Liandres as second wife, and Esther Lipschitz as third wife. This is a presentation correction layered over the current raw graph.':
        'שכבת התצוגה מתייחסת ל-Arie-Leib כמי שנשא תחילה אישה לא ידועה (השם הפרטי ושם הנעורים אינם ידועים) עם ילדה ידועה אחת, Eti Ginzburg Charny, אחר כך את Basia Liandres, ולבסוף את Esther Lipschitz. זהו תיקון הצגה המונח על הגרף הגולמי הקיים.',
    };
    return map[value] || value;
  };
  const getBranchClaimPersonLabel = (personId: string): string => {
    const p = persons.get(personId);
    if (!p) return personId;
    return isGinzburgLiandresBranchPerson(p)
      ? getCanonicalGinzburgLiandresDisplayName(p)
      : p.fullName;
  };
  const getBranchClaimLabel = (claim: GenealogyClaim): string => {
    const subjectLabel = getBranchClaimPersonLabel(claim.subjectId);
    const targetLabel = claim.objectId
      ? getBranchClaimPersonLabel(claim.objectId)
      : claim.value || '';
    switch (claim.type) {
      case 'identity':
        return `${branchClaimUi.identity}: ${claim.value || subjectLabel}`;
      case 'parent':
        return `${branchClaimUi.parent}: ${subjectLabel}${targetLabel ? ` → ${targetLabel}` : ''}`;
      case 'spouse':
        return `${branchClaimUi.spouse}: ${subjectLabel}${targetLabel ? ` ↔ ${targetLabel}` : ''}${claim.value && claim.value !== targetLabel ? ` (${claim.value})` : ''}`;
      case 'maternal-line':
        return claim.objectId
          ? `${branchClaimUi.maternalLine}: ${subjectLabel}${targetLabel ? ` → ${targetLabel}` : ''}`
          : `${branchClaimUi.maternalLine}: ${targetLabel || subjectLabel}${subjectLabel ? ` → ${subjectLabel}` : ''}`;
      case 'branch-context':
        return `${branchClaimUi.branchContext}: ${subjectLabel}${claim.value ? ` — ${claim.value}` : ''}`;
      case 'sibling-status':
        return `${branchClaimUi.siblingStatus}: ${subjectLabel}${claim.value ? ` — ${claim.value}` : ''}`;
      default:
        return subjectLabel;
    }
  };
  const translateBranchEvidence = (item: BranchEvidenceItem): BranchEvidenceItem => {
    const translated = {
      ...item,
      ...(branchEvidenceCopy[item.id] || {}),
    } as BranchEvidenceItem;
    if (translated.type === 'video-testimony') {
      return {
        ...translated,
        title: translated.shortTitleHe || translated.title,
        url: translated.url || `/${language}/branches/ginzburg-liandres#${translated.id}`,
      };
    }
    return translated;
  };
  const translateBranchResearchNote = (note: BranchRelationshipNote): BranchRelationshipNote => ({
    ...note,
    ...(branchResearchNoteCopy[note.id] || {}),
  });

  return (
    <div 
      className={`${isMobile 
        ? 'fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] rounded-t-2xl shadow-2xl' 
        : 'w-80 border-r shadow-lg'
      } bg-white h-full overflow-hidden flex flex-col`} 
      dir={t ? 'rtl' : 'ltr'}
    >
      {isMobile && (
        <div 
          className="fixed inset-0 z-[-1] bg-black/50"
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label={t ? 'סגור' : 'Close'}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
        />
      )}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-bold">{personDisplayName}</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          aria-label={t ? 'סגור' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
      {person.hebrewName && person.hebrewName !== person.fullName && (
        <div className="text-sm text-gray-600 mb-2">{person.hebrewName}</div>
      )}
      {isUnknownPlaceholder && (
        <div className="text-xs text-gray-500 mb-2">
          {t ? 'רשומת מקור לא מזוהה (Unknown/FNU).' : 'Unidentified source placeholder record (Unknown/FNU).'}
        </div>
      )}
      {formerSurnameInline && (
        <div className="text-xs text-gray-500 mb-2">{formerSurnameInline}</div>
      )}

      {branchProfile && (
        <div className="atlas-card-subtle mb-4 rounded-2xl p-3">
          <div className="atlas-kicker mb-2">{branchUi.packageLabel}</div>
          <div className="text-sm text-[var(--atlas-text)]">{branchUi.branchName}</div>
          {branchOverlay?.relationshipChips?.length ? (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {branchOverlay.relationshipChips.map((chip) => (
                <RelationshipChip key={chip} label={translateBranchChip(chip)} tone="violet" variant="atlas" />
              ))}
            </div>
          ) : null}
          <div className="text-sm text-[var(--atlas-text)]">
            {branchProfile.birthSurname ? (
              <div>{t ? 'שם לידה:' : 'Birth surname:'} <span className="font-medium">{branchProfile.birthSurname}</span></div>
            ) : null}
            {branchProfile.marriedSurname ? (
              <div>{t ? 'שם נישואין:' : 'Married surname:'} <span className="font-medium">{branchProfile.marriedSurname}</span></div>
            ) : null}
            {branchProfile.identityWarnings.map((warning) => (
              <div key={warning} className="mt-2 text-xs text-amber-700">{translateBranchNote(warning)}</div>
            ))}
            {branchOverlay?.notes?.map((note) => (
              <div key={note} className="mt-2 text-xs text-stone-500">{translateBranchNote(note)}</div>
            ))}
            <div className="mt-3">
              <Link
                to={`/${language}/branches/ginzburg-liandres`}
                className="atlas-link text-xs"
              >
                {branchUi.openBranchPage}
              </Link>
            </div>
          </div>
        </div>
      )}

      {trustBadges.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] text-gray-500 mb-1">{t ? 'אמינות נתון' : 'Data trust'}</div>
          <div className="flex flex-wrap gap-1">
            {trustBadges.map((badge, idx) => (
              <DataStatusBadge key={`${badge.label}-${idx}`} tone={badge.tone} label={badge.label} />
            ))}
          </div>
        </div>
      )}

      {onShowSubtree && (
        <button
          onClick={() => onShowSubtree(person.id)}
          className="w-full mb-3 py-1.5 px-3 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
        >
          {t ? `🌿 הצגת עץ משנה של ${person.givenName}` : `🌿 Show subtree of ${person.givenName}`}
        </button>
      )}

      <CollapsibleSection
        title={t ? 'זהות' : 'Identity'}
        icon="🪪"
        defaultOpen={true}
      >
        <div className="space-y-0">
          <InfoRow label={t ? 'קרבה ליעל' : 'Relation to Yael'} value={person.relationToYael} />
          <InfoRow label={t ? 'דור' : 'Generation'} value={person.generation?.toString()} />
          <InfoRow label={t ? 'קפיצות' : 'Hops'} value={person.hops?.toString()} />
          <InfoRow label={t ? 'מין' : 'Sex'} value={person.sex === 'M' ? (t ? 'זכר' : 'Male') : person.sex === 'F' ? (t ? 'נקבה' : 'Female') : (t ? 'לא ידוע' : 'Unknown')} />
          <InfoRow label={t ? 'תאריך לידה' : 'Birth date'} value={displayBirthDate} />
          <InfoRow label={t ? 'מקום לידה' : 'Birth place'} value={person.birthPlace} />
          <InfoRow label={t ? 'תאריך פטירה' : 'Death date'} value={displayDeathDate} />
          <InfoRow label={t ? 'שם בלידה' : 'Birth name'} value={person.birthName || branchProfile?.birthSurname} />
          <InfoRow label={t ? 'שם משפחה' : 'Surname'} value={branchProfile?.primarySurname || person.surnameFinal} />
          <InfoRow label={t ? 'שם משפחה קודם' : 'Former surname'} value={originalSurname || branchProfile?.birthSurname} />
          <InfoRow
            label={t ? 'שם משפחה נוכחי/נישואין' : 'Current/Married surname'}
            value={marriedSurname || branchProfile?.marriedSurname}
          />
          <InfoRow label={t ? 'מוצא משפחתי היסטורי' : 'Family heritage origin'} value={person.surnameOrigin} />
          <InfoRow label={t ? 'ייחוס יהודי' : 'Jewish lineage'} value={person.jewishLineage} />
          <InfoRow label={t ? 'הגירה' : 'Migration'} value={person.migrationInfo} />
          <InfoRow label={t ? 'מסלולי קרבה ליעל' : 'Connection paths to Yael'} value={person.connectionPathCount?.toString()} />
          {person.title && <InfoRow label={t ? 'תיאור' : 'Title'} value={person.title} />}
        </div>
      </CollapsibleSection>

      {(branchAliases.length > 0 || person.hebrewName) && (
        <CollapsibleSection title={t ? 'שמות ווריאנטים' : 'Name variants / aliases'} icon="🏷️">
          <div className="flex flex-wrap gap-2">
            {branchAliases.map((alias) => (
              <span
                key={alias}
                className={`rounded-full px-2.5 py-1 text-xs ${
                  branchProfile
                    ? 'atlas-pill text-[var(--atlas-text)]'
                    : 'border border-stone-200 bg-stone-50 text-stone-700'
                }`}
              >
                {alias}
              </span>
            ))}
            {person.hebrewName ? (
              <span
                className={`rounded-full px-2.5 py-1 text-xs ${
                  branchProfile
                    ? 'atlas-pill text-[var(--atlas-text)]'
                    : 'border border-stone-200 bg-stone-50 text-stone-700'
                }`}
              >
                {person.hebrewName}
              </span>
            ) : null}
          </div>
        </CollapsibleSection>
      )}

      {timelineItems.length > 0 && (
        <CollapsibleSection title={t ? 'ציר זמן' : 'Timeline'} icon="🕰️">
          <div className="space-y-2">
            {timelineItems.map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className={`rounded-xl p-3 ${
                  branchProfile ? 'atlas-card-subtle' : 'border border-stone-200 bg-stone-50/80'
                }`}
              >
                <div className={`text-xs uppercase tracking-[0.14em] ${branchProfile ? 'text-[var(--atlas-text-muted)]' : 'text-stone-400'}`}>{item.label}</div>
                <div className={`mt-1 text-sm ${branchProfile ? 'text-[var(--atlas-text)]' : 'text-stone-700'}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {activeFilterReasons.length > 0 && (
        <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
          <button
            onClick={() => setShowWhyShown(v => !v)}
            className="font-semibold underline hover:no-underline"
          >
            {showWhyShown
              ? (t ? 'הסתר למה מופיע בתוצאות' : 'Hide why shown in results')
              : (t ? 'למה מופיע בתוצאות?' : 'Why shown in results?')}
          </button>
          {showWhyShown && (
            <div className="mt-2 space-y-1">
              {activeFilterReasons.map((reason, idx) => (
                <div key={`${reason}-${idx}`}>- {reason}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {(person.tags.length > 0 || person.warCasualty || person.doubleBloodTie) && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-1">{t ? 'תגיות' : 'Tags'}</div>
          <div className="flex flex-wrap gap-1.5">
            {person.warCasualty && (() => {
              const cfg = TAG_ICONS['warCasualty'];
              return (
                <span key="warCasualty" className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border"
                  style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color + '33' }}>
                  <cfg.Icon size={10} strokeWidth={2} />
                  {t ? cfg.labelHe : cfg.labelEn}
                </span>
              );
            })()}
            {person.doubleBloodTie && (() => {
              const cfg = TAG_ICONS['doubleBloodTie'];
              return (
                <span key="doubleBloodTie" className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border"
                  style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color + '33' }}>
                  <cfg.Icon size={10} strokeWidth={2} />
                  {t ? cfg.labelHe : cfg.labelEn}
                </span>
              );
            })()}
            {person.tags.map(tag => {
              const cfg = TAG_ICONS[tag];
              if (cfg) {
                return (
                  <span key={tag} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border"
                    style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color + '33' }}>
                    <cfg.Icon size={10} strokeWidth={2} />
                    {t ? cfg.labelHe : cfg.labelEn}
                  </span>
                );
              }
              return (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {(person.holocaustVictim || person.warCasualty || person.tags.includes('Partisan')) && (
        <CollapsibleSection 
          title={t ? 'תקופת השואה וזיכרון' : 'Holocaust Period & Memory'} 
          icon="🕯️" 
          variant="memory"
          defaultOpen={person.holocaustVictim}
        >
          {person.holocaustVictim && (
            <div className="p-2 bg-gray-100 border border-gray-300 rounded text-xs text-gray-700">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800">
                  <span aria-hidden="true">🕯️</span>
                  <span>{t ? 'נספה בשואה' : 'Perished in the Holocaust'}</span>
                </span>
              </div>
              <div>{t ? 'האדם סומן כנרצח/נספה בשואה.' : 'This person was marked as murdered/perished in the Shoah.'}</div>
            </div>
          )}

          {person.warCasualty && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 mt-2">
              <div className="font-semibold">{t ? 'נפגע מלחמה' : 'War Casualty'}</div>
              <div>{t ? 'האדם סומן כחלל מלחמה או שירות צבאי.' : 'This person was marked as killed/fallen in military service or battle.'}</div>
            </div>
          )}

          {person.tags.includes('Partisan') && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700 mt-2">
              <div className="font-semibold">{t ? 'פרטיזן / מחתרת' : 'Partisan / Resistance'}</div>
              <div>{t ? 'האדם מסומן כחלק מפעילות פרטיזנית או מחתרתית.' : 'This person is marked as part of partisan or resistance activity.'}</div>
            </div>
          )}
        </CollapsibleSection>
      )}

      {person.doubleBloodTie && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
          <div className="font-semibold">{t ? 'קשר דם כפול' : 'Double blood tie'}</div>
          <div>
            {t ? 'לאדם זה יש כמה מסלולי קרבה קצרים ליעל' : 'This person has multiple shortest kinship paths to Yael'}
            {person.connectionPathCount ? ` (${person.connectionPathCount})` : ''}.
          </div>
          {shortestPathExamples.length > 0 && (
            <>
              <button
                onClick={() => setShowPathDetails(v => !v)}
                className="mt-1 text-[11px] underline hover:no-underline"
              >
                {showPathDetails
                  ? (t ? 'הסתר פירוט מסלולים' : 'Hide path details')
                  : (t ? 'הצג פירוט מסלולים' : 'Show path details')}
              </button>
              {showPathDetails && (
                <div className="mt-2 space-y-1">
                  {shortestPathExamples.map((pathIds, idx) => (
                    <div key={`path-${idx}`} className="leading-relaxed">
                      <span className="font-semibold mr-1">{t ? `מסלול ${idx + 1}:` : `Path ${idx + 1}:`}</span>
                      {pathIds.map((id, pathIdx) => (
                        <span key={`${id}-${pathIdx}`} className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onNavigate(id)}
                            className="underline hover:no-underline text-amber-800"
                          >
                            {persons.get(id)?.fullName || id}
                          </button>
                          {pathIdx < pathIds.length - 1 && <span className="text-amber-600">→</span>}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {hasClusterMarriageSignal && (
        <div className="mt-3 p-2 bg-fuchsia-50 border border-fuchsia-200 rounded text-xs text-fuchsia-700">
          <div className="font-semibold">
            {t ? 'קשרי נישואין ברשת אלפרוביץ׳/קסטרל' : 'Alperovitz/Kastroll marriage-network signal'}
          </div>
          <div>
            {t
              ? 'זוהו נישואין עם בן/בת זוג מאותה רשת משפחות (אלפרוביץ׳/קסטרול), כולל נישואין בין-ענפיים ובתוך הענף.'
              : 'Detected spouse links within the Alperovitz/Kastroll family network (cross-branch and within-branch marriages).'}
          </div>
        </div>
      )}

      {(person.dnaInfo || person.tags.includes('DNA')) && (
        <CollapsibleSection 
          title={t ? 'קשרי DNA' : 'DNA Links'} 
          icon="🧬" 
          variant="dna"
        >
          <div className="text-xs">
            {person.dnaInfo ? (
              <div className="text-purple-700 whitespace-pre-wrap">{person.dnaInfo}</div>
            ) : (
              <div className="text-purple-600">{t ? 'קיימים קשרי DNA מאומתים ברשימות ההתאמות.' : 'Verified DNA links exist in the match lists.'}</div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {(parents.length > 0 || spouses.size > 0 || children.length > 0 || siblings.length > 0) && (
        <CollapsibleSection 
          title={t ? 'קישורי משפחה' : 'Family links'} 
          icon="👨‍👩‍👧‍👦" 
          defaultOpen={true}
        >
          {parents.length > 0 && (
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-gray-600 mb-1">{t ? 'הורים' : 'Parents'}</h3>
              <div className="space-y-1">
                {parents.map(id => (
                  <div key={id}><PersonLink id={id} persons={persons} onNavigate={onNavigate} /></div>
                ))}
              </div>
            </div>
          )}

          {spouses.size > 0 && (
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-gray-600 mb-1">{t ? 'בני/בנות זוג' : 'Spouses'}</h3>
              <div className="space-y-1">
                {Array.from(spouses).map(id => (
                  <div key={id} className="space-y-0.5">
                    <PersonLink id={id} persons={persons} onNavigate={onNavigate} />
                    {spouseRelationFlags.get(id) && (
                      <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 inline-block">
                        {t ? 'נישואין אפשריים בתוך המשפחה (אב קדמון משותף)' : 'Possible in-family marriage (shared ancestor)'}
                      </div>
                    )}
                    {spouseClusterMarriageFlags.get(id) && (
                      <div className="text-[11px] text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 rounded px-2 py-0.5 inline-block">
                        {t ? 'רשת אלפרוביץ׳/קסטרל' : 'Alperovitz/Kastroll network'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {children.length > 0 && (
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-gray-600 mb-1">{t ? 'ילדים' : 'Children'}</h3>
              <div className="space-y-1">
                {children.map(id => (
                  <div key={id}><PersonLink id={id} persons={persons} onNavigate={onNavigate} /></div>
                ))}
              </div>
            </div>
          )}

          {siblings.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-1">{t ? 'אחים/אחיות' : 'Siblings'}</h3>
              <div className="space-y-1">
                {siblings.map(id => (
                  <div key={id}><PersonLink id={id} persons={persons} onNavigate={onNavigate} /></div>
                ))}
              </div>
            </div>
          )}
        </CollapsibleSection>
      )}

      {(branchProfile || branchEvidence.length > 0 || person.tags.includes('DNA') || !!person.story) && (
        <CollapsibleSection title={t ? 'תיעוד ומקורות' : 'Evidence'} icon="🧾">
          <div className="space-y-3">
            {branchEvidence.map((item) => {
              const displayItem = translateBranchEvidence(item);
              return (
                <BranchEvidenceCard
                  key={item.id}
                  item={displayItem}
                  language={language}
                  variant={branchProfile ? 'atlas' : 'default'}
                  resolvePersonLabel={(personId) => getBranchClaimPersonLabel(personId)}
                  resolvePersonHref={(personId) => `/${language}/person/${encodeURIComponent(personId)}`}
                />
              );
            })}
            {person.tags.includes('DNA') && !branchEvidence.some((item) => item.type === 'dna-clue') ? (
              <ArchivalCard
                title={t ? 'אות DNA' : 'DNA clue'}
                variant={branchProfile ? 'atlas' : 'default'}
                eyebrow={<EvidenceBadge type="dna-clue" variant={branchProfile ? 'atlas' : 'default'} language={language} />}
              >
                <p>{t ? 'הרשומה מסומנת בתג DNA במאגר הקיים.' : 'This record is already tagged with DNA evidence in the existing archive.'}</p>
              </ArchivalCard>
            ) : null}
            {branchProfile && branchEvidence.length === 0 && !person.tags.includes('DNA') && !person.story ? (
              <ArchivalCard
                title={t ? 'אין כרגע פריט ראיה מצורף' : 'No branch evidence attached yet'}
                variant="atlas"
              >
                <p>
                  {t
                    ? 'נכון לעכשיו אין לפרופיל זה פריט ראיה ייעודי בחבילת הענף. מידע גולמי והערות מחקר עשויים עדיין להופיע בסעיפים אחרים.'
                    : 'No dedicated evidence item is currently attached to this profile in the branch package. Raw profile data and research notes may still appear elsewhere.'}
                </p>
              </ArchivalCard>
            ) : null}
          </div>
        </CollapsibleSection>
      )}

      {branchProfile && (
        <CollapsibleSection title={branchClaimUi.sectionTitle} icon="📎">
          <div className="space-y-3">
            {branchClaims.length > 0 ? (
              branchClaims.map((claim) => (
                <ArchivalCard
                  key={claim.id}
                  title={getBranchClaimLabel(claim)}
                  variant="atlas"
                  eyebrow={
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">
                        {branchClaimUi.confidenceLabel}
                      </span>
                      <RelationshipChip
                        label={claimConfidenceLabels[claim.confidence]}
                        tone={claim.confidence === 'direct' ? 'lime' : claim.confidence === 'partial' ? 'stone' : 'rose'}
                        variant="atlas"
                      />
                    </div>
                  }
                >
                  <div className="text-[11px] text-[var(--atlas-text-muted)]">{branchClaimUi.evidenceLabel}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {claim.evidenceIds.map((evidenceId) => (
                      <span
                        key={evidenceId}
                        className="atlas-pill rounded-full px-2 py-0.5 text-[10px] font-mono text-[var(--atlas-text)]"
                      >
                        {evidenceId}
                      </span>
                    ))}
                  </div>
                  {translateBranchClaimNote(claim.note) ? (
                    <p className="mt-2 text-xs text-stone-500">
                      {translateBranchClaimNote(claim.note)}
                    </p>
                  ) : null}
                </ArchivalCard>
              ))
            ) : (
              <ArchivalCard title={branchClaimUi.noClaims} variant="atlas">
                {t
                  ? 'בשלב זה אין רשומות claim ייעודיות עבור הפרופיל הזה בחבילת הענף.'
                  : 'No branch-scoped claim records are attached to this profile yet.'}
              </ArchivalCard>
            )}
          </div>
        </CollapsibleSection>
      )}

      {(branchRelationshipNotes.length > 0 || person.note_plain || person.title) && (
        <CollapsibleSection title={t ? 'הערות מחקר' : 'Research notes'} icon="🔎">
          <div className="space-y-3">
            {branchRelationshipNotes.map((note) => {
              const displayNote = translateBranchResearchNote(note);
              return (
              <ArchivalCard key={note.id} title={displayNote.title} variant={branchProfile ? 'atlas' : 'default'}>
                {displayNote.detail}
              </ArchivalCard>
              );
            })}
            {person.note_plain ? (
              <ArchivalCard title={t ? 'הערת מקור גולמית' : 'Raw source note'} variant={branchProfile ? 'atlas' : 'default'}>
                <div className="whitespace-pre-wrap break-words">{person.note_plain}</div>
              </ArchivalCard>
            ) : null}
            {person.title ? (
              <ArchivalCard title={t ? 'תיאור מחקרי קיים' : 'Existing research title'} variant={branchProfile ? 'atlas' : 'default'}>
                {person.title}
              </ArchivalCard>
            ) : null}
          </div>
        </CollapsibleSection>
      )}

      {(person.fatherName || person.motherName) && !parents.length && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1">{t ? 'הורים (מהנתונים)' : 'Parents (from data)'}</h3>
          {person.fatherName && <div className="text-sm">{t ? 'אב:' : 'Father:'} {person.fatherName}</div>}
          {person.motherName && <div className="text-sm">{t ? 'אם:' : 'Mother:'} {person.motherName}</div>}
        </div>
      )}

      {person.story && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowStory(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 py-2.5 px-4 text-sm font-semibold text-amber-700 shadow-sm transition-all hover:border-amber-400 hover:bg-amber-100"
          >
            <BookOpen size={15} strokeWidth={1.8} />
            {t ? '📖 קרא את סיפור המשפחה' : '📖 Read the family story'}
          </button>
        </div>
      )}

      {showStory && person.story && (
        <StoryModal
          personName={personDisplayName}
          story={person.story}
          onClose={() => setShowStory(false)}
          language={language}
        />
      )}
      </div>
    </div>
  );
}
