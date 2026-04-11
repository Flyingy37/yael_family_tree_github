import { ArchivalCard } from './ArchivalCard';
import { RelationshipChip } from './RelationshipChip';
import { branchTheme } from '../data/branchTheme';
import type { BranchKey, UiLang } from '../types/familyTree';

export type BloodlineLegendItem = {
  key: BranchKey;
  labelHe: string;
  labelEn: string;
  descriptionHe: string;
  descriptionEn: string;
  linkedPeople?: Array<{ label: string; personId?: string }>;
};

export const BLOODLINE_LEGEND_ITEMS: BloodlineLegendItem[] = [
  {
    key: 'liandres',
    labelHe: 'קו Liandres',
    labelEn: 'Liandres line',
    descriptionHe: 'שורשי המשפחה והקו האימהי הבסיסי של הענף.',
    descriptionEn: 'The family roots and base maternal line of the branch.',
    linkedPeople: [{ label: 'Basia Liandres', personId: '@I87@' }],
  },
  {
    key: 'duberstein',
    labelHe: 'קו Duberstein',
    labelEn: 'Duberstein line',
    descriptionHe: 'קשרי בית, לידה ונישואין המשויכים לבית Duberstein.',
    descriptionEn: 'Household, birth, and marriage ties associated with the Duberstein household.',
    linkedPeople: [
      { label: 'Sofia Ginzburg Duberstein', personId: '@I37@' },
      { label: 'Vladimir Reuvenovich Duberstein', personId: '@I36@' },
      { label: 'Tzila Cilia Sara Duberstein Alperovitz', personId: '@I12@' },
      { label: 'Ema Duberstein Meirson', personId: '@I61@' },
    ],
  },
  {
    key: 'ginzburg',
    labelHe: 'ענף Ginzburg',
    labelEn: 'Ginzburg branch',
    descriptionHe: 'צאצאים ומשפחה מורחבת המשויכים לקו Ginzburg.',
    descriptionEn: 'Descendants and extended family associated with the Ginzburg line.',
    linkedPeople: [
      { label: 'Aharon Ginzburg', personId: '@I131@' },
      { label: 'Gershon (Grigory) Ginzburg', personId: '@I132@' },
      { label: 'Yankel Berl Ginzburg', personId: '@I133@' },
      { label: 'Isaak Ginzburg', personId: '@I134@' },
      { label: 'Valia Valentina Ginzburg Axelrod', personId: '@I60@' },
    ],
  },
  {
    key: 'charny_meirson',
    labelHe: 'קו Charny / Meirson',
    labelEn: 'Charny / Meirson line',
    descriptionHe: 'ענף מחקרי המשלים את קו הנישואין והקשרים המשפחתיים המשניים.',
    descriptionEn: 'A research line that supplements the marriage and secondary family connections.',
    linkedPeople: [
      { label: 'Eti Ginzburg Charny', personId: '@I203@' },
      { label: 'Sonya Charny', personId: null },
    ],
  },
  {
    key: 'research',
    labelHe: 'קשר מחקרי',
    labelEn: 'Research connection',
    descriptionHe: 'קישור מחקרי פתוח שאינו מוכרע עדיין כקשר דם קנוני.',
    descriptionEn: 'An open research link that is not yet resolved as a canonical blood connection.',
    linkedPeople: [{ label: 'Isaac Lyandres' }],
  },
];

export function BloodlineLegend({
  lang,
  activeBranch,
  onHover,
  onLeave,
  onToggle,
}: {
  lang: UiLang;
  activeBranch: BranchKey | null;
  onHover: (key: BranchKey) => void;
  onLeave: () => void;
  onToggle: (key: BranchKey) => void;
}) {
  const isHe = lang === 'he';

  return (
    <ArchivalCard title={isHe ? 'מקרא ענפים' : 'Branch legend'} variant="atlas">
      <div className="space-y-3">
        <p className="text-sm leading-6 text-stone-600">
          {isHe
            ? 'רחיפה מציגה ענף זמני; לחיצה נועלת את ההדגשה על פני כרטיסי העץ והתיעוד.'
            : 'Hover previews a branch; click locks the highlight across tree and evidence cards.'}
        </p>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {BLOODLINE_LEGEND_ITEMS.map((item) => {
            const theme = branchTheme[item.key];
            const active = activeBranch === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onMouseEnter={() => onHover(item.key)}
                onMouseLeave={onLeave}
                onClick={() => onToggle(item.key)}
                aria-pressed={active}
                className={[
                  'group w-full rounded-2xl border p-3 text-left transition-all duration-200',
                  active ? 'ring-2 ring-offset-1 shadow-[0_12px_30px_-24px_rgba(79,70,58,0.45)]' : 'hover:shadow-sm',
                ].join(' ')}
                style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-3 w-3 rounded-full`} style={{ backgroundColor: theme.dot }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-[var(--atlas-text)]">
                        {isHe ? item.labelHe : item.labelEn}
                      </h3>
                      <RelationshipChip
                        label={active ? (isHe ? 'נעול' : 'Locked') : isHe ? 'תצוגה' : 'Preview'}
                        tone="stone"
                        variant="atlas"
                      />
                    </div>
                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      {isHe ? item.descriptionHe : item.descriptionEn}
                    </p>
                    {item.linkedPeople?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.linkedPeople.map((person) => (
                          <span
                            key={`${item.key}-${person.label}`}
                            className="atlas-pill rounded-full px-2 py-0.5 text-[10px] text-[var(--atlas-text)]"
                          >
                            {person.label}
                          </span>
                        ))}
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
