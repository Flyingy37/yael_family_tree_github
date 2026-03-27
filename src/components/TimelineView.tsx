import { useMemo, useState, useRef, useEffect } from 'react';
import type { Person } from '../types';

interface Props {
  persons: Map<string, Person>;
  filteredIds: Set<string>;
  onSelectPerson: (id: string) => void;
  language?: 'en' | 'he';
}

interface TimelineEvent {
  year: number;
  person: Person;
  type: 'birth' | 'death';
}

function parseYear(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const m = dateStr.match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

function getDecade(year: number): number {
  return Math.floor(year / 10) * 10;
}

export function TimelineView({ persons, filteredIds, onSelectPerson, language = 'en' }: Props) {
  const t = language === 'he';
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const { events, decades, decadeMap } = useMemo(() => {
    const evts: TimelineEvent[] = [];
    for (const id of filteredIds) {
      const person = persons.get(id);
      if (!person) continue;
      const birthYear = parseYear(person.birthDate);
      if (birthYear && birthYear > 1400 && birthYear < 2030) {
        evts.push({ year: birthYear, person, type: 'birth' });
      }
      const deathYear = parseYear(person.deathDate);
      if (deathYear && deathYear > 1400 && deathYear < 2030) {
        evts.push({ year: deathYear, person, type: 'death' });
      }
    }
    evts.sort((a, b) => a.year - b.year);

    const dMap = new Map<number, TimelineEvent[]>();
    for (const e of evts) {
      const dec = getDecade(e.year);
      if (!dMap.has(dec)) dMap.set(dec, []);
      dMap.get(dec)!.push(e);
    }
    const decs = Array.from(dMap.keys()).sort((a, b) => a - b);

    return { events: evts, decades: decs, decadeMap: dMap };
  }, [persons, filteredIds]);

  const range = useMemo(() => {
    if (events.length === 0) return null;
    return {
      minYear: events[0].year,
      maxYear: events[events.length - 1].year,
    };
  }, [events]);

  const maxCount = useMemo(() => {
    let max = 0;
    for (const evts of decadeMap.values()) {
      if (evts.length > max) max = evts.length;
    }
    return max;
  }, [decadeMap]);

  const selectedEvents = selectedDecade !== null ? (decadeMap.get(selectedDecade) || []) : [];

  // Start at the earliest decades so old generations are visible by default.
  useEffect(() => {
    if (timelineRef.current && decades.length > 0) {
      timelineRef.current.scrollLeft = 0;
    }
  }, [decades]);

  const jumpToDecade = (target: 'start' | '1900' | 'end') => {
    if (!timelineRef.current || decades.length === 0) return;
    const idx =
      target === 'start'
        ? 0
        : target === 'end'
          ? decades.length - 1
          : Math.max(0, decades.findIndex(d => d >= 1900));
    const scrollTarget = (idx / Math.max(1, decades.length)) * timelineRef.current.scrollWidth;
    timelineRef.current.scrollLeft = scrollTarget - 120;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white" dir={t ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <h2 className="font-bold text-gray-700">{t ? 'ציר זמן' : 'Timeline'}</h2>
        <span className="text-sm text-gray-400">{events.length.toLocaleString()} {t ? 'אירועים' : 'events'}</span>
        {range && (
          <span className="text-xs text-gray-400">
            {t ? 'טווח שנים' : 'Year range'}: {range.minYear}–{range.maxYear}
          </span>
        )}
        <div className="flex items-center gap-2 mr-auto">
          <button
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={() => jumpToDecade('start')}
          >
            {t ? 'להתחלה' : 'Start'}
          </button>
          <button
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={() => jumpToDecade('1900')}
          >
            1900
          </button>
          <button
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={() => jumpToDecade('end')}
          >
            {t ? 'לסוף' : 'End'}
          </button>
        </div>
        {selectedDecade !== null && (
          <button
            className="text-xs text-blue-500 hover:text-blue-700"
            onClick={() => setSelectedDecade(null)}
          >
            {t ? 'נקה בחירה' : 'Clear selection'}
          </button>
        )}
      </div>

      {/* Timeline bar chart */}
      <div
        ref={timelineRef}
        className="flex items-end gap-0.5 px-4 py-4 overflow-x-auto min-h-[160px] border-b border-gray-100"
        dir="ltr"
      >
        {decades.map(decade => {
          const count = decadeMap.get(decade)?.length || 0;
          const height = maxCount > 0 ? Math.max((count / maxCount) * 100, 4) : 4;
          const isSelected = selectedDecade === decade;
          const births = decadeMap.get(decade)?.filter(e => e.type === 'birth').length || 0;
          const deaths = count - births;

          return (
            <button
              key={decade}
              className={`flex flex-col items-center flex-shrink-0 group cursor-pointer ${
                isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => setSelectedDecade(isSelected ? null : decade)}
              title={`${decade}s: ${births} births, ${deaths} deaths`}
            >
              <div className="text-[9px] text-gray-400 mb-1">{count}</div>
              <div className="flex flex-col w-8 rounded-t overflow-hidden" style={{ height }}>
                <div
                  className={`${isSelected ? 'bg-blue-500' : 'bg-blue-300 group-hover:bg-blue-400'} transition-colors`}
                  style={{ flex: births }}
                />
                {deaths > 0 && (
                  <div
                    className={`${isSelected ? 'bg-red-400' : 'bg-red-200 group-hover:bg-red-300'} transition-colors`}
                    style={{ flex: deaths }}
                  />
                )}
              </div>
              <div className={`text-[10px] mt-1 ${isSelected ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                {decade}
              </div>
            </button>
          );
        })}
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {selectedDecade === null ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            {t ? 'לחצ/י על עשור בגרף למעלה כדי לראות אירועים' : 'Click a decade above to view events'}
          </div>
        ) : (
          <div>
            <h3 className="font-bold text-sm text-gray-700 mb-2">
              {t ? `שנות ה-${selectedDecade} - ${selectedEvents.length} אירועים` : `${selectedDecade}s - ${selectedEvents.length} events`}
            </h3>
            <div className="space-y-1">
              {selectedEvents.map((evt, i) => (
                <button
                  key={`${evt.person.id}-${evt.type}-${i}`}
                  className="w-full flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 text-right transition-colors"
                  onClick={() => onSelectPerson(evt.person.id)}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    evt.type === 'birth' ? 'bg-blue-400' : 'bg-red-400'
                  }`} />
                  <span className="text-xs text-gray-400 w-10 flex-shrink-0">{evt.year}</span>
                  <span className="text-sm font-medium truncate">{evt.person.fullName}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {evt.type === 'birth' ? (t ? 'לידה' : 'Birth') : (t ? 'פטירה' : 'Death')}
                  </span>
                  {evt.person.birthPlace && evt.type === 'birth' && (
                    <span className="text-xs text-gray-300 truncate">{evt.person.birthPlace}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" /> {t ? 'לידה' : 'Birth'}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" /> {t ? 'פטירה' : 'Death'}
        </span>
      </div>
    </div>
  );
}
