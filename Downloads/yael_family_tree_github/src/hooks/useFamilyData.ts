import { useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { Person, Family, FamilyGraph } from '../types';

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

    fetch('/family-graph.json', { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: FamilyGraph) => {
        setGraph(data);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`נכשלה טעינת הנתונים (${message})`);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

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

  const searchIndex = useMemo(() => {
    return new Fuse(personList, {
      keys: [
        { name: 'fullName', weight: 2 },
        { name: 'givenName', weight: 1.5 },
        { name: 'surname', weight: 1.5 },
        { name: 'surnameFinal', weight: 1 },
        { name: 'birthPlace', weight: 0.8 },
        { name: 'hebrewName', weight: 2 },
        { name: 'relationToYael', weight: 0.5 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }, [personList]);

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
