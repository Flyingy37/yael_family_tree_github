import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ArchivalCard } from './ArchivalCard';
import { RelationshipChip } from './RelationshipChip';

export type FamilyBranchKey = 'ginzburg' | 'liandres' | 'duberstein' | 'charny_meirson' | 'research_context';

export interface FamilyLegendPersonChip {
  label: string;
  personId?: string;
}

export interface FamilyLegendBranchItem {
  key: FamilyBranchKey;
  labelHe: string;
  labelEn: string;
  descriptionHe: string;
  descriptionEn: string;
  accentClass: string;
  ringClass: string;
  chipTone: 'lime' | 'rose' | 'violet' | 'stone';
  linkedPeople?: FamilyLegendPersonChip[];
}

export const FAMILY_COLOR_LEGEND_ITEMS: FamilyLegendBranchItem[] = [
  {
    key: 'ginzburg',
    labelHe: 'ענף Ginzburg',
    labelEn: 'Ginzburg branch',
    descriptionHe: 'תמונות ותיעוד הקשורים ישירות לקו Ginzburg ולצאצאיו.',
    descriptionEn: 'Images and documents directly tied to the Ginzburg line and descendants.',
    accentClass: 'bg-amber-500',
    ringClass: 'ring-amber-300',
    chipTone: 'stone',
    linkedPeople: [
      { label: 'Arie-Leib Ginzburg', personId: '@I86@' },
      { label: 'Aharon Ginzburg', personId: '@I131@' },
      { label: 'Gershon (Grigory) Ginzburg', personId: '@I132@' },
      { label: 'Yankel Berl Ginzburg', personId: '@I133@' },
      { label: 'Eti Ginzburg Charny', personId: '@I203@' },
    ],
  },
  {
    key: 'liandres',
    labelHe: 'ענף Liandres',
    labelEn: 'Liandres branch',
    descriptionHe: 'חומרי תצוגה המתמקדים בצד Liandres ובקווי הנישואין המשויכים אליו.',
    descriptionEn: 'Display materials focused on the Liandres side and the associated marriage lines.',
    accentClass: 'bg-rose-500',
    ringClass: 'ring-rose-300',
    chipTone: 'rose',
    linkedPeople: [{ label: 'Basia Liandres', personId: '@I87@' }],
  },
  {
    key: 'duberstein',
    labelHe: 'ענף Duberstein',
    labelEn: 'Duberstein branch',
    descriptionHe: 'תמונות, מסמכים ועדויות הקשורים לבית Duberstein ולצאצאיו.',
    descriptionEn: 'Images, documents, and testimony tied to the Duberstein household and descendants.',
    accentClass: 'bg-teal-500',
    ringClass: 'ring-teal-300',
    chipTone: 'lime',
    linkedPeople: [
      { label: 'Sofia Ginzburg Duberstein', personId: '@I37@' },
      { label: 'Vladimir Reuvenovich Duberstein', personId: '@I36@' },
      { label: 'Tzila Cilia Duberstein Alperovitz', personId: '@I12@' },
      { label: 'Ema Duberstein Meirson', personId: '@I61@' },
      { label: 'Isaak Ginzburg', personId: '@I134@' },
    ],
  },
  {
    key: 'charny_meirson',
    labelHe: 'ענף Charny / Meirson',
    labelEn: 'Charny / Meirson branch',
    descriptionHe: 'חומרי תצוגה המחברים בין קווי Charny ו־Meirson בהקשר משפחתי משולב.',
    descriptionEn: 'Display materials connecting the Charny and Meirson lines in a combined family context.',
    accentClass: 'bg-violet-500',
    ringClass: 'ring-violet-300',
    chipTone: 'violet',
    linkedPeople: [
      { label: 'Eti Ginzburg Charny', personId: '@I203@' },
      { label: 'Ema Duberstein Meirson', personId: '@I61@' },
    ],
  },
  {
    key: 'research_context',
    labelHe: 'הקשר מחקרי',
    labelEn: 'Research context',
    descriptionHe: 'מסמכים, סריקות והערות מחקר שאינם מזהים ענף משפחתי יחיד אלא תומכים בהקשר הרחב.',
    descriptionEn: 'Documents, scans, and research notes that do not identify a single family branch but support the wider context.',
    accentClass: 'bg-stone-500',
    ringClass: 'ring-stone-300',
    chipTone: 'stone',
    linkedPeople: [
      { label: 'Yankel Berl Ginzburg', personId: '@I133@' },
      { label: 'Arie-Leib Ginzburg', personId: '@I86@' },
      { label: 'Basia-Bashata née Landres', personId: '@I87@' },
    ],
  },
];

export interface FamilyColorLegendState {
  hoveredKey: FamilyBranchKey | null;
  lockedKey: FamilyBranchKey | null;
  activeKey: FamilyBranchKey | null;
  setHoveredKey: (key: FamilyBranchKey | null) => void;
  toggleLockedKey: (key: FamilyBranchKey) => void;
  clearLockedKey: () => void;
}

const FamilyColorLegendContext = createContext<FamilyColorLegendState | null>(null);

export function FamilyColorLegendProvider({
  children,
  initialLockedKey = null,
}: {
  children: ReactNode;
  initialLockedKey?: FamilyBranchKey | null;
}) {
  const [hoveredKey, setHoveredKey] = useState<FamilyBranchKey | null>(null);
  const [lockedKey, setLockedKey] = useState<FamilyBranchKey | null>(initialLockedKey);

  const value = useMemo<FamilyColorLegendState>(
    () => ({
      hoveredKey,
      lockedKey,
      activeKey: hoveredKey ?? lockedKey,
      setHoveredKey,
      toggleLockedKey: (key: FamilyBranchKey) => {
        setLockedKey((current) => (current === key ? null : key));
        setHoveredKey((current) => (current === key ? null : key));
      },
      clearLockedKey: () => setLockedKey(null),
    }),
    [hoveredKey, lockedKey],
  );

  return <FamilyColorLegendContext.Provider value={value}>{children}</FamilyColorLegendContext.Provider>;
}

export function useFamilyColorLegend() {
  const context = useContext(FamilyColorLegendContext);
  return context;
}

export function getFamilyBranchMeta(key: FamilyBranchKey) {
  return FAMILY_COLOR_LEGEND_ITEMS.find((item) => item.key === key) || FAMILY_COLOR_LEGEND_ITEMS[0];
}

export function getEvidenceFamilyBranchKeys(evidenceId: string): FamilyBranchKey[] {
  const map: Record<string, FamilyBranchKey[]> = {
    'ev-image-aharon-military-portrait': ['ginzburg'],
    'ev-image-berl-yakov-ginzburg-1944': ['ginzburg'],
    'ev-image-isaak-ginzburg-1936': ['ginzburg'],
    'ev-image-zinaida-dubershtein-ginzburg-portrait': ['ginzburg', 'duberstein'],
    'ev-image-zinaida-dubershtein-ginzburg-portrait-alt': ['ginzburg', 'duberstein'],
    'ev-image-cilia-two-person-portrait': ['duberstein'],
    'ev-image-ginzburg-family-1946-annotated': ['ginzburg', 'duberstein'],
    'ev-image-ginzburg-family-1946-clean': ['ginzburg', 'duberstein'],
    'ev-image-ginzburg-family-annotated-group': ['ginzburg', 'duberstein', 'charny_meirson', 'research_context'],
    'ev-image-ginzburg-duberstein-family-group-identified': ['ginzburg', 'duberstein', 'charny_meirson', 'research_context'],
    'ev-image-ginzburg-family-group-1946-a': ['ginzburg', 'duberstein'],
    'ev-image-ginzburg-family-group-1946-b': ['ginzburg', 'duberstein'],
    'ev-image-cilia-alperovitz-liri-livnat-tal': ['duberstein'],
    'ev-image-tzila-prewar-class-photo-1941': ['duberstein', 'research_context'],
    'ev-image-tzila-family-testimony-scan': ['duberstein', 'research_context'],
    'ev-document-yankel-berl-ginzburg-autobiography': ['ginzburg', 'research_context'],
    'ev-document-yankel-berl-ginzburg-memoir-yiddish': ['ginzburg', 'research_context'],
    'ev-document-haifa-voters-list-1930': ['liandres', 'research_context'],
  };

  return map[evidenceId] || ['research_context'];
}

export function FamilyColorLegend({
  language,
  className = '',
  resolvePersonLabel,
  resolvePersonHref,
}: {
  language: 'en' | 'he';
  className?: string;
  resolvePersonLabel?: (personId: string) => string;
  resolvePersonHref?: (personId: string) => string | null | undefined;
}) {
  const t = language === 'he';
  const state = useFamilyColorLegend();

  const title = t ? 'מקרא משפחתי' : 'Family color legend';
  const intro = t
    ? 'רחפו מעל ענף כדי להדגיש אותו; לחיצה תנעל ענף אחד על פני כל פריטי התמונה והתיעוד.'
    : 'Hover to preview a branch; click to lock it across image and document cards.';

  return (
    <ArchivalCard title={title} variant="atlas" className={className}>
      <div className="space-y-3">
        <p className="text-sm leading-6 text-stone-600">{intro}</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {FAMILY_COLOR_LEGEND_ITEMS.map((item) => {
            const isActive = state?.activeKey === item.key;
            const isLocked = state?.lockedKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onMouseEnter={() => state?.setHoveredKey(item.key)}
                onMouseLeave={() => state?.setHoveredKey(null)}
                onClick={() => state?.toggleLockedKey(item.key)}
                aria-pressed={isLocked}
                  className={[
                    'group w-full rounded-2xl border p-3 text-left transition-all duration-200',
                    'bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0.18))]',
                    item.ringClass,
                    isActive
                      ? 'border-[rgba(97,97,97,0.22)] ring-2 shadow-[0_10px_26px_-24px_rgba(79,70,58,0.45)]'
                      : 'border-[rgba(146,133,116,0.12)]',
                    isLocked ? 'ring-offset-0' : 'hover:border-[rgba(146,133,116,0.22)]',
                  ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-3 w-3 rounded-full ${item.accentClass} flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-[var(--atlas-text)]">
                        {t ? item.labelHe : item.labelEn}
                      </h3>
                      <RelationshipChip
                        label={isLocked ? (t ? 'נעול' : 'Locked') : t ? 'תצוגה' : 'Preview'}
                        tone={item.chipTone}
                        variant="atlas"
                      />
                    </div>
                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      {t ? item.descriptionHe : item.descriptionEn}
                    </p>
                    {item.linkedPeople && item.linkedPeople.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.linkedPeople.map((person) => {
                          const label = person.personId ? resolvePersonLabel?.(person.personId) || person.label : person.label;
                          return (
                            <span
                              key={person.label}
                              className="atlas-pill rounded-full px-2 py-0.5 text-[10px] text-[var(--atlas-text)]"
                              title={person.personId && resolvePersonHref?.(person.personId) ? person.personId : undefined}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </ArchivalCard>
  );
}
