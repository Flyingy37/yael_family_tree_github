/**
 * useHotSync — subscribes to the `family_updates` Supabase Realtime table.
 *
 * When a new row is inserted (e.g. by a GitHub Action after a JSON push),
 * the `onUpdate` callback is called with the notification message so the UI
 * can show a toast and optionally reload the family data.
 */
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface FamilyUpdateRow {
  id: number;
  branch_name: string | null;
  message: string;
  created_at: string;
}

export function useHotSync(onUpdate: (msg: FamilyUpdateRow) => void) {
  useEffect(() => {
    if (!supabase) return; // No Supabase configured → skip

    const channel = supabase
      .channel('family-updates-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'family_updates' },
        (payload) => {
          onUpdate(payload.new as FamilyUpdateRow);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
