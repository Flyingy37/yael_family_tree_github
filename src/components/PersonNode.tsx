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

export const PersonNode = memo(({ data }: PersonNodeProps) => {
  const { person, isRoot, isSelected } = data;
  const t = data.language === 'he';
  const genColor = getGenerationColor(person.generation);

  return (
    <div
      className={`
        w-56 px-3 py-2 rounded-lg border-2 shadow-sm cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${getSexBorder(person.sex)} ${getSexBg(person.sex)}
        ${isSelected ? 'ring-2 ring-yellow-400 shadow-lg' : ''}
        ${isRoot ? 'ring-2 ring-amber-500 border-amber-500' : ''}
      `}
      style={{ minWidth: 160, maxWidth: 224 }}
      onClick={() => data.onClick(person.id)}
      dir="ltr"
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />

      <div className="flex items-center gap-1 mb-1 min-w-0">
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

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
    </div>
  );
});

PersonNode.displayName = 'PersonNode';
