import { useMemo, useState } from 'react';
import { ArchivalCard } from './ArchivalCard';
import { BloodlineLegend } from './BloodlineLegend';
import { BloodlineNodeCard } from './BloodlineNodeCard';
import { RelationshipChip } from './RelationshipChip';
import { branchTheme } from '../data/branchTheme';
import type { BloodlineTreeData, BranchKey, RelationType, TreeNode, UiLang } from '../types/familyTree';

const UI = {
  he: {
    kicker: 'עץ קו הדם',
    title: 'קו הדם המשפחתי',
    subtitle:
      'תצוגה זו מציגה קשרי דם מאומתים בלבד. קשרי נישואין וקשרים מחקריים נשמרים מחוץ לעץ הראשי כדי לשמור על תצוגה נקייה ומדויקת.',
    researchTitle: 'קשרים מחקריים פתוחים',
    researchSubtitle: 'פריטים אלה נשמרים בנפרד עד לאימות נוסף.',
    active: 'ענף פעיל',
    locked: 'הדגשה נעולה',
    branchLabels: {
      blood: 'קשר דם',
      marriage: 'קשר נישואין',
      adopted: 'אימוץ',
      step: 'משפחה חורגת',
      possible_blood: 'קשר דם אפשרי',
    } as Record<RelationType, string>,
  },
  en: {
    kicker: 'Bloodline tree',
    title: 'Family bloodline',
    subtitle:
      'This view shows verified bloodline connections only. Marriage and research connections remain outside the main tree so the presentation stays clear and historically disciplined.',
    researchTitle: 'Open research connections',
    researchSubtitle: 'These items remain separate until further corroboration.',
    active: 'Active branch',
    locked: 'Highlight locked',
    branchLabels: {
      blood: 'Bloodline',
      marriage: 'Marriage',
      adopted: 'Adopted',
      step: 'Step relation',
      possible_blood: 'Possible bloodline',
    } as Record<RelationType, string>,
  },
} as const;

function TreeLevel({
  nodes,
  activeBranch,
  showOnlyBloodline,
  lang,
  relationLabels,
}: {
  nodes: TreeNode[];
  activeBranch: BranchKey | null;
  showOnlyBloodline: boolean;
  lang: UiLang;
  relationLabels: Record<RelationType, string>;
}) {
  const visibleNodes = useMemo(() => {
    return showOnlyBloodline ? nodes.filter((node) => node.relationType === 'blood') : nodes;
  }, [nodes, showOnlyBloodline]);

  if (!visibleNodes.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-center gap-4">
        {visibleNodes.map((node) => (
          <div key={node.id} className="flex min-w-[220px] max-w-[280px] flex-col items-center">
            <BloodlineNodeCard node={node} activeBranch={activeBranch} lang={lang} relationLabel={relationLabels[node.relationType]} />
            {node.children?.length ? (
              <>
                <div className="h-6 w-px bg-[var(--atlas-line)]" />
                <TreeLevel
                  nodes={node.children}
                  activeBranch={activeBranch}
                  showOnlyBloodline={showOnlyBloodline}
                  lang={lang}
                  relationLabels={relationLabels}
                />
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BloodlineTree({
  data,
  lang = 'en',
  showOnlyBloodline = true,
}: {
  data: BloodlineTreeData;
  lang?: UiLang;
  showOnlyBloodline?: boolean;
}) {
  const copy = UI[lang];
  const [hoveredBranch, setHoveredBranch] = useState<BranchKey | null>(null);
  const [lockedBranch, setLockedBranch] = useState<BranchKey | null>(null);
  const activeBranch = lockedBranch ?? hoveredBranch;
  const rootChildren = useMemo(() => data.root.children ?? [], [data.root.children]);

  return (
    <section dir={lang === 'he' ? 'rtl' : 'ltr'} className="atlas-panel rounded-3xl p-5 md:p-6 space-y-6">
      <div className="space-y-2">
        <div className="atlas-kicker">{copy.kicker}</div>
        <h2 className="text-xl md:text-2xl font-semibold text-[var(--atlas-text)]">{copy.title}</h2>
        <p className="text-sm leading-7 text-[var(--atlas-text-muted)]">{copy.subtitle}</p>
      </div>

      <BloodlineLegend
        lang={lang}
        activeBranch={activeBranch}
        onHover={setHoveredBranch}
        onLeave={() => setHoveredBranch(null)}
        onToggle={(key) => setLockedBranch((current) => (current === key ? null : key))}
      />

      <div className="atlas-divider" />

      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="w-full max-w-[320px]">
            <BloodlineNodeCard node={data.root} activeBranch={activeBranch} lang={lang} relationLabel={copy.branchLabels[data.root.relationType]} />
          </div>
        </div>

        <div className="flex justify-center">
          <div className="h-8 w-px bg-[var(--atlas-line)]" />
        </div>

        <TreeLevel
          nodes={rootChildren}
          activeBranch={activeBranch}
          showOnlyBloodline={showOnlyBloodline}
          lang={lang}
          relationLabels={copy.branchLabels}
        />
      </div>

      {data.externalResearchBranches?.length ? (
        <>
          <div className="atlas-divider" />
          <ArchivalCard title={copy.researchTitle} variant="atlas">
            <p className="text-sm leading-6 text-stone-600">{copy.researchSubtitle}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {data.externalResearchBranches.map((branch) => {
                const theme = branchTheme[branch.branch];
                const dimmed = activeBranch !== null && branch.branch !== activeBranch;
                return (
                  <div
                    key={branch.id}
                    className={['rounded-2xl border border-dashed px-4 py-3 transition max-w-sm', dimmed ? 'opacity-35' : 'opacity-100'].join(' ')}
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="text-sm font-semibold">{branch.name}</div>
                      <RelationshipChip label={copy.branchLabels[branch.relationType]} tone="violet" variant="atlas" />
                    </div>
                    <div className="mt-1 text-xs leading-6">{branch.note}</div>
                  </div>
                );
              })}
            </div>
          </ArchivalCard>
        </>
      ) : null}
    </section>
  );
}
