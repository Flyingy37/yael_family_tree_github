/**
 * useSearch — fuzzy search hook backed by the Fuse.js index in useFamilyData.
 */
import { useState, useMemo, useCallback } from 'react';
import { useFamilyData } from './useFamilyData';
import type { Person } from '../types';

export interface SearchState {
  query: string;
  setQuery: (q: string) => void;
  results: Person[];
  hasQuery: boolean;
}

export function useSearch(maxResults = 50): SearchState {
  const { searchIndex, personList } = useFamilyData();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return searchIndex
      .search(trimmed, { limit: maxResults })
      .map((r: { item: Person }) => r.item);
  }, [query, searchIndex, maxResults]);

  const handleSetQuery = useCallback((q: string) => {
    setQuery(q);
  }, []);

  return {
    query,
    setQuery: handleSetQuery,
    results,
    hasQuery: query.trim().length > 0,
  };
}
