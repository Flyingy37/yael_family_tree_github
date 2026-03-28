import { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Swords,
  GitMerge,
  Shield,
  Star,
  BookMarked,
  Scroll,
  Landmark,
  PlaneTakeoff,
  Dna,
  MapPin,
  Focus,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import type { Person } from '../types';
import { HolocaustMemorialPatchIcon } from './HolocaustMemorialPatchIcon';
import { NODE_WIDTH, NODE_HEIGHT } from '../utils/layout';

interface PersonNodeProps {
  data: {
    person: Person;
    isRoot: boolean;
    isSelected: boolean;
    onClick: (id: string) => void;
    language?: 'en' | 'he';
    onToggleCollapse?: (id: string) => void;
    isCollapsed?: boolean;
    hasChildren?: boolean;
    isOnPath?: boolean;
    isPathStart?: boolean;
    onFocusSubtree?: (id: string) => void;
    descendantCount?: number;
    /** Large-tree lazy load: show + to reveal hidden neighbors */
    hasLazyExpand?: boolean;
    lazyHiddenCount?: number;
    onExpandBranch?: (id: string) => void;
  };
}

/** Extract a 4-digit year from a date string like "13 AUG 1923" → 1923 */
function extractYear(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const m = dateStr.match(/\b(\d{4})\b/);
  return m ? parseInt(m[1], 10) : null;
}

/** Build "1923 – 1996" or "b. 1923" or "d. 1996" */
function lifeSpan(person: Person): string | null {
  const b = extractYear(person.birthDate);
  const d = extractYear(person.deathDate);
  if (b && d) return `${b} – ${d}`;
  if (b) return `b. ${b}`;
  if (d) return `d. ${d}`;
  return null;
}

/** Prefer plain note; fall back to HTML-stripped `note` */
function researchNoteText(person: Person): string | null {
  const plain = person.note_plain?.trim();
  if (plain) return plain;
  const raw = person.note?.trim();
  if (!raw) return null;
  const stripped = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped || null;
}

function getGenerationColor(generation: number | null): string {
  if (generation === null) return '#94a3b8';
  if (generation >= 1) return '#22c55e';
  if (generation === 0) return '#eab308';
  if (generation >= -2) return '#f97316';
  if (generation >= -5) return '#ef4444';
  if (generation >= -10) return '#a855f7';
  return '#6366f1';
}

function getAvatarColors(sex: string): { bg: string; text: string } {
  if (sex === 'F') return { bg: '#fce7f3', text: '#9d174d' };
  if (sex === 'M') return { bg: '#dbeafe', text: '#1e40af' };
  return { bg: '#f1f5f9', text: '#475569' };
}

function getSexAccent(sex: string): string {
  if (sex === 'F') return '#f472b6';
  if (sex === 'M') return '#60a5fa';
  return '#94a3b8';
}

function getInitials(givenName: string, fullName: string): string {
  const name = givenName || fullName;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

interface TagConfig {
  Icon: LucideIcon;
  labelEn: string;
  labelHe: string;
  color: string;
  bg: string;
}

const TAG_CONFIG: Record<string, TagConfig> = {
  Partisan: { Icon: Shield, labelEn: 'Partisan', labelHe: 'פרטיזן', color: '#374151', bg: '#f3f4f6' },
  Famous: { Icon: Star, labelEn: 'Notable', labelHe: 'מפורסם', color: '#92400e', bg: '#fef3c7' },
  Rabbi: { Icon: BookMarked, labelEn: 'Rabbi', labelHe: 'רב', color: '#1e40af', bg: '#dbeafe' },
  Lineage: { Icon: Scroll, labelEn: 'Notable lineage', labelHe: 'ייחוס', color: '#5b21b6', bg: '#ede9fe' },
  Heritage: { Icon: Landmark, labelEn: 'Jewish heritage', labelHe: 'מסורת', color: '#065f46', bg: '#d1fae5' },
  Migration: { Icon: PlaneTakeoff, labelEn: 'Migration', labelHe: 'הגירה', color: '#0e7490', bg: '#cffafe' },
};

interface BadgeEntry {
  Icon: LucideIcon;
  label: string;
  color: string;
  bg: string;
  key: string;
}

function buildTagBadges(person: Person, isHe: boolean): BadgeEntry[] {
  const badges: BadgeEntry[] = [];

  if (person.warCasualty) {
    badges.push({
      Icon: Swords,
      key: 'war',
      label: isHe ? 'נפל במלחמה' : 'War casualty',
      color: '#991b1b',
      bg: '#fee2e2',
    });
  }
  if (person.doubleBloodTie) {
    badges.push({
      Icon: GitMerge,
      key: 'blood',
      label: isHe ? 'קשר דם כפול' : 'Double blood tie',
      color: '#6d28d9',
      bg: '#ede9fe',
    });
  }
  for (const tag of person.tags) {
    if (tag === 'DNA') continue;
    const cfg = TAG_CONFIG[tag];
    if (cfg) {
      badges.push({
        Icon: cfg.Icon,
        key: tag,
        label: isHe ? cfg.labelHe : cfg.labelEn,
        color: cfg.color,
        bg: cfg.bg,
      });
    }
  }
  return badges;
}

export const PersonNode = memo(({ data }: PersonNodeProps) => {
  const {
    person,
    isRoot,
    isSelected,
    isCollapsed,
    hasChildren,
    isOnPath,
    isPathStart,
    descendantCount,
    hasLazyExpand,
    lazyHiddenCount,
  } = data;
  const isHe = data.language === 'he';
  const [hovered, setHovered] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  const genColor = getGenerationColor(person.generation);
  const avatarColors = getAvatarColors(person.sex);
  const accent = getSexAccent(person.sex);
  const initials = getInitials(person.givenName, person.fullName);
  const tagBadges = buildTagBadges(person, isHe);
  const hasDNA = person.tags.includes('DNA');
  const span = lifeSpan(person);
  const noteBody = researchNoteText(person);
  const birthY = extractYear(person.birthDate);
  const deathY = extractYear(person.deathDate);
  const photoSrc = person.photoUrl?.trim();
  const showPhoto = Boolean(photoSrc && !imgFailed);

  const borderColor = isRoot
    ? '#f59e0b'
    : isPathStart
      ? '#6366f1'
      : isOnPath
        ? '#f97316'
        : isSelected
          ? '#facc15'
          : accent;

  const shadowClass = isSelected
    ? 'shadow-[0_0_0_2px_#facc15,0_8px_24px_rgba(15,23,42,0.12)]'
    : isPathStart
      ? 'shadow-[0_0_0_3px_#6366f1,0_8px_28px_rgba(99,102,241,0.25)]'
      : isOnPath
        ? 'shadow-[0_0_0_2px_#f97316,0_8px_24px_rgba(249,115,22,0.2)]'
        : isRoot
          ? 'shadow-[0_0_0_2px_#f59e0b,0_8px_22px_rgba(245,158,11,0.18)]'
          : 'shadow-md shadow-slate-900/10';

  return (
    <div
      className="relative font-sans transition-shadow duration-300 ease-out hover:shadow-lg hover:shadow-slate-900/12"
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* React Flow: handles anchored to this fixed-size box (center top / center bottom) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !rounded-full !border-2 !border-white !bg-slate-400"
      />

      {hovered && (span || person.birthPlace || data.onFocusSubtree) && (
        <div
          className="pointer-events-auto absolute bottom-[calc(100%+8px)] left-1/2 z-[9999] min-w-[180px] max-w-[240px] -translate-x-1/2"
          dir={isHe ? 'rtl' : 'ltr'}
          onClick={e => e.stopPropagation()}
        >
          <div className="rounded-lg bg-slate-800 px-2.5 py-2 text-[11px] leading-relaxed text-slate-100 shadow-xl shadow-slate-900/40">
            <div className="mb-1 font-bold text-white">{person.fullName}</div>
            {span && <div className="mb-0.5 text-slate-400">🕰 {span}</div>}
            {person.birthPlace && (
              <div className="mb-0.5 flex items-center gap-1 text-slate-400">
                <MapPin size={10} className="shrink-0" />
                <span className="min-w-0 flex-1">{person.birthPlace}</span>
              </div>
            )}
            {person.relationToYael && (
              <div className="mt-0.5 text-[10px] text-amber-300">{person.relationToYael}</div>
            )}
            {data.onFocusSubtree && (
              <button
                type="button"
                className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-md bg-slate-700 py-1 text-[10px] text-slate-200 transition-colors hover:bg-slate-600"
                onClick={e => {
                  e.stopPropagation();
                  data.onFocusSubtree!(person.id);
                }}
              >
                <Focus size={10} />
                {isHe ? 'התמקד בענף זה' : 'Focus on this branch'}
              </button>
            )}
          </div>
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-800"
            aria-hidden
          />
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => data.onClick(person.id)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            data.onClick(person.id);
          }
        }}
        className={`flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border-2 bg-white transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-px ${shadowClass}`}
        style={{ borderColor }}
        dir="ltr"
      >
        {/* Generation accent */}
        <div className="h-0.5 w-full shrink-0" style={{ backgroundColor: genColor }} />

        {/* Avatar / photo */}
        <div className="relative h-14 w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">
          {showPhoto ? (
            <img
              src={photoSrc}
              alt=""
              className="h-full w-full object-cover object-top transition-opacity duration-300"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-0.5"
              style={{ background: `linear-gradient(145deg, ${avatarColors.bg} 0%, #fff 100%)` }}
              aria-hidden
            >
              <User className="h-6 w-6 text-slate-400/90" strokeWidth={1.5} />
              <span
                className="text-[10px] font-bold tracking-wide"
                style={{ color: avatarColors.text }}
              >
                {initials}
              </span>
            </div>
          )}
          {person.holocaustVictim && (
            <div className="absolute right-1.5 top-1.5 drop-shadow-sm">
              <HolocaustMemorialPatchIcon
                size={18}
                title={isHe ? 'קורבן שואה' : 'Holocaust victim'}
                className="flex-shrink-0"
              />
            </div>
          )}
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col gap-1 px-2.5 pb-1.5 pt-1.5"
          dir={isHe ? 'rtl' : 'ltr'}
        >
          <div className="shrink-0 space-y-1">
            <div className="flex min-w-0 items-start justify-between gap-1">
              <h2
                className="line-clamp-2 min-w-0 flex-1 text-left text-[11px] font-semibold leading-snug text-slate-800"
                title={person.fullName}
              >
                {person.fullName}
              </h2>
              {hasDNA && (
                <span
                  className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-emerald-100 px-1 py-0.5 text-[8.5px] font-semibold text-emerald-800"
                  title={isHe ? 'התאמת DNA מאומתת' : 'Verified DNA match'}
                >
                  <Dna size={9} />
                  DNA
                </span>
              )}
            </div>

            {/* Birth / death years */}
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0 text-[11px] tabular-nums">
              {birthY != null && (
                <span className="font-semibold text-slate-700">
                  <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                    {isHe ? 'לידה' : 'b.'}{' '}
                  </span>
                  {birthY}
                </span>
              )}
              {birthY != null && deathY != null && <span className="text-slate-300">|</span>}
              {deathY != null && (
                <span className="font-semibold text-slate-600">
                  <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                    {isHe ? 'פטירה' : 'd.'}{' '}
                  </span>
                  {deathY}
                </span>
              )}
              {birthY == null && deathY == null && (
                <span className="text-[10px] text-slate-400">
                  {isHe ? 'תאריכים לא ידועים' : 'Dates unknown'}
                </span>
              )}
              {birthY != null && deathY == null && <span className="text-[10px] text-slate-400">—</span>}
            </div>

            {person.relationToYael && (
              <p className="truncate text-[9px] text-slate-400" title={person.relationToYael}>
                {person.relationToYael}
              </p>
            )}

            {tagBadges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tagBadges.map(badge => (
                  <span
                    key={badge.key}
                    title={badge.label}
                    className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: badge.bg, color: badge.color }}
                    aria-label={badge.label}
                  >
                    <badge.Icon size={11} strokeWidth={2} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="min-h-0 min-w-0 flex-1" aria-hidden />

          {noteBody && (
            <div className="min-h-0 shrink-0 border-t border-slate-100 pt-1">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-1 rounded-lg py-0.5 text-left text-[9px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
                aria-expanded={notesOpen}
                onClick={e => {
                  e.stopPropagation();
                  setNotesOpen(o => !o);
                }}
              >
                <span>{isHe ? 'הערות' : 'Notes'}</span>
                {notesOpen ? <ChevronUp size={12} className="shrink-0" /> : <ChevronDown size={12} className="shrink-0" />}
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${notesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className="max-h-[52px] overflow-y-auto pr-0.5 text-[9px] leading-snug text-slate-600">
                    {noteBody}
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasLazyExpand && data.onExpandBranch && (
            <button
              type="button"
              className="flex w-full shrink-0 items-center justify-center gap-1 rounded-lg border border-violet-200 bg-violet-50 py-0.5 text-[9px] font-semibold text-violet-800 shadow-sm transition-all duration-200 hover:border-violet-300 hover:bg-violet-100"
              onClick={e => {
                e.stopPropagation();
                data.onExpandBranch!(person.id);
              }}
              title={isHe ? 'הצג קרובי משפחה נוספים מהמסנן' : 'Load more relatives (same filters)'}
            >
              <Plus className="h-3 w-3 shrink-0" strokeWidth={2.5} />
              <span>
                {lazyHiddenCount != null && lazyHiddenCount > 0
                  ? isHe
                    ? `+${lazyHiddenCount} קרובים`
                    : `+${lazyHiddenCount} relatives`
                  : isHe
                    ? 'הרחב'
                    : 'Expand'}
              </span>
            </button>
          )}

          {hasChildren && data.onToggleCollapse && (
            <button
              type="button"
              className="flex w-full shrink-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-0.5 text-[9px] text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-100"
              onClick={e => {
                e.stopPropagation();
                data.onToggleCollapse!(person.id);
              }}
              title={
                isCollapsed ? (isHe ? 'פרוס ענף' : 'Expand branch') : isHe ? 'קפל ענף' : 'Collapse branch'
              }
            >
              <span className="text-[11px] font-bold leading-none">{isCollapsed ? '+' : '−'}</span>
              <span>{isCollapsed ? (isHe ? 'פרוס' : 'Expand') : isHe ? 'קפל' : 'Collapse'}</span>
              {descendantCount !== undefined && descendantCount > 0 && (
                <span className="rounded bg-sky-100 px-1 text-[8.5px] font-bold text-sky-800">
                  {descendantCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !rounded-full !border-2 !border-white !bg-slate-400"
      />
    </div>
  );
});

PersonNode.displayName = 'PersonNode';
