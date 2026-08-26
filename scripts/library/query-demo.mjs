/*
  Proves the schema answers the questions the design was built for, using the
  integer-bounds trick: a passage is a closed interval, so "what touches this
  range" is an intersection, not a string match.
*/
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
for (const l of readFileSync('.env.local','utf8').split('\n')) {
  const m = l.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false} })
const ref = (pos, ch, v) => pos * 1_000_000 + ch * 1_000 + v

// Which books actually have coverage, i.e. what /scripture would show.
const { data: refs } = await db
  .from('scripture_references')
  .select('book_id, bible_books(name, position, testament)')
const counts = new Map()
for (const r of refs ?? []) {
  const k = r.bible_books.name
  counts.set(k, (counts.get(k) ?? 0) + 1)
}
console.log('\n  BOOKS COVERED  (' + counts.size + ' of 66)')
for (const [name, n] of [...counts].sort((a,b) => b[1]-a[1]).slice(0, 10)) {
  console.log(`    ${String(n).padStart(3)}  ${name}`)
}

// The range query itself, the thing string matching could never do.
async function touching(bookSlug, chapter) {
  const { data: book } = await db.from('bible_books').select('id, name, position').eq('slug', bookSlug).single()
  if (!book) return
  const lo = ref(book.position, chapter, 1)
  const hi = ref(book.position, chapter, 999)
  const { data } = await db
    .from('scripture_references')
    .select('chapter_start, verse_start, chapter_end, verse_end, content(title, slug)')
    .lte('start_ref', hi)
    .gte('end_ref', lo)
  console.log(`\n  TOUCHING ${book.name} ${chapter}  (${data?.length ?? 0})`)
  for (const r of (data ?? []).slice(0, 6)) {
    const range = r.verse_start
      ? `${r.chapter_start}:${r.verse_start}-${r.chapter_end}:${r.verse_end}`
      : `${r.chapter_start}-${r.chapter_end}`
    console.log(`    ${range.padEnd(14)} ${r.content?.title ?? '?'}`)
  }
}

await touching('hebrews', 3)
await touching('daniel', 7)
console.log()
