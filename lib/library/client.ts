import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/*
  Read-only Supabase client for the Library.

  Uses the anon key on purpose. Every read policy is scoped to
  status = 'published', so the database itself decides what is public rather
  than the query layer remembering to filter. A missing filter in a new query
  therefore returns nothing instead of leaking a draft.

  The service role key must never reach this file. It bypasses RLS and this
  module runs in code that gets bundled for server components.
*/

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Library: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.',
  )
}

export const library = createClient<Database>(url, anonKey, {
  auth: { persistSession: false },
})
