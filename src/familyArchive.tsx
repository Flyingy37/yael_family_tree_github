import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import type { ArchiveTreeNode } from './archiveTreeNode';
import { familyData } from './familyArchiveData';

/** Primary genealogy narrative: Joshua Kastroll (signed at times Joshua Kastrel in letters). */
export const STORY_SOURCE_FOOTER =
  '(מקור עיקרי: מכתבי Joshua Kastroll ל-Robert Costrell, 27 במאי 1987 ו-25 ביוני 1988; ול-Michael Castroll, 11 בדצמבר 1983; חתימות במקור לעיתים Kastrel.)';

export const STORY_SOURCE_SECONDARY = 'מקור משלים: AlpertsAndCohens31 (מסמך ב-Google Drive).';

export const STORY_SOURCE_ANNOTATIONS =
  '(באיסוף משפחתי: הערות 5-7 מתייחסות למכתבים אלה.)';

/** Historical name variants: when the query touches one term, all synonyms in that group are searched (case-insensitive for Latin). */
export const SMART_ALIAS_SEARCH: Record<string, string[]> = {
  /** Castro / Kastrel / Costrell line + Alperovitz + Gurevitch (one searchable cluster) */
  castro_line: [
    'Castro',
    'castro',
    'Kastrel',
    'kastrel',
    'Kastrol',
    'kastrol',
    'Kastroll',
    'kastroll',
    'Kastrell',
    'kastrell',
    'Castrell',
    'castrell',
    'Costrell',
    'costrell',
    'Alperovitz',
    'alperovitz',
    'Alperovich',
    'alperovich',
    'Gurevitch',
    'gurevitch',
    'Gurevitsch',
    'gurevitsch',
    'Gurvitch',
    'gurvitch',
    'גורביץ',
    'קסטרו',
    'קסטרל',
    'קסטרול',
    'אלפרוביץ',
    'Alpert',
    'alpert',
    'Prague',
    'prague',
    'פראג',
    'Michael Castroll',
    'michael castroll',
    'Joshua Kastrel',
    'joshua kastrel',
    'Joshua Kastroll',
    'joshua kastroll',
    'Gurevich',
    'gurevich',
    'Jehoshua',
    'jehoshua',
  ],
  /** Heilprin + Lanzman (unified English) / Lantsman legacy spellings */
  heilprin_lantsman: [
    'Heilprin',
    'heilprin',
    'היילפרין',
    'הלפרין',
    'היילפרוביץ',
    'Lanzman',
    'lanzman',
    'Lantsman',
    'lantsman',
    'Lanzmann',
    'lanzmann',
    'Landesman',
    'landesman',
    'לנצמן',
    'לנסמן',
    'לנדסמן',
    'halperin',
    'alpert',
    'אלפרט',
  ],
  דוברשטיין: ['Dubershtein', 'Dubrow', 'דוברו', 'dubrow', 'dubershtein'],
  /** Fine branch + Sosenka (narrative doc) */
  fine_sosenka: [
    'Fine',
    'fine',
    'פיין',
    'Chiva',
    'chiva',
    'חיווה',
    'Chivia',
    'חיביה',
    'Sosenka',
    'sosenka',
    'סוסנקה',
    'Reuben',
    'reuben',
    'ראובן',
    'Cohanim',
    'cohanim',
    'כהנים',
    'כהן',
    'Sarah',
    'sarah',
    'שרה',
    'Bessie',
    'bessie',
    'בסי',
    'Bertha',
    'bertha',
    'ברטה',
    'Nadya',
    'nadya',
    'נדיה',
    'Yankev',
    'yankev',
    'יענקל',
    'Markel',
    'markel',
    'מרקל',
    'מרקל אלפרוביץ',
    'Elizya',
    'elizya',
    'Sosonka',
    'sosonka',
    'Alperovich',
    'alperovich',
    'Maizie',
    'maizie',
    'מייזי',
    'America',
    'america',
    'אמריקה',
    'migration',
    'הגירה',
  ],
};

const ALIAS_GROUPS = Object.entries(SMART_ALIAS_SEARCH).map(([key, vals]) => [...new Set([key, ...vals])]);

function norm(s: string) {
  return String(s).trim().toLowerCase();
}

function getSearchTerms(query: string) {
  const q = norm(query);
  if (!q) return [];
  const terms = new Set<string>([q]);
  for (const group of ALIAS_GROUPS) {
    const hit = group.some(term => {
      const t = norm(term);
      return t && (q.includes(t) || t.includes(q));
    });
    if (hit) for (const term of group) terms.add(norm(term));
  }
  return [...terms].filter(Boolean);
}

function nodeMatches(node: ArchiveTreeNode, terms: string[]) {
  const hay = `${node.name ?? ''} ${node.note ?? ''} ${node.story ?? ''}`.toLowerCase();
  return terms.some(t => hay.includes(t));
}

function copySubtree(node: ArchiveTreeNode): ArchiveTreeNode {
  if (!node.children?.length) return { ...node };
  return { ...node, children: node.children.map(copySubtree) };
}

export function filterTree(node: ArchiveTreeNode, query: string): ArchiveTreeNode | null {
  const q = query.trim();
  if (!q) return node;

  const terms = getSearchTerms(query);
  if (terms.length === 0) return node;

  function recurse(n: ArchiveTreeNode): ArchiveTreeNode | null {
    if (nodeMatches(n, terms)) return copySubtree(n);
    if (!n.children?.length) return null;
    const filteredChildren = n.children
      .map(recurse)
      .filter((c: ArchiveTreeNode | null): c is ArchiveTreeNode => c != null);
    if (filteredChildren.length === 0) return null;
    return { ...n, children: filteredChildren };
  }

  return recurse(node);
}

function countTreeNodes(node: ArchiveTreeNode | null): number {
  if (!node) return 0;
  let n = 1;
  if (node.children?.length) {
    for (const c of node.children) n += countTreeNodes(c);
  }
  return n;
}

type ArchiveLang = 'he' | 'en';

type CardVariant = 'dna' | 'hero' | 'victim' | 'survivor' | 'research' | 'default';

function cardVariantFor(node: ArchiveTreeNode): CardVariant {
  if (node.isDNAVerified === true) return 'dna';
  if (node.isHero === true) return 'hero';
  if (node.isVictim === true) return 'victim';
  if (node.isSurvivor === true) return 'survivor';
  if (node.isResearchTarget === true) return 'research';
  return 'default';
}

function StoryModal({
  open,
  title,
  story,
  onClose,
  lang,
}: {
  open: boolean;
  title: string;
  story: string;
  onClose: () => void;
  lang: ArchiveLang;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const closeLabel = lang === 'en' ? 'Close' : 'סגור';
  const overlayLabel = lang === 'en' ? 'Close dialog' : 'סגור חלון';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label={overlayLabel}
        onClick={onClose}
      />
      <div
        className="relative z-[101] max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-stone-200 bg-white p-5 shadow-xl"
        dir={lang === 'en' ? 'ltr' : 'rtl'}
      >
        <h3 id="story-modal-title" className="mb-3 text-lg font-semibold text-stone-900">
          {title}
        </h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{story}</p>
        <div className="mt-4 space-y-2 border-t border-stone-100 pt-3 text-xs text-stone-500">
          <p>{STORY_SOURCE_FOOTER}</p>
          <p>{STORY_SOURCE_SECONDARY}</p>
          <p>{STORY_SOURCE_ANNOTATIONS}</p>
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          onClick={onClose}
        >
          {closeLabel}
        </button>
      </div>
    </div>,
    document.body,
  );
}

function StoryTrigger({ node, lang }: { node: ArchiveTreeNode; lang: ArchiveLang }) {
  const [open, setOpen] = useState(false);
  if (!node.story) return null;
  const card = node.highlightStoryCard === true;
  const label =
    lang === 'en'
      ? card
        ? 'Story card (full narrative)'
        : 'See story'
      : card
        ? 'כרטיס סיפור - פתיחה'
        : 'סיפור היסטורי';
  const btnClass = card
    ? 'mt-3 inline-flex w-full flex-col items-stretch gap-1 rounded-xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-amber-100/90 px-4 py-3 text-start shadow-sm ring-2 ring-amber-200/80 hover:from-amber-100 hover:to-amber-50'
    : 'mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100';
  return (
    <>
      <button
        type="button"
        className={btnClass}
        onClick={() => setOpen(true)}
        aria-label={label}
      >
        <span className="inline-flex items-center gap-1.5 font-semibold text-amber-950">
          <span aria-hidden>📖</span>
          <span>{label}</span>
        </span>
        {card ? (
          <span className="text-xs font-normal text-amber-900/80">
            {lang === 'en' ? 'Opens the full family narrative from the document.' : 'לחצו לסיפור המלא מהמסמך המשפחתי.'}
          </span>
        ) : null}
      </button>
      <StoryModal
        open={open}
        title={node.name}
        story={node.story}
        onClose={() => setOpen(false)}
        lang={lang}
      />
    </>
  );
}

function TreeNode({ node, lang = 'he' }: { node: ArchiveTreeNode; lang?: ArchiveLang }) {
  const variant = cardVariantFor(node);

  const metaBlock = (
    <>
      {node.birth ? <div className="mt-1 text-sm text-stone-600">{node.birth}</div> : null}
      {node.birthPlace ? <div className="text-sm text-stone-600">{node.birthPlace}</div> : null}
      {node.note ? <div className="mt-2 text-sm text-stone-600 whitespace-pre-wrap">{node.note}</div> : null}
    </>
  );

  const storyRow = <StoryTrigger node={node} lang={lang} />;

  const banded = (borderClass: string, headerBg: string, emoji: string, title: string) => (
    <div className={`overflow-hidden rounded-lg border bg-white shadow-sm ${borderClass}`}>
      <div className={`flex flex-wrap items-center gap-2 px-4 py-2 font-semibold text-white ${headerBg}`}>
        <span className="text-lg leading-none" aria-hidden>
          {emoji}
        </span>
        <span>{title}</span>
      </div>
      <div className="p-4">
        {metaBlock}
        {storyRow}
      </div>
    </div>
  );

  let card: ReactNode;
  switch (variant) {
    case 'dna':
      card = banded('border-indigo-600', 'bg-indigo-600', '🧬', node.name);
      break;
    case 'hero':
      card = banded('border-emerald-600', 'bg-emerald-600', '🎖️', node.name);
      break;
    case 'victim':
      card = banded('border-slate-600', 'bg-slate-600', '🕯️', node.name);
      break;
    case 'survivor':
      card = banded('border-amber-500', 'bg-amber-600', '🎗️🕊️', node.name);
      break;
    case 'research':
      card = (
        <div className="rounded-lg border-2 border-dashed border-amber-600 bg-amber-50/40 p-4 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-stone-900">
            <span className="text-xl leading-none" aria-hidden title="יעד מחקר">
              🔍
            </span>
            <span>{node.name}</span>
          </div>
          {metaBlock}
          {storyRow}
        </div>
      );
      break;
    default:
      card = (
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <div className="font-semibold text-stone-900">{node.name}</div>
          {metaBlock}
          {storyRow}
        </div>
      );
  }

  return (
    <div className="space-y-3">
      {card}
      {node.children?.length ? (
        <div className="ms-4 space-y-3 border-s border-stone-200 ps-4">
          {node.children.map((child: ArchiveTreeNode) => (
            <TreeNode key={child.id} node={child} lang={lang} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Narrative archive application shell: holds `searchQuery` and passes filtered tree to `TreeNode`.
 * (Router application remains the default export from App.tsx.)
 */
function ArchiveLegendBody({
  copy,
  className = '',
}: {
  copy: {
    legendTitle: string;
    legendLead: string;
    legendDNA: string;
    legendResearch: string;
    legendVictim: string;
    legendHero: string;
    legendSurvivor: string;
    legendStory: string;
    legendStoryCard: string;
  };
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="mb-2 font-semibold text-stone-900">{copy.legendTitle}</h3>
      <p className="mb-2 text-xs font-medium text-stone-600">{copy.legendLead}</p>
      <ul className="list-inside list-disc space-y-1.5 marker:text-amber-600/70 text-stone-700">
        <li>{copy.legendDNA}</li>
        <li>{copy.legendResearch}</li>
        <li>{copy.legendVictim}</li>
        <li>{copy.legendHero}</li>
        <li>{copy.legendSurvivor}</li>
        <li>{copy.legendStory}</li>
        <li>{copy.legendStoryCard}</li>
      </ul>
    </div>
  );
}

export function FamilyArchiveApp({ lang = 'he' }: { lang?: ArchiveLang } = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayTree = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return familyData;
    return filterTree(familyData, searchQuery);
  }, [searchQuery]);

  const visibleCardCount = useMemo(() => countTreeNodes(displayTree), [displayTree]);
  const isFiltered = searchQuery.trim().length > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const copy =
    lang === 'en'
      ? {
          title: 'Family narrative archive',
          subtitle:
            'Smart search across historical spellings (Castro/Kastrel, Halperin/Alperovitz, and related variants).',
          placeholder: 'Search by name or note text…',
          searchAria: 'Search the narrative archive',
          empty: 'No matching results.',
          emptyHint: 'Try names like Castro, Kastroll, Alperovitz, Heilprin, or Fine.',
          clear: 'Clear search',
          legendToggle: 'Legend: card types',
          resultsLabel: (n: number) => `${n.toLocaleString()} cards in view`,
          filteredHint: 'Filtered tree',
          keyboardHint: 'Ctrl or ⌘ K — focus search',
          legendTitle: 'Legend',
          legendLead: 'Card icons (headers):',
          legendDNA: '🧬 DNA verified (indigo)',
          legendResearch: '🔍 Research target (dashed amber)',
          legendVictim: '🕯️ Holocaust victim (slate)',
          legendHero: '🎖️ Hero / partisan (emerald)',
          legendSurvivor: '🎗️🕊️ Holocaust survivor (amber)',
          legendStory: '📖 Historical narrative (opens modal)',
          legendStoryCard: '📇 Story card (highlighted button, full narrative)',
        }
      : {
          title: 'ארכיון משפחתי',
          subtitle:
            'חיפוש חכם לפי שמות וכינויים (קסטרו/קסטרל/אלפרוביץ/גורביץ, פיין, סוסנקה, והלפרין-לנצמן)',
          placeholder: 'חפש לפי שם או טקסט בהערות…',
          searchAria: 'חיפוש בארכיון המשפחתי',
          empty: 'אין תוצאות התואמות לחיפוש.',
          emptyHint: 'נסו למשל: קסטרו, קסטרול, אלפרוביץ, היילפרין, פיין.',
          clear: 'נקה חיפוש',
          legendToggle: 'מקרא: סוגי כרטיסים',
          resultsLabel: (n: number) => `${n.toLocaleString()} כרטיסים בתצוגה`,
          filteredHint: 'עץ מסונן',
          keyboardHint: 'Ctrl או ⌘ K — מיקוד חיפוש',
          legendTitle: 'מקרא',
          legendLead: 'סמלים בכותרת הכרטיס:',
          legendDNA: '🧬 מאומת ב-DNA (אינדיגו)',
          legendResearch: '🔍 יעד מחקר (ענבר מקווקו)',
          legendVictim: '🕯️ קורבן שואה (אפור)',
          legendHero: '🎖️ גיבור / פרטיזן (אזמרגד)',
          legendSurvivor: '🎗️🕊️ ניצול שואה (ענבר)',
          legendStory: '📖 נרטיב היסטורי (לחצו לפתיחת סיפור)',
          legendStoryCard: '📇 כרטיס סיפור (כפתור מודגש, נרטיב מלא)',
        };

  return (
    <div className="py-6 sm:py-8" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <header className="mb-5 rounded-xl border border-stone-200/80 bg-white/90 px-4 py-4 shadow-sm sm:px-5">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-[1.65rem]">{copy.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{copy.subtitle}</p>
      </header>

      <div className="sticky top-0 z-10 -mx-1 mb-5 bg-gradient-to-b from-[rgb(250_250_249_/_0.97)] via-[rgb(250_250_249_/_0.92)] to-transparent pb-2 pt-1 backdrop-blur-sm px-1">
        <div className="relative mx-auto w-full max-w-2xl">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            strokeWidth={2}
            aria-hidden
          />
          <input
            ref={searchInputRef}
            type="search"
            className="w-full rounded-xl border border-stone-300 bg-white py-3 ps-10 pe-11 text-sm text-stone-900 shadow-sm outline-none ring-stone-400 placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            placeholder={copy.placeholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoComplete="off"
            aria-label={copy.searchAria}
          />
          {searchQuery.trim() ? (
            <button
              type="button"
              className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              aria-label={copy.clear}
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>
        <div className="mx-auto mt-2 flex max-w-2xl flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
          <span>{copy.keyboardHint}</span>
          <span className="hidden sm:inline" aria-hidden>
            ·
          </span>
          <span className={isFiltered ? 'font-medium text-amber-900/90' : ''}>
            {isFiltered ? `${copy.filteredHint} · ` : ''}
            {copy.resultsLabel(visibleCardCount)}
          </span>
        </div>
      </div>

      <details className="mb-6 rounded-xl border border-stone-200 bg-white/90 shadow-sm md:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-stone-800 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex w-full items-center justify-between gap-2">
            {copy.legendToggle}
            <span className="text-xs font-normal text-stone-500">{copy.legendTitle}</span>
          </span>
        </summary>
        <div className="border-t border-stone-100 px-4 pb-4 pt-2 text-sm">
          <ArchiveLegendBody copy={copy} />
        </div>
      </details>

      <aside
        className="mb-6 hidden rounded-xl border border-stone-200 bg-white/90 p-4 text-sm text-stone-700 shadow-sm md:block"
        aria-label={copy.legendTitle}
      >
        <ArchiveLegendBody copy={copy} />
      </aside>

      {!displayTree ? (
        <div
          className="rounded-xl border border-dashed border-stone-300 bg-stone-50/80 px-4 py-8 text-center"
          role="status"
        >
          <p className="text-sm font-medium text-stone-700">{copy.empty}</p>
          <p className="mt-2 text-xs leading-relaxed text-stone-500">{copy.emptyHint}</p>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-amber-800 underline-offset-2 hover:underline"
            onClick={() => setSearchQuery('')}
          >
            {copy.clear}
          </button>
        </div>
      ) : (
        <section className="space-y-3" aria-label={lang === 'en' ? 'Archive tree' : 'עץ הארכיון'}>
          <TreeNode node={displayTree} lang={lang} />
        </section>
      )}
    </div>
  );
}
