import React, { useState, useCallback } from 'react';
import { MapPin, TreeDeciduous, User, Calendar } from 'lucide-react';
import type { Person } from '../types';

interface MemberCardProps {
  member: Person;
  onFocusBranch: () => void;
  onOpenBio: () => void;
  language?: 'en' | 'he';
}

/** Extract a 4-digit year from a date string. */
function extractYear(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const m = dateStr.match(/\b(\d{4})\b/);
  return m ? parseInt(m[1], 10) : null;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onFocusBranch, onOpenBio, language = 'he' }) => {
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  const isMale = member.sex === 'M';
  const isFemale = member.sex === 'F';
  const isHe = language === 'he';
  const birthYear = extractYear(member.birthDate);
  const deathYear = extractYear(member.deathDate);
  const surname = member.surnameFinal || member.surname || '';

  // Minimalist archive: subtle left border by gender
  const borderColor = isMale
    ? 'border-l-stone-400'
    : isFemale
      ? 'border-l-stone-600'
      : 'border-l-stone-300';

  return (
    <div
      className={`relative group border border-stone-200 ${borderColor} border-l-2 bg-white rounded transition-shadow duration-200 ${
        hovered ? 'shadow-sm' : ''
      }`}
      dir={isHe ? 'rtl' : 'ltr'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main content */}
      <div className="px-3 py-2.5">
        {/* Name */}
        <h3 className="text-sm font-medium text-stone-900 leading-snug line-clamp-2">
          {member.fullName}
        </h3>

        {/* Dates */}
        {(birthYear || deathYear) && (
          <p className="mt-1 text-xs text-stone-500 tabular-nums flex items-center gap-1">
            <Calendar size={11} className="shrink-0 text-stone-400" />
            {birthYear && deathYear
              ? `${birthYear} – ${deathYear}`
              : birthYear
                ? `${isHe ? 'לידה' : 'b.'} ${birthYear}`
                : `${isHe ? 'פטירה' : 'd.'} ${deathYear}`}
          </p>
        )}

        {/* Status badges */}
        {(member.birthPlace || surname) && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {member.birthPlace && (
              <span
                className="inline-flex items-center gap-0.5 rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] text-stone-600"
                title={member.birthPlace}
              >
                <MapPin size={10} className="shrink-0" />
                <span className="max-w-[80px] truncate">{member.birthPlace}</span>
              </span>
            )}
            {surname && (
              <span className="inline-flex items-center rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] text-stone-600">
                {surname}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick actions overlay on hover */}
      {hovered && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-white/90 backdrop-blur-sm rounded transition-opacity duration-150">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onFocusBranch();
            }}
            className="flex flex-col items-center gap-1 p-2 rounded border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-400 transition-colors"
            title={isHe ? 'מרכז על הענף' : 'Focus branch'}
          >
            <TreeDeciduous size={16} />
            <span className="text-[9px]">{isHe ? 'ענף' : 'Tree'}</span>
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onOpenBio();
            }}
            className="flex flex-col items-center gap-1 p-2 rounded border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-400 transition-colors"
            title={isHe ? 'פרופיל מלא' : 'Full bio'}
          >
            <User size={16} />
            <span className="text-[9px]">{isHe ? 'פרופיל' : 'Bio'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberCard;
