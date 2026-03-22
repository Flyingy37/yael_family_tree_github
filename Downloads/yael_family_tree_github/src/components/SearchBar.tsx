import { useState, useRef, useEffect } from 'react';
import type Fuse from 'fuse.js';
import type { Person } from '../types';

interface Props {
  searchIndex: Fuse<Person>;
  onSelect: (personId: string) => void;
}

export function SearchBar({ searchIndex, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Person[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const hits = searchIndex.search(query, { limit: 10 });
    setResults(hits.map(h => h.item));
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
    onSelect(person.id);
  }

  return (
    <div ref={containerRef} className="relative" dir="rtl">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        placeholder="חיפוש לפי שם, משפחה או מקום..."
        className="w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                   placeholder:text-gray-400"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map(person => (
            <button
              key={person.id}
              className="w-full px-3 py-2 text-right hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
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
