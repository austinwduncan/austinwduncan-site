import type { Piece } from '@/lib/library/types'

/*
  Faceting arithmetic, in memory.

  The page asks the database once for the pieces that survive the dimensions
  it cannot express on a Piece (series, approach, scripture, free text) and
  then narrows the five rail dimensions here. One query gives both the result
  set and honest counts, because a facet count has to be computed with that
  facet's own filter lifted. Otherwise every unselected option in the active
  group reads zero and the rail becomes a dead end.
*/

export const RAIL_DIMENSIONS = ['collection', 'format', 'level', 'topic', 'doctrine'] as const

export type Dimension = (typeof RAIL_DIMENSIONS)[number]

export type Selection = Partial<Record<Dimension, string>>

export type FacetOption = { slug: string; name: string; count: number }

/** Doctrines do not live on a Piece, so membership is handed in as a lookup. */
export type DoctrinesOf = (piece: Piece) => readonly string[]

function slugsFor(piece: Piece, dim: Dimension, doctrinesOf: DoctrinesOf): readonly string[] {
  switch (dim) {
    case 'collection': return piece.collection ? [piece.collection.slug] : []
    case 'format': return piece.format ? [piece.format.slug] : []
    case 'level': return piece.level ? [piece.level.slug] : []
    case 'topic': return piece.topics.map(t => t.slug)
    case 'doctrine': return doctrinesOf(piece)
  }
}

/**
 * Narrows by every selected rail dimension, optionally lifting one of them.
 * Lifting is what makes a facet count mean "how many if you picked this
 * instead" rather than "how many of what you are already looking at".
 */
export function narrow(
  pieces: readonly Piece[],
  selection: Selection,
  doctrinesOf: DoctrinesOf,
  lift?: Dimension,
): Piece[] {
  const active = RAIL_DIMENSIONS.filter(d => d !== lift && selection[d])
  if (!active.length) return [...pieces]
  return pieces.filter(piece =>
    active.every(dim => slugsFor(piece, dim, doctrinesOf).includes(selection[dim]!)),
  )
}

/** Option counts for one dimension, with that dimension's own filter lifted. */
export function countsFor(
  pieces: readonly Piece[],
  dim: Dimension,
  selection: Selection,
  doctrinesOf: DoctrinesOf,
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const piece of narrow(pieces, selection, doctrinesOf, dim)) {
    for (const slug of new Set(slugsFor(piece, dim, doctrinesOf))) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
  }
  return counts
}

/** Taxonomy order kept, for the short groups where order carries meaning. */
export function optionsInOrder(
  taxonomy: readonly { slug: string; name: string }[],
  counts: Map<string, number>,
): FacetOption[] {
  return taxonomy.map(t => ({ slug: t.slug, name: t.name, count: counts.get(t.slug) ?? 0 }))
}

/** Count order, for the long groups where the head of the list is the point. */
export function optionsByCount(
  taxonomy: readonly { slug: string; name: string }[],
  counts: Map<string, number>,
): FacetOption[] {
  return optionsInOrder(taxonomy, counts)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

/*
  Which active filter is doing the most damage.

  When a combination returns nothing, the useful offer is not "start over" but
  "drop the one that cut the deepest". That is the filter whose removal opens
  the most results back up.
*/
export function narrowestFilter(
  pieces: readonly Piece[],
  selection: Selection,
  doctrinesOf: DoctrinesOf,
): { dim: Dimension; slug: string; wouldReturn: number } | null {
  let best: { dim: Dimension; slug: string; wouldReturn: number } | null = null
  for (const dim of RAIL_DIMENSIONS) {
    const slug = selection[dim]
    if (!slug) continue
    const wouldReturn = narrow(pieces, selection, doctrinesOf, dim).length
    if (wouldReturn > 0 && (!best || wouldReturn > best.wouldReturn)) {
      best = { dim, slug, wouldReturn }
    }
  }
  return best
}
