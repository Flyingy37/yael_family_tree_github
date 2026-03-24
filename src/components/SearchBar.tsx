import { useState, useRef, useEffect } from 'react';
import type Fuse from 'fuse.js';
import type { Person } from '../types';

interface Props {
  searchIndex: Fuse<Person>;
  onSelect: (personId: string) => void;
  language?: 'en' | 'he';
}

export function SearchBar({ searchIndex, onSelect, language = 'en' }: Props) {
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
    const hits = searchIndex.search(query, { limit: 10 });
    setResults(hits.map(h => h.item));
    setHighlightedIndex(hits.length > 0 ? 0 : -1);
    setIsOpen(true);
  }, [query, searchIndex]);

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
    setQuery(person.fullName);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect(person.id);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
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
    <div ref={containerRef} className="relative" dir={t ? 'rtl' : 'ltr'}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        placeholder={t ? 'חיפוש לפי שם, משפחה או מקום...' : 'Search by name, surname, or place...'}
        aria-label={t ? 'חיפוש אנשים בעץ המשפחה' : 'Search people in family tree'}
        aria-expanded={isOpen}
        aria-autocomplete="list"
        className="w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                   placeholder:text-gray-400"
      />
      {isOpen && results.length > 0 && (
        <div
          role="listbox"
          className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {results.map((person, index) => (
            <button
              key={person.id}
              role="option"
              aria-selected={index === highlightedIndex}
              className={`w-full px-3 py-2 ${t ? 'text-right' : 'text-left'} transition-colors border-b border-gray-50 last:border-0 ${
                index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-blue-50'
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => handleSelect(person)}
            >
              <div className="text-sm font-medium">{person.fullName}</div>
              <div className="text-xs text-gray-400 flex gap-2">
                {person.birthDate && <span>{person.birthDate}</span>}
                {person.birthPlace && <span>{person.birthPlace}</span>}
                {person.relationToYael && <span className="text-blue-400">{person.relationToYael}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
