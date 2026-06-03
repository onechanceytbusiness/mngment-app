import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail loudly at import time so a misconfigured deploy never gets past the
  // first render. Both vars must be present — anon key alone is useless and
  // URL alone produces a non-functional client.
  throw new Error(
    'Supabase env vars missing — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local (see .env.example).',
  );
}

export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // detectSessionInUrl is required for the Google OAuth callback —
    // Supabase puts the access token in the URL hash, which this option
    // reads and turns into a session.
    detectSessionInUrl: true,
  },
});
