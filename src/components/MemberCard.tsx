import React from 'react';
import { MapPin, TreeDeciduous, User, Calendar } from 'lucide-react';

interface MemberProps {
  member: {
    full_name: string;
    gender: 'M' | 'F';
    birth_date?: string;
    birth_place?: string;
    branch?: string;
  };
  onFocusBranch: () => void;
  onOpenBio: () => void;
  language?: 'he' | 'en';
}

const GENDER_COLORS = {
  M: {
    border: 'border-sky-400',
    badge: 'bg-sky-50 text-sky-700',
    hover: 'hover:border-sky-500',
  },
  F: {
    border: 'border-rose-400',
    badge: 'bg-rose-50 text-rose-700',
    hover: 'hover:border-rose-500',
  },
};

const MemberCard: React.FC<MemberProps> = ({ member, onFocusBranch, onOpenBio, language = 'he' }) => {
  const isMale = member.gender === 'M';
  const isRTL = language === 'he';
  const colors = GENDER_COLORS[member.gender];

  const birthYear = member.birth_date ? new Date(member.birth_date).getFullYear().toString() : null;

  return (
    <div
      className={`relative group w-full p-4 rounded-xl border-l-4 transition-all duration-300 cursor-pointer
        ${colors.border} ${colors.hover}
        bg-white/80 backdrop-blur-md shadow-sm
        hover:shadow-lg hover:-translate-y-0.5
        ${isRTL ? 'text-right' : 'text-left'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Quick Actions Overlay */}
      <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center gap-3 z-10 backdrop-blur-sm">
        <button
          onClick={(e) => { e.stopPropagation(); onFocusBranch(); }}
          className="p-2.5 bg-white/90 rounded-full shadow-md hover:bg-amber-50 text-amber-600 transition-all hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label={isRTL ? 'התמקד בענף' : 'Focus on branch'}
        >
          <TreeDeciduous size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenBio(); }}
          className="p-2.5 bg-white/90 rounded-full shadow-md hover:bg-stone-50 text-stone-600 transition-all hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          aria-label={isRTL ? 'פתח פרופיל' : 'Open bio'}
        >
          <User size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 className="font-bold text-base text-stone-800 leading-tight line-clamp-1">
          {member.full_name}
        </h3>
        
        {/* Info Tags */}
        <div className="flex flex-wrap gap-1.5">
          {birthYear && (
            <span className={`flex items-center gap-1 px-2 py-0.5 ${colors.badge} text-xs rounded-full`}>
              <Calendar size={11} strokeWidth={2} />
              {birthYear}
            </span>
          )}
          {member.birth_place && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-full">
              <MapPin size={11} strokeWidth={2} />
              <span className="max-w-[120px] truncate">{member.birth_place}</span>
            </span>
          )}
          {member.branch && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded-full">
              {member.branch}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
