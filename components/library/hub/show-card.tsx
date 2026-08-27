import Link from 'next/link'
import Artwork from '@/components/library/artwork'

/*
  A show, not an episode.

  The Library treated a collection as the browse unit, so the only way into
  Daniel was to open "In the Text" and find twelve loose pieces. But Daniel is
  a show. So is Hebrews, so is The Covenant, so is Words That Change Everything.
  Those are the things a reader actually wants to pick.

  A show card therefore carries the study's own cover and says how long it runs,
  the way a season card does. Titles are never cut: Austin's series names are
  short enough to set in full, and a name ending in an ellipsis is not a name.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export type ShowCardData = {
  name: string
  href: string
  artwork: string | null
  /** For example "12 studies" or "14 questions". */
  count: string
}

export default function ShowCard({ show }: { show: ShowCardData }) {
  return (
    <Link
      href={show.href}
      className="group relative block outline-none focus-visible:z-30"
      style={{ zIndex: 0 }}
    >
      <Artwork
        src={show.artwork}
        title={show.name}
        className="transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.55)] group-focus-visible:-translate-y-1.5"
      />
      <h3
        className="mt-3.5 uppercase transition-colors group-hover:text-[var(--awd-gold)]"
        style={{
          fontFamily: HEADING,
          fontWeight: 700,
          fontSize: '0.92rem',
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          color: 'var(--awd-bone)',
        }}
      >
        {show.name}
      </h3>
      <p
        className="mt-1.5 text-[0.72rem]"
        style={{ fontFamily: 'var(--font-source-serif)', color: 'var(--awd-stone)' }}
      >
        {show.count}
      </p>
    </Link>
  )
}
