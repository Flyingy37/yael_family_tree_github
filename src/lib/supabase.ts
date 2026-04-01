/**
 * Supabase client — initialised only when both env vars are present.
 * The URL and anon key are safe to expose in the browser (anon key has
 * RLS-restricted access; service-role key is server-side only).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Null when env vars are missing (falls back to static JSON). */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;
