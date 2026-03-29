import { useMemo, useState } from 'react';
import type { Person, Family } from '../types';
import { DEFAULT_FILTERS, isUnknownPlaceholderPerson, type Filters } from './FilterPanel';
import { getCanonicalSurnameLabel } from '../utils/surname';
import { coerceConnectionPathCount } from '../utils/coerceGraphPerson';
import {
  displayFullNameForUi,
  dualLangText,
  formatCompoundFieldDisplay,
  formatPathCountDisplay,
  gedcomDatePrimary,
  jewishLineageForUi,
  relationTextForUi,
} from '../utils/personUiText';
import { HolocaustMemorialPatchIcon } from './HolocaustMemorialPatchIcon';
import {
  Dna, Swords, GitMerge, Shield, Star, BookMarked, Scroll, Landmark, Ship,
  type LucideIcon,
} from 'lucide-react';

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
  /** Opens tree "relationship between two people" mode with this person as the first pick */
  onRequestPathCompare?: (personId: string) => void;
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
  return (
    <button
      className="text-blue-600 hover:text-blue-800 text-sm underline text-right"
      onClick={() => onNavigate(id)}
    >
      {p.fullName}
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
  onRequestPathCompare,
  language = 'en',
}: Props) {
  const t = language === 'he';
  const [showPathDetails, setShowPathDetails] = useState(false);
  const [showWhyShown, setShowWhyShown] = useState(false);
  const isUnknownPlaceholder = isUnknownPlaceholderPerson(person);
  const uiLang = t ? 'he' : 'en';
  const kinshipPathCountLabel = formatPathCountDisplay(person.connectionPathCount);
  const personDisplayName = isUnknownPlaceholder
    ? (t ? 'אדם לא מזוהה' : 'Unknown person')
    : displayFullNameForUi(person, uiLang);

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
  const marriedSurname =
    marriedSurnameRaw && marriedSurnameRaw.toLowerCase() !== currentSurname.toLowerCase()
      ? marriedSurnameRaw
      : null;
  const originalSurname = hasSurnameChange ? baseSurname : null;
  const formerSurnameInline =
    originalSurname
      ? (t
          ? `שם נעורים: ${formatCompoundFieldDisplay(originalSurname, 'he')}`
          : `Maiden name: ${formatCompoundFieldDisplay(originalSurname, 'en')}`)
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
    const pathCountSafe = coerceConnectionPathCount(person.connectionPathCount) || 0;
    if (f.hasDoubleBloodTieTag && person.tags.includes('DoubleBloodTie') && pathCountSafe >= f.doubleBloodTieMinPaths) {
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

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto p-4 shadow-lg" dir={t ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{personDisplayName}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ✕
        </button>
      </div>

      {t &&
        person.hebrewName?.trim() &&
        person.hebrewName.trim() !== person.fullName && (
          <div className="text-sm text-gray-600 mb-2">{person.fullName}</div>
        )}
      {!t &&
        person.hebrewName?.trim() &&
        person.hebrewName.trim() !== person.fullName && (
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
          {t
            ? `🌿 הצגת עץ משנה של ${displayFullNameForUi(person, 'he').split(/\s+/)[0] ?? ''}`
            : `🌿 Show subtree of ${displayFullNameForUi(person, 'en').split(/\s+/)[0] ?? ''}`}
        </button>
      )}
      {onRequestPathCompare && (
        <button
          type="button"
          onClick={() => onRequestPathCompare(person.id)}
          className="w-full mb-3 py-1.5 px-3 text-xs bg-sky-50 text-sky-800 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
        >
          {t ? '🔗 מצא קשר לאדם אחר (בחר שני אנשים בעץ)' : '🔗 Compare with another person (pick two on tree)'}
        </button>
      )}

      <div className="space-y-0">
        <InfoRow label={t ? 'קרבה ליעל' : 'Relation to Yael'} value={relationTextForUi(person, uiLang)} />
        <InfoRow label={t ? 'דור' : 'Generation'} value={person.generation?.toString()} />
        <InfoRow label={t ? 'קפיצות' : 'Hops'} value={person.hops?.toString()} />
        <InfoRow label={t ? 'מין' : 'Sex'} value={person.sex === 'M' ? (t ? 'זכר' : 'Male') : person.sex === 'F' ? (t ? 'נקבה' : 'Female') : (t ? 'לא ידוע' : 'Unknown')} />
        <InfoRow label={t ? 'תאריך לידה' : 'Birth date'} value={gedcomDatePrimary(person.birthDate)} />
        <InfoRow
          label={t ? 'מקום לידה' : 'Birth place'}
          value={dualLangText(person.birthPlace, person.birthPlaceEn, uiLang)}
        />
        {person.deathDate && (
          <InfoRow label={t ? 'תאריך פטירה' : 'Death date'} value={gedcomDatePrimary(person.deathDate)} />
        )}
        <InfoRow label={t ? 'שם בלידה' : 'Birth name'} value={person.birthName} />
        <InfoRow
          label={t ? 'שם משפחה' : 'Surname'}
          value={formatCompoundFieldDisplay(person.surnameFinal, uiLang)}
        />
        <InfoRow
          label={t ? 'שם משפחה קודם' : 'Maiden surname'}
          value={originalSurname ? formatCompoundFieldDisplay(originalSurname, uiLang) : null}
        />
        <InfoRow
          label={t ? 'שם משפחה נוכחי/נישואין' : 'Current/Married surname'}
          value={marriedSurname ? formatCompoundFieldDisplay(marriedSurname, uiLang) : null}
        />
        <InfoRow label={t ? 'מוצא משפחתי היסטורי' : 'Family heritage origin'} value={person.surnameOrigin} />
        <InfoRow
          label={t ? 'ייחוס יהודי' : 'Jewish lineage'}
          value={jewishLineageForUi(person.jewishLineage, uiLang)}
        />
        <InfoRow
          label={t ? 'הגירה' : 'Migration'}
          value={dualLangText(person.migrationInfo, person.migrationInfoEn, uiLang)}
        />
        <InfoRow label={t ? 'מסלולי קרבה ליעל' : 'Connection paths to Yael'} value={kinshipPathCountLabel} />
        {(person.title || person.titleEn) && (
          <InfoRow label={t ? 'תיאור' : 'Title'} value={dualLangText(person.title, person.titleEn, uiLang)} />
        )}
      </div>

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

      {person.holocaustVictim && (
        <div className="mt-3 p-2 bg-zinc-100 border border-zinc-400 rounded text-xs text-zinc-900">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 font-semibold text-zinc-900"
              title={t ? 'סימון זיכרון' : 'Memorial marker'}
            >
              <HolocaustMemorialPatchIcon
                size={22}
                title={t ? 'טלאי זיכרון לקורבן שואה' : 'Holocaust memorial patch'}
              />
              <span>{t ? 'טלאי זיכרון' : 'Memorial patch'}</span>
            </span>
            <div className="font-semibold">{t ? 'קורבן שואה' : 'Holocaust Victim'}</div>
          </div>
          <div>{t ? 'האדם סומן כנרצח/נספה בשואה.' : 'This person was marked as murdered/perished in the Shoah.'}</div>
        </div>
      )}

      {person.warCasualty && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <div className="font-semibold">{t ? 'נפגע מלחמה' : 'War Casualty'}</div>
          <div>{t ? 'האדם סומן כחלל מלחמה או שירות צבאי.' : 'This person was marked as killed/fallen in military service or battle.'}</div>
        </div>
      )}

      {person.tags.includes('Partisan') && (
        <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700">
          <div className="font-semibold">{t ? 'פרטיזן / מחתרת' : 'Partisan / Resistance'}</div>
          <div>{t ? 'האדם מסומן כחלק מפעילות פרטיזנית או מחתרתית.' : 'This person is marked as part of partisan or resistance activity.'}</div>
        </div>
      )}

      {person.doubleBloodTie && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
          <div className="font-semibold">{t ? 'קשר דם כפול' : 'Double blood tie'}</div>
          <div>
            {t ? 'לאדם זה יש כמה מסלולי קרבה קצרים ליעל' : 'This person has multiple shortest kinship paths to Yael'}
            {kinshipPathCountLabel ? ` (${kinshipPathCountLabel})` : ''}.
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
        <div className="mt-4 p-2 bg-purple-50 rounded text-xs">
          <div className="font-bold text-purple-700 mb-1 flex items-center gap-1.5">
            <Dna size={13} />
            {t ? 'קשרי DNA מאומתים' : 'Verified DNA links'}
          </div>
          {person.dnaInfo ? (
            <div className="text-purple-600 whitespace-pre-wrap">{person.dnaInfo}</div>
          ) : (
            <div className="text-purple-600">{t ? 'קיימים קשרי DNA מאומתים ברשימות ההתאמות.' : 'Verified DNA links exist in the match lists.'}</div>
          )}
        </div>
      )}

      {parents.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1">{t ? 'הורים' : 'Parents'}</h3>
          <div className="space-y-1">
            {parents.map(id => (
              <div key={id}><PersonLink id={id} persons={persons} onNavigate={onNavigate} /></div>
            ))}
          </div>
        </div>
      )}

      {spouses.size > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1">{t ? 'בני/בנות זוג' : 'Spouses'}</h3>
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
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1">{t ? 'ילדים' : 'Children'}</h3>
          <div className="space-y-1">
            {children.map(id => (
              <div key={id}><PersonLink id={id} persons={persons} onNavigate={onNavigate} /></div>
            ))}
          </div>
        </div>
      )}

      {siblings.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1">{t ? 'אחים/אחיות' : 'Siblings'}</h3>
          <div className="space-y-1">
            {siblings.map(id => (
              <div key={id}><PersonLink id={id} persons={persons} onNavigate={onNavigate} /></div>
            ))}
          </div>
        </div>
      )}

      {(person.fatherName || person.motherName) && !parents.length && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1">{t ? 'הורים (מהנתונים)' : 'Parents (from data)'}</h3>
          {person.fatherName && <div className="text-sm">{t ? 'אב:' : 'Father:'} {person.fatherName}</div>}
          {person.motherName && <div className="text-sm">{t ? 'אם:' : 'Mother:'} {person.motherName}</div>}
        </div>
      )}
    </div>
  );
}
