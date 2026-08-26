import { cache } from 'react'
import { library } from '@/lib/library/client'

/*
  Doctrine membership, fetched once.

  A Piece deliberately does not carry its doctrines: the card never shows them
  and dragging the join table through every shelf query would cost far more
  than it returns. The browse rail is the one place that needs them, and it
  needs them for all 213 pieces at once so it can count honestly, so it reads
  the join table in a single pass and does the rest in memory.

  Read only, through the same anon client the rest of the Library uses, whose
  policies already scope every row to published content. A failure here is not
  fatal: the caller falls back to letting the database apply the filter and
  simply prints doctrines without counts.
*/

export type DoctrineLinks = {
  /** Content id to the doctrine ids attached to it. */
  byContent: Map<string, number[]>
  /** False when the read failed, so the caller can fall back. */
  ok: boolean
}

export const getDoctrineLinks = cache(async (): Promise<DoctrineLinks> => {
  const byContent = new Map<string, number[]>()

  // PostgREST caps an unbounded select at 1000 rows, which 213 pieces with
  // several doctrines apiece would quietly clip.
  const { data, error } = await library
    .from('content_doctrines')
    .select('content_id, doctrine_id')
    .range(0, 19_999)

  if (error || !data) return { byContent, ok: false }

  for (const row of data) {
    const list = byContent.get(row.content_id)
    if (list) list.push(row.doctrine_id)
    else byContent.set(row.content_id, [row.doctrine_id])
  }
  return { byContent, ok: true }
})
