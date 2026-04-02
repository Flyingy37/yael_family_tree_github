import { memo, useMemo } from 'react';
import { User, MapPin } from 'lucide-react';
import type { Person } from '../types';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface GenerationItemProps {
  member: Person;
  level: number | null;
  language?: 'en' | 'he';
  onSelect?: (id: string) => void;
}

interface GenerationListProps {
  persons: Person[];
  language?: 'en' | 'he';
  onSelect?: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function extractYear(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const m = dateStr.match(/\b(\d{4})\b/);
  return m ? parseInt(m[1], 10) : null;
}

function lifeSpan(person: Person): string | null {
  const b = extractYear(person.birthDate);
  const d = extractYear(person.deathDate);
  if (b && d) return `${b} – ${d}`;
  if (b) return `b. ${b}`;
  if (d) return `d. ${d}`;
  return null;
}

function sexLabel(sex: string, isHe: boolean): string {
  if (sex === 'F') return isHe ? 'נקבה' : 'Female';
  if (sex === 'M') return isHe ? 'זכר' : 'Male';
  return isHe ? 'לא ידוע' : 'Unknown';
}

function sexAccentClasses(sex: string): string {
  if (sex === 'F') return 'border-pink-300 bg-pink-50';
  if (sex === 'M') return 'border-blue-300 bg-blue-50';
  return 'border-slate-300 bg-slate-50';
}

function avatarColors(sex: string): { bg: string; text: string } {
  if (sex === 'F') return { bg: '#fce7f3', text: '#9d174d' };
  if (sex === 'M') return { bg: '#dbeafe', text: '#1e40af' };
  return { bg: '#f1f5f9', text: '#475569' };
}

function getInitials(person: Person): string {
  const name = (person.givenName || person.fullName || '').trim();
  if (!name) return '?';
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  GenerationItem                                                     */
/* ------------------------------------------------------------------ */

export const GenerationItem = memo(
  ({ member, level, language = 'en', onSelect }: GenerationItemProps) => {
    const isHe = language === 'he';
    const span = lifeSpan(member);
    const colors = avatarColors(member.sex);
    const initials = getInitials(member);

    return (
      <button
        type="button"
        className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors hover:shadow-sm ${sexAccentClasses(member.sex)}`}
        dir={isHe ? 'rtl' : 'ltr'}
        onClick={() => onSelect?.(member.id)}
      >
        {/* Avatar */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: colors.bg }}
          aria-hidden
        >
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold" style={{ color: colors.text }}>
              {initials}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-800">
              {member.fullName}
            </span>
            {level !== null && (
              <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                {isHe ? `דור ${level > 0 ? '+' : ''}${level}` : `Gen ${level > 0 ? '+' : ''}${level}`}
              </span>
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-xs text-slate-500">
            {span && <span>{span}</span>}
            <span className="flex items-center gap-0.5">
              <User size={10} className="shrink-0" />
              {sexLabel(member.sex, isHe)}
            </span>
            {member.birthPlace && (
              <span className="flex items-center gap-0.5">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{member.birthPlace}</span>
              </span>
            )}
          </div>

          {member.relationToYael && (
            <p className="mt-0.5 truncate text-[10px] text-amber-600">
              {member.relationToYael}
            </p>
          )}
        </div>
      </button>
    );
  }
);

GenerationItem.displayName = 'GenerationItem';

/* ------------------------------------------------------------------ */
/*  GenerationList                                                     */
/* ------------------------------------------------------------------ */

export function GenerationList({ persons, language = 'en', onSelect }: GenerationListProps) {
  const isHe = language === 'he';

  const grouped = useMemo(() => {
    const map = new Map<number | null, Person[]>();
    for (const person of persons) {
      const gen = person.generation;
      if (!map.has(gen)) map.set(gen, []);
      map.get(gen)!.push(person);
    }

    // Sort generation keys: numbered generations ascending, null at the end
    const keys = Array.from(map.keys()).sort((a, b) => {
      if (a === null && b === null) return 0;
      if (a === null) return 1;
      if (b === null) return -1;
      return a - b;
    });

    return keys.map(gen => ({
      generation: gen,
      members: map.get(gen)!.sort((a, b) => a.fullName.localeCompare(b.fullName, language)),
    }));
  }, [persons, language]);

  if (persons.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-400">
        {isHe ? 'אין אנשים להצגה' : 'No persons to display'}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="space-y-4 p-4">
        {grouped.map(({ generation, members }) => (
          <section key={generation ?? 'unknown'}>
            <h3 className="sticky top-0 z-10 mb-2 flex items-center gap-2 border-b border-slate-200 bg-white/90 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500 backdrop-blur">
              <span>
                {generation !== null
                  ? isHe
                    ? `דור ${generation > 0 ? '+' : ''}${generation}`
                    : `Generation ${generation > 0 ? '+' : ''}${generation}`
                  : isHe
                    ? 'דור לא ידוע'
                    : 'Unknown generation'}
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                {members.length}
              </span>
            </h3>

            <div className="space-y-1.5">
              {members.map(member => (
                <GenerationItem
                  key={member.id}
                  member={member}
                  level={generation}
                  language={language}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
