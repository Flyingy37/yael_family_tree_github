import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Person } from '../types';
import { HolocaustMemorialPatchIcon } from './HolocaustMemorialPatchIcon';

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
  };
}

function getGenerationColor(generation: number | null): string {
  if (generation === null) return '#94a3b8';
  if (generation >= 1) return '#22c55e';   // green - younger
  if (generation === 0) return '#eab308';  // yellow - Yael's gen
  if (generation >= -2) return '#f97316';  // orange - parents/grandparents
  if (generation >= -5) return '#ef4444';  // red - great-grandparents
  if (generation >= -10) return '#a855f7'; // purple - older
  return '#6366f1';                         // indigo - ancient
}

function getSexBorder(sex: string): string {
  if (sex === 'F') return 'border-pink-400';
  if (sex === 'M') return 'border-blue-400';
  return 'border-gray-400';
}

function getSexBg(sex: string): string {
  if (sex === 'F') return 'bg-pink-50';
  if (sex === 'M') return 'bg-blue-50';
  return 'bg-gray-50';
}

function getAvatarColors(sex: string): { bg: string; text: string } {
  if (sex === 'F') return { bg: '#f9a8d4', text: '#831843' };
  if (sex === 'M') return { bg: '#93c5fd', text: '#1e3a5f' };
  return { bg: '#cbd5e1', text: '#334155' };
}

function getInitials(givenName: string, fullName: string): string {
  const name = givenName || fullName;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

interface TagBadge {
  emoji: string;
  labelEn: string;
  labelHe: string;
  color: string;
}

const TAG_CONFIG: Record<string, TagBadge> = {
  Partisan:  { emoji: '✊', labelEn: 'Partisan',        labelHe: 'פרטיזן',      color: '#6b7280' },
  Famous:    { emoji: '⭐', labelEn: 'Famous',           labelHe: 'מפורסם',      color: '#d97706' },
  Rabbi:     { emoji: '✡️', labelEn: 'Rabbi',            labelHe: 'רב',          color: '#1d4ed8' },
  Lineage:   { emoji: '📜', labelEn: 'Notable lineage',  labelHe: 'ייחוס',       color: '#7c3aed' },
  Heritage:  { emoji: '🏛️', labelEn: 'Jewish heritage',  labelHe: 'מסורת',       color: '#059669' },
  Migration: { emoji: '✈️', labelEn: 'Migration',        labelHe: 'הגירה',       color: '#0891b2' },
};

function buildTagBadges(person: Person, isHe: boolean): Array<{ emoji: string; title: string }> {
  const badges: Array<{ emoji: string; title: string }> = [];

  if (person.warCasualty) {
    badges.push({ emoji: '⚔️', title: isHe ? 'נפל במלחמה' : 'War casualty' });
  }
  if (person.doubleBloodTie) {
    badges.push({ emoji: '🔀', title: isHe ? 'קשר דם כפול' : 'Double blood tie' });
  }
  for (const tag of person.tags) {
    const cfg = TAG_CONFIG[tag];
    if (cfg) {
      badges.push({ emoji: cfg.emoji, title: isHe ? cfg.labelHe : cfg.labelEn });
    }
  }
  return badges;
}

export const PersonNode = memo(({ data }: PersonNodeProps) => {
  const { person, isRoot, isSelected, isCollapsed, hasChildren, isOnPath } = data;
  const t = data.language === 'he';
  const genColor = getGenerationColor(person.generation);
  const avatarColors = getAvatarColors(person.sex);
  const initials = getInitials(person.givenName, person.fullName);
  const tagBadges = buildTagBadges(person, t);

  return (
    <div
      className={`
        w-56 px-2 py-2 rounded-lg border-2 shadow-sm cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${getSexBorder(person.sex)} ${getSexBg(person.sex)}
        ${isSelected ? 'ring-2 ring-yellow-400 shadow-lg' : ''}
        ${isRoot ? 'ring-2 ring-amber-500 border-amber-500' : ''}
        ${isOnPath ? 'ring-2 ring-orange-400 shadow-orange-200 shadow-md' : ''}
      `}
      style={{ minWidth: 160, maxWidth: 224 }}
      onClick={() => data.onClick(person.id)}
      dir="ltr"
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />

      <div className="flex items-center gap-1.5 mb-1 min-w-0">
        {/* Avatar circle */}
        <span
          className="flex-shrink-0 rounded-full flex items-center justify-center font-bold"
          style={{
            width: 22,
            height: 22,
            backgroundColor: avatarColors.bg,
            color: avatarColors.text,
            fontSize: 9,
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          {initials}
        </span>

        {/* Generation dot */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: genColor }}
          title={t ? `דור ${person.generation ?? '?'}` : `Generation ${person.generation ?? '?'}`}
        />

        {person.holocaustVictim && (
          <HolocaustMemorialPatchIcon
            size={18}
            title={t ? 'קורבן שואה' : 'Holocaust victim'}
            className="flex-shrink-0"
          />
        )}
        <span className="text-xs font-bold truncate min-w-0" title={person.fullName}>
          {person.fullName}
        </span>
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <span>{person.birthDate || ''}</span>
        {person.tags.includes('DNA') && (
          <span title={t ? 'קיימת התאמת DNA מאומתת' : 'Verified DNA match available'}>🧬</span>
        )}
      </div>

      {person.relationToYael && (
        <div className="text-[10px] text-gray-400 truncate mt-0.5" title={person.relationToYael}>
          {person.relationToYael}
        </div>
      )}

      {/* Tag badges row */}
      {tagBadges.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1">
          {tagBadges.map(badge => (
            <span
              key={badge.title}
              title={badge.title}
              style={{ fontSize: 11, lineHeight: 1.2, cursor: 'default' }}
              aria-label={badge.title}
            >
              {badge.emoji}
            </span>
          ))}
        </div>
      )}

      {/* Collapse/expand toggle */}
      {hasChildren && data.onToggleCollapse && (
        <button
          className="mt-1 w-full flex items-center justify-center text-[9px] text-gray-400 hover:text-gray-600 transition-colors"
          style={{ lineHeight: 1 }}
          onClick={e => {
            e.stopPropagation();
            data.onToggleCollapse!(person.id);
          }}
          title={isCollapsed
            ? (t ? 'פרוס ענף' : 'Expand branch')
            : (t ? 'קפל ענף' : 'Collapse branch')}
        >
          <span className="text-base leading-none">{isCollapsed ? '＋' : '－'}</span>
        </button>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
    </div>
  );
});

PersonNode.displayName = 'PersonNode';
