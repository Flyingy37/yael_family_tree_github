/**
 * Breadcrumb — shows the direct ancestor chain from the oldest known
 * ancestor down to the currently selected person.
 *
 * Data source: JSON graph (familyAsChild), NOT ReactFlow edges.
 * This avoids spouse-edges and collapsed-branch issues.
 *
 * Visual: Home > Leyb Alperovitch > Meir > Yehuda > [Michael Alperovich]
 */
import { useMemo } from 'react';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { getAncestorChain } from '../utils/treeHelpers';
import type { Person, Family } from '../types';

interface Props {
  selectedPersonId: string | null;
  persons: Map<string, Person>;
  families: Map<string, Family>;
  onSelectPerson: (id: string) => void;
  language?: 'en' | 'he';
}

export function Breadcrumb({
  selectedPersonId,
  persons,
  families,
  onSelectPerson,
  language = 'en',
}: Props) {
  const isHe = language === 'he';

  const chain = useMemo(
    () =>
      selectedPersonId
        ? getAncestorChain(selectedPersonId, persons, families)
        : [],
    [selectedPersonId, persons, families]
  );

  // Only render if there is a real ancestor path (more than just the person alone)
  if (chain.length === 0) return null;

  const Chevron = isHe ? ChevronLeft : ChevronRight;

  return (
    <nav
      className="flex items-center gap-0.5 px-3 py-1 bg-amber-50 border-b border-amber-100 text-xs overflow-x-auto scrollbar-none flex-shrink-0 whitespace-nowrap"
      dir={isHe ? 'rtl' : 'ltr'}
      aria-label={isHe ? 'שרשרת אבות' : 'Ancestor path'}
    >
      {/* Root home icon */}
      <span className="text-amber-500 flex-shrink-0 flex items-center">
        <Home size={11} />
      </span>

      {chain.map((id, idx) => {
        const person = persons.get(id);
        if (!person) return null;
        const isLast = idx === chain.length - 1;
        const isSelected = id === selectedPersonId;

        return (
          <span key={id} className="flex items-center gap-0.5 flex-shrink-0">
            {idx > 0 && (
              <Chevron
                size={10}
                className="text-amber-300 flex-shrink-0"
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              onClick={() => !isSelected && onSelectPerson(id)}
              className={[
                'px-1 py-0.5 rounded transition-colors max-w-[140px] truncate',
                isLast
                  ? 'font-semibold text-amber-900 bg-amber-100 cursor-default'
                  : 'text-amber-700 hover:text-amber-950 hover:bg-amber-100 cursor-pointer',
              ].join(' ')}
              title={person.fullName}
              aria-current={isLast ? 'page' : undefined}
            >
              {person.fullName}
            </button>
          </span>
        );
      })}

      {/* Generation depth hint */}
      {chain.length > 1 && (
        <span className="ms-2 text-amber-400 flex-shrink-0">
          ({chain.length - 1} {isHe ? 'דורות' : 'gen'})
        </span>
      )}
    </nav>
  );
}
