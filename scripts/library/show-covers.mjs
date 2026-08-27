/*
  Gives each show a cover.

  No series had artwork_url set, so every show card fell back to a title card.
  Where Austin made a real title slide for a series, that is the cover. Where he
  did not, the first episode's art stands in, which is at least his artwork for
  that study rather than a generated placeholder.

  Idempotent, and skips a series that already has a cover so a later hand-picked
  choice is never overwritten.
*/
import { readFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const apply = process.argv.includes('--apply')

// Real title slides, where one exists.
const TITLE_SLIDES = {
  'the-book-of-hebrews': '/images/Teaching Series/Expositional/The Book of Hebrews/the-book-of-hebrews-title-slide.jpg',
  'the-covenant': '/images/Teaching Series/Topical/Covenant/The Covenant - Title.jpg',
  'words-that-change-everything': '/images/Teaching Series/Topical/Words That Change Everything/title.jpg',
}

const { data: series } = await db.from('series').select('id, slug, name, artwork_url')
const { data: content } = await db.from('content')
  .select('series_id, featured_image, published_at')
  .not('featured_image', 'is', null)

for (const s of series) {
  if (s.artwork_url) { console.log(`  keeps    ${s.name}`); continue }

  let cover = TITLE_SLIDES[s.slug] ?? null
  let why = 'title slide'
  if (cover && !existsSync('public' + decodeURIComponent(cover))) { cover = null }

  if (!cover) {
    const first = content
      .filter(p => p.series_id === s.id)
      .sort((a, b) => (a.published_at ?? '').localeCompare(b.published_at ?? ''))[0]
    cover = first?.featured_image ?? null
    why = 'first episode'
  }

  if (!cover) { console.log(`  none     ${s.name}`); continue }
  console.log(`  ${apply ? 'set     ' : 'would   '} ${s.name.padEnd(44)} ${why}`)
  if (apply) await db.from('series').update({ artwork_url: cover }).eq('id', s.id)
}
console.log(apply ? '\n  applied\n' : '\n  dry run, re-run with --apply\n')
