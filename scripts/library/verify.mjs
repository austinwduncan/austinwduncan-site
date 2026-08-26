/*
  Connection + migration check.

  Prints structure and counts only. Key values are never logged: the most that
  appears is the project host, which is public by design.
*/
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// Minimal .env.local reader so this works without adding a dotenv dependency.
function loadEnv(path = '.env.local') {
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  } catch {}
}
loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('\n  Missing env:',
    !url ? 'NEXT_PUBLIC_SUPABASE_URL' : '',
    !key ? 'SUPABASE_SERVICE_ROLE_KEY' : '', '\n')
  process.exit(1)
}

console.log('\n  host        ', new URL(url).host)
console.log('  service key  present (' + key.length + ' chars)\n')

const db = createClient(url, key, { auth: { persistSession: false } })

const TABLES = [
  'content','collections','series','topics','doctrines','formats','approaches',
  'levels','bible_books','scripture_references','content_topics','content_doctrines',
  'content_approaches','media','content_relations','content_suggestions',
  'content_revisions','content_slug_history','topic_aliases','search_events',
]

let missing = 0
for (const t of TABLES) {
  const { count, error } = await db.from(t).select('*', { count: 'exact', head: true })
  if (error) {
    missing++
    console.log(`  ✗ ${t.padEnd(22)} ${error.message}`)
  } else {
    console.log(`  ✓ ${t.padEnd(22)} ${count} rows`)
  }
}

console.log()
if (missing) {
  console.log(`  ${missing} table(s) unreachable — has 0001 run?\n`)
  process.exit(1)
}

// Migration state inferred from seed data.
const { count: books } = await db.from('bible_books').select('*', { count: 'exact', head: true })
const { count: cols } = await db.from('collections').select('*', { count: 'exact', head: true })
console.log('  0001 core schema     ', 'applied')
console.log('  0002 bible books     ', books === 66 ? 'applied (66 books)' : `NOT APPLIED (${books} books, expected 66)`)
console.log('  0003 taxonomy seed   ', cols >= 4 ? `applied (${cols} collections)` : `NOT APPLIED (${cols} collections, expected 4)`)
console.log()
