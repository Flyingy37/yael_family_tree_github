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
    <div
      className="flex h-full w-full flex-col rounded-2xl border border-[rgba(160,147,125,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(250,247,242,0.95))]"
      dir={t ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[rgba(160,147,125,0.12)] px-4 py-3">
        <h2 className="font-bold text-[rgb(94,87,78)]">{t ? 'ציר זמן' : 'Timeline'}</h2>
        <span className="text-sm text-[rgb(141,134,123)]">{events.length.toLocaleString()} {t ? 'אירועים' : 'events'}</span>
        {range && (
          <span className="text-xs text-[rgb(141,134,123)]">
            {t ? 'טווח שנים' : 'Year range'}: {range.minYear}–{range.maxYear}
          </span>
        )}
        <div className="flex items-center gap-2 mr-auto">
          <button
            className="text-xs text-[rgb(116,108,96)] hover:text-[rgb(94,87,78)]"
            onClick={() => jumpToDecade('start')}
          >
            {t ? 'להתחלה' : 'Start'}
          </button>
          <button
            className="text-xs text-[rgb(116,108,96)] hover:text-[rgb(94,87,78)]"
            onClick={() => jumpToDecade('1900')}
          >
            1900
          </button>
          <button
            className="text-xs text-[rgb(116,108,96)] hover:text-[rgb(94,87,78)]"
            onClick={() => jumpToDecade('end')}
          >
            {t ? 'לסוף' : 'End'}
          </button>
        </div>
        {selectedDecade !== null && (
          <button
            className="text-xs text-[rgb(90,118,133)] hover:text-[rgb(70,103,114)]"
            onClick={() => setSelectedDecade(null)}
          >
            {t ? 'נקה בחירה' : 'Clear selection'}
          </button>
        )}
      </div>

      {/* Timeline bar chart */}
      <div
        ref={timelineRef}
        className="flex min-h-[160px] items-end gap-0.5 overflow-x-auto border-b border-[rgba(160,147,125,0.12)] px-4 py-4"
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
              <div className="mb-1 text-[9px] text-[rgb(141,134,123)]">{count}</div>
              <div className="flex flex-col w-8 rounded-t overflow-hidden" style={{ height }}>
                <div
                  className={`${isSelected ? 'bg-[rgb(90,118,133)]' : 'bg-[rgb(181,202,210)] group-hover:bg-[rgb(153,180,190)]'} transition-colors`}
                  style={{ flex: births }}
                />
                {deaths > 0 && (
                  <div
                    className={`${isSelected ? 'bg-[rgb(181,138,132)]' : 'bg-[rgb(228,214,209)] group-hover:bg-[rgb(214,195,189)]'} transition-colors`}
                    style={{ flex: deaths }}
                  />
                )}
              </div>
              <div className={`mt-1 text-[10px] ${isSelected ? 'font-bold text-[rgb(90,118,133)]' : 'text-[rgb(116,108,96)]'}`}>
                {decade}
              </div>
            </button>
          );
        })}
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {selectedDecade === null ? (
          <div className="mt-8 text-center text-sm text-[rgb(141,134,123)]">
            {t ? 'לחצ/י על עשור בגרף למעלה כדי לראות אירועים' : 'Click a decade above to view events'}
          </div>
        ) : (
          <div>
            <h3 className="mb-2 text-sm font-bold text-[rgb(94,87,78)]">
              {t ? `שנות ה-${selectedDecade} - ${selectedEvents.length} אירועים` : `${selectedDecade}s - ${selectedEvents.length} events`}
            </h3>
            <div className="space-y-1">
              {selectedEvents.map((evt, i) => (
                <button
                  key={`${evt.person.id}-${evt.type}-${i}`}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-right transition-colors hover:bg-[rgba(248,245,240,0.84)]"
                  onClick={() => onSelectPerson(evt.person.id)}
                >
                  <span
                    className={`h-2 w-2 flex-shrink-0 rounded-full ${
                      evt.type === 'birth' ? 'bg-[rgb(90,118,133)]' : 'bg-[rgb(181,138,132)]'
                  }`} />
                  <span className="w-10 flex-shrink-0 text-xs text-[rgb(141,134,123)]">{evt.year}</span>
                  <span className="text-sm font-medium truncate">{evt.person.fullName}</span>
                  <span className="flex-shrink-0 text-xs text-[rgb(141,134,123)]">
                    {evt.type === 'birth' ? (t ? 'לידה' : 'Birth') : (t ? 'פטירה' : 'Death')}
                  </span>
                  {evt.person.birthPlace && evt.type === 'birth' && (
                    <span className="truncate text-xs text-[rgb(168,161,152)]">{evt.person.birthPlace}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 border-t border-[rgba(160,147,125,0.12)] px-4 py-2 text-xs text-[rgb(116,108,96)]">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[rgb(90,118,133)]" /> {t ? 'לידה' : 'Birth'}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[rgb(181,138,132)]" /> {t ? 'פטירה' : 'Death'}
        </span>
      </div>
    </div>
  );
}
