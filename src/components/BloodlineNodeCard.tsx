import { Link } from 'react-router-dom';
import { RelationshipChip } from './RelationshipChip';
import { branchTheme } from '../data/branchTheme';
import type { BranchKey, TreeNode, UiLang } from '../types/familyTree';

export function BloodlineNodeCard({
  node,
  activeBranch,
  lang,
  relationLabel,
}: {
  node: TreeNode;
  activeBranch: BranchKey | null;
  lang: UiLang;
  relationLabel: string;
}) {
  const theme = branchTheme[node.branch];
  const isDimmed = activeBranch !== null && node.branch !== activeBranch;
  const href = node.id.startsWith('@') ? `/${lang}/person/${encodeURIComponent(node.id)}` : null;
  const isResearch = node.relationType !== 'blood';

  return (
    <div
      className={[
        'rounded-2xl border px-4 py-3 shadow-sm transition-all duration-200',
        isDimmed ? 'opacity-35' : 'opacity-100',
      ].join(' ')}
      style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
    >
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: theme.dot }} />
          <div className="min-w-0 flex-1">
            {href ? (
              <Link to={href} className="text-sm font-semibold leading-6 text-[var(--atlas-text)] underline decoration-stone-300 underline-offset-4 hover:text-stone-950">
                {node.name}
              </Link>
            ) : (
              <div className="text-sm font-semibold leading-6 text-[var(--atlas-text)]">{node.name}</div>
            )}
            <div className="mt-1 flex flex-wrap gap-1.5">
              <RelationshipChip
                label={relationLabel}
                tone={isResearch ? 'violet' : 'stone'}
                variant="atlas"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
