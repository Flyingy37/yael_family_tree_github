import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import type Fuse from 'fuse.js';
import type { Person } from '../types';

interface Props {
  searchIndex: Fuse<Person>;
  onSelect: (personId: string) => void;
  language?: 'en' | 'he';
  /** When set, only people in this set appear in results (same as current graph filters). */
  allowedPersonIds?: Set<string>;
  className?: string;
}

const VISIBLE_RESULTS = 8;

export function SearchBar({
  searchIndex,
  onSelect,
  language = 'en',
  allowedPersonIds,
  className = '',
}: Props) {
  const t = language === 'he';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Person[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setHighlightedIndex(-1);
      return;
    }
    const hits = searchIndex.search(query, { limit: 50 });
    const items = hits
      .map(h => h.item)
      .filter(p => !allowedPersonIds || allowedPersonIds.has(p.id))
      .slice(0, VISIBLE_RESULTS);
    setResults(items);
    setHighlightedIndex(items.length > 0 ? 0 : -1);
    setIsOpen(true);
  }, [query, searchIndex, allowedPersonIds]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(person: Person) {
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect(person.id);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) {
      if (e.key === 'ArrowDown' && results.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => (i + 1) % results.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => (i <= 0 ? results.length - 1 : i - 1));
      return;
    }

    if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        e.preventDefault();
        handleSelect(results[highlightedIndex]);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex-shrink-0 z-20 w-72 max-w-[min(18rem,100vw-8rem)] ${className}`.trim()}
      dir={t ? 'rtl' : 'ltr'}
    >
      <div className="relative bg-white rounded-full shadow-md border border-slate-200 flex items-center px-3 py-1.5 gap-0.5">
        <Search size={18} className="text-slate-400 flex-shrink-0 pointer-events-none" aria-hidden />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={t ? 'חיפוש קרוב משפחה...' : 'Search relative...'}
          aria-label={t ? 'חיפוש אנשים בעץ המשפחה' : 'Search people in family tree'}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
          className="min-w-0 flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-2 text-sm text-slate-700 placeholder:text-slate-400"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full flex-shrink-0"
            aria-label={t ? 'נקה חיפוש' : 'Clear search'}
          >
            <X size={16} aria-hidden />
          </button>
        ) : null}
      </div>

      {isOpen && results.length > 0 && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-60 overflow-y-auto"
        >
          {results.map((person, index) => (
            <button
              key={person.id}
              type="button"
              role="option"
              aria-selected={index === highlightedIndex}
              className={`w-full px-4 py-3 ${t ? 'text-right' : 'text-left'} transition-colors border-b border-slate-50 last:border-0 flex flex-col gap-0.5 ${
                index === highlightedIndex ? 'bg-slate-100' : 'hover:bg-slate-50'
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => handleSelect(person)}
            >
              <span className="font-semibold text-slate-800 text-sm">{person.fullName}</span>
              {person.birthDate ? (
                <span className="text-xs text-slate-500">
                  {t ? 'יליד/ה:' : 'Born:'} {person.birthDate}
                </span>
              ) : null}
              {(person.birthPlace || person.relationToYael) && (
                <span className="text-xs text-slate-400">
                  {[person.birthPlace, person.relationToYael].filter(Boolean).join(' · ')}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
