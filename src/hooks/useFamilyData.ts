import { useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { Person, Family, FamilyGraph } from '../types';
import { supabase } from '../lib/supabase';

export interface FamilyData {
  persons: Map<string, Person>;
  families: Map<string, Family>;
  rootPersonId: string;
  personList: Person[];
  searchIndex: Fuse<Person>;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useFamilyData(): FamilyData {
  const [graph, setGraph] = useState<FamilyGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken(prev => prev + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    async function load() {
      // ── 1. Try Supabase first (if configured) ──────────────────────────
      if (supabase) {
        const { data: rows, error: sbErr } = await supabase
          .from('family_graph')
          .select('data')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (!sbErr && rows && rows.length > 0) {
          if (!controller.signal.aborted) {
            setGraph(rows[0].data as FamilyGraph);
            setLoading(false);
          }
          return;
        }
        // If Supabase returned no data, fall through to JSON fallback
      }

      // ── 2. Fallback: static /family-graph.json ─────────────────────────
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}family-graph.json`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: FamilyGraph = await res.json();
        if (!controller.signal.aborted) setGraph(data);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (!controller.signal.aborted) setError(`Failed to load data (${message})`);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [reloadToken]);

  const persons = useMemo(() => {
    if (!graph) return new Map<string, Person>();
    const map = new Map<string, Person>();
    for (const p of graph.persons) {
      map.set(p.id, p);
    }
    return map;
  }, [graph]);

  const families = useMemo(() => {
    if (!graph) return new Map<string, Family>();
    const map = new Map<string, Family>();
    for (const f of graph.families) {
      map.set(f.id, f);
    }
    return map;
  }, [graph]);

  const personList = useMemo(() => graph?.persons || [], [graph]);

  const searchablePeople = useMemo(() => {
    const normalize = (value: string): string => {
      return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    };

    return personList.map(person => {
      const text = [
        person.fullName,
        person.givenName,
        person.surname,
        person.surnameFinal,
        person.birthPlace,
        person.hebrewName,
        person.title,
        person.relationToYael,
        person.birthName,
        person.fatherName,
        person.motherName,
        person.spouseName,
        person.childrenNames,
        person.migrationInfo,
        ...(person.tags || []),
      ]
        .filter(Boolean)
        .join(' ');

      return {
        ...person,
        searchNormalized: normalize(text),
      };
    });
  }, [personList]);

  const searchIndex = useMemo(() => {
    return new Fuse(searchablePeople, {
      keys: [
        { name: 'fullName', weight: 2 },
        { name: 'givenName', weight: 1.5 },
        { name: 'surname', weight: 1.5 },
        { name: 'surnameFinal', weight: 1 },
        { name: 'birthPlace', weight: 0.8 },
        { name: 'hebrewName', weight: 2 },
        { name: 'title', weight: 1 },
        { name: 'migrationInfo', weight: 1 },
        { name: 'tags', weight: 0.7 },
        { name: 'relationToYael', weight: 0.5 },
        { name: 'searchNormalized', weight: 2.2 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }, [searchablePeople]);

  return {
    persons,
    families,
    rootPersonId: graph?.rootPersonId || '@I1@',
    personList,
    searchIndex,
    loading,
    error,
    reload,
  };
}
