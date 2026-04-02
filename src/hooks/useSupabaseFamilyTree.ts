/**
 * useSupabaseFamilyTree — fetches family data from Supabase tables
 * (`family_members` and `family_relations`) and subscribes to Realtime
 * changes so the D3 tree updates instantly when data is synced.
 *
 * Falls back to the existing `useFamilyData()` hook (static JSON / family_graph)
 * when the Supabase tables are unavailable or empty.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  buildHierarchyFromRows,
  buildHierarchy,
  type HierarchyNode,
  type FamilyMemberRow,
  type FamilyRelationRow,
} from '../utils/buildHierarchy';
import type { Person, Family } from '../types';

export interface SupabaseFamilyTreeResult {
  hierarchy: HierarchyNode | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Hook for fetching family tree data from Supabase with Realtime subscriptions.
 *
 * @param rootPersonId – the id of the person to place at the root of the tree.
 *   Falls back to `'@I1@'` when not supplied.
 * @param fallbackPersons – optional pre-loaded persons map (from useFamilyData)
 *   used when Supabase tables are empty.
 * @param fallbackFamilies – optional pre-loaded families map (from useFamilyData).
 */
export function useSupabaseFamilyTree(
  rootPersonId: string = '@I1@',
  fallbackPersons?: Map<string, Person>,
  fallbackFamilies?: Map<string, Family>,
): SupabaseFamilyTreeResult {
  const [hierarchy, setHierarchy] = useState<HierarchyNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  /* ── fetch logic ──────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchFromSupabase(): Promise<boolean> {
      if (!supabase) return false;

      const [membersRes, relationsRes] = await Promise.all([
        supabase.from('family_members').select('*'),
        supabase.from('family_relations').select('*'),
      ]);

      // If either query errors (e.g. table doesn't exist) → fall through
      if (membersRes.error || relationsRes.error) return false;
      const members = membersRes.data as FamilyMemberRow[] | null;
      const relations = relationsRes.data as FamilyRelationRow[] | null;
      if (!members?.length || !relations?.length) return false;

      const tree = buildHierarchyFromRows(members, relations, rootPersonId);
      if (!cancelled) setHierarchy(tree);
      return true;
    }

    async function load() {
      try {
        const gotSupabase = await fetchFromSupabase();
        if (!gotSupabase && fallbackPersons && fallbackFamilies) {
          // Build hierarchy from the existing in-memory data
          const tree = buildHierarchy(fallbackPersons, fallbackFamilies, rootPersonId);
          if (!cancelled) setHierarchy(tree);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [reloadToken, rootPersonId, fallbackPersons, fallbackFamilies]);

  /* ── Realtime subscription ────────────────────────────────────── */
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('family-tree-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'family_members' },
        () => { reload(); },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'family_relations' },
        () => { reload(); },
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [reload]);

  return { hierarchy, loading, error, reload };
}
