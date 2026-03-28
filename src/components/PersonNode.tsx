import { memo } from 'react';
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
  type LucideIcon,
} from 'lucide-react';
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
  Partisan:  { Icon: Shield,       labelEn: 'Partisan',         labelHe: 'פרטיזן',  color: '#374151', bg: '#f3f4f6' },
  Famous:    { Icon: Star,         labelEn: 'Notable',          labelHe: 'מפורסם',  color: '#92400e', bg: '#fef3c7' },
  Rabbi:     { Icon: BookMarked,   labelEn: 'Rabbi',            labelHe: 'רב',      color: '#1e40af', bg: '#dbeafe' },
  Lineage:   { Icon: Scroll,       labelEn: 'Notable lineage',  labelHe: 'ייחוס',   color: '#5b21b6', bg: '#ede9fe' },
  Heritage:  { Icon: Landmark,     labelEn: 'Jewish heritage',  labelHe: 'מסורת',   color: '#065f46', bg: '#d1fae5' },
  Migration: { Icon: PlaneTakeoff, labelEn: 'Migration',        labelHe: 'הגירה',   color: '#0e7490', bg: '#cffafe' },
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
      Icon: Swords, key: 'war',
      label: isHe ? 'נפל במלחמה' : 'War casualty',
      color: '#991b1b', bg: '#fee2e2',
    });
  }
  if (person.doubleBloodTie) {
    badges.push({
      Icon: GitMerge, key: 'blood',
      label: isHe ? 'קשר דם כפול' : 'Double blood tie',
      color: '#6d28d9', bg: '#ede9fe',
    });
  }
  for (const tag of person.tags) {
    if (tag === 'DNA') continue; // rendered separately
    const cfg = TAG_CONFIG[tag];
    if (cfg) {
      badges.push({
        Icon: cfg.Icon, key: tag,
        label: isHe ? cfg.labelHe : cfg.labelEn,
        color: cfg.color, bg: cfg.bg,
      });
    }
  }
  return badges;
}

export const PersonNode = memo(({ data }: PersonNodeProps) => {
  const { person, isRoot, isSelected, isCollapsed, hasChildren, isOnPath } = data;
  const isHe = data.language === 'he';
  const genColor = getGenerationColor(person.generation);
  const avatarColors = getAvatarColors(person.sex);
  const accent = getSexAccent(person.sex);
  const initials = getInitials(person.givenName, person.fullName);
  const tagBadges = buildTagBadges(person, isHe);
  const hasDNA = person.tags.includes('DNA');

  const borderColor = isRoot
    ? '#f59e0b'
    : isOnPath
    ? '#f97316'
    : isSelected
    ? '#facc15'
    : accent;

  const shadowStyle = isSelected
    ? '0 0 0 2px #facc15, 0 4px 12px rgba(0,0,0,0.12)'
    : isOnPath
    ? '0 0 0 2px #f97316, 0 4px 12px rgba(249,115,22,0.2)'
    : isRoot
    ? '0 0 0 2px #f59e0b, 0 4px 12px rgba(245,158,11,0.2)'
    : '0 2px 6px rgba(0,0,0,0.08)';

  return (
    <div
      style={{
        width: 200,
        backgroundColor: '#ffffff',
        border: `2px solid ${borderColor}`,
        borderRadius: 10,
        boxShadow: shadowStyle,
        cursor: 'pointer',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      onClick={() => data.onClick(person.id)}
      dir="ltr"
    >
      <Handle type="target" position={Position.Top} style={{ background: '#cbd5e1', width: 8, height: 8 }} />

      {/* Generation stripe at top */}
      <div style={{ height: 3, backgroundColor: genColor, width: '100%' }} />

      <div style={{ padding: '6px 8px 4px' }}>
        {/* Header row: avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          {/* Avatar */}
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              backgroundColor: avatarColors.bg,
              color: avatarColors.text,
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: `1.5px solid ${accent}40`,
            }}
            aria-hidden="true"
          >
            {initials}
          </div>

          {/* Holocaust patch icon */}
          {person.holocaustVictim && (
            <HolocaustMemorialPatchIcon
              size={16}
              title={isHe ? 'קורבן שואה' : 'Holocaust victim'}
              className="flex-shrink-0"
            />
          )}

          {/* Name */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#1e293b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}
            title={person.fullName}
          >
            {person.fullName}
          </span>
        </div>

        {/* Birth date + DNA badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 14 }}>
          <span style={{ fontSize: 9.5, color: '#64748b' }}>
            {person.birthDate || ''}
          </span>
          {hasDNA && (
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 2,
                backgroundColor: '#d1fae5', color: '#065f46',
                borderRadius: 4, padding: '1px 4px',
                fontSize: 9, fontWeight: 600,
              }}
              title={isHe ? 'התאמת DNA מאומתת' : 'Verified DNA match'}
            >
              <Dna size={9} />
              DNA
            </span>
          )}
        </div>

        {/* Relation label */}
        {person.relationToYael && (
          <div
            style={{
              fontSize: 9, color: '#94a3b8', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1,
            }}
            title={person.relationToYael}
          >
            {person.relationToYael}
          </div>
        )}

        {/* Tag badge chips */}
        {tagBadges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 5 }}>
            {tagBadges.map(badge => (
              <span
                key={badge.key}
                title={badge.label}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 18, height: 18,
                  backgroundColor: badge.bg,
                  color: badge.color,
                  borderRadius: 4,
                  cursor: 'default',
                  flexShrink: 0,
                }}
                aria-label={badge.label}
              >
                <badge.Icon size={11} strokeWidth={2} />
              </span>
            ))}
          </div>
        )}

        {/* Collapse/expand button */}
        {hasChildren && data.onToggleCollapse && (
          <button
            style={{
              marginTop: 5,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '2px 0',
              borderRadius: 4,
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              color: '#64748b',
              fontSize: 9,
              cursor: 'pointer',
              lineHeight: 1,
            }}
            onClick={e => {
              e.stopPropagation();
              data.onToggleCollapse!(person.id);
            }}
            title={isCollapsed
              ? (isHe ? 'פרוס ענף' : 'Expand branch')
              : (isHe ? 'קפל ענף' : 'Collapse branch')}
          >
            <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>
              {isCollapsed ? '+' : '−'}
            </span>
            <span>{isCollapsed
              ? (isHe ? 'פרוס' : 'Expand')
              : (isHe ? 'קפל' : 'Collapse')}
            </span>
          </button>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#cbd5e1', width: 8, height: 8 }} />
    </div>
  );
});

PersonNode.displayName = 'PersonNode';
