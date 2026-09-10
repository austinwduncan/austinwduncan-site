import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
  Supabase clients. `supabaseAnon` for public reads (RLS-guarded);
  `supabaseService` for privileged server-side writes from the staff tools.
  Both return null when env is missing so callers can degrade gracefully.

  This site historically used the NEXT_PUBLIC_ prefixed names; the Crosswalk
  tooling this was ported from uses the bare names. Accept both.
*/

const URL_ = () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const ANON = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const SERVICE = () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

export function supabaseAnon(): SupabaseClient | null {
  const url = URL_();
  const key = ANON();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function supabaseService(): SupabaseClient | null {
  const url = URL_();
  const key = SERVICE();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
