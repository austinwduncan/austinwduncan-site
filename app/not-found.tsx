import Link from 'next/link'

/*
  The 404.

  About 220 published paths exist in the wild and none of them may 404, which
  makes this page a diagnostic rather than a dead end: if a visitor is standing
  here after following a real link, something is wrong and the page should say
  so plainly and then hand them a door.

  Self contained by design. It names its own typefaces and colours rather than
  importing a kit from components/, because the one page that renders when
  something has gone wrong should not depend on a file that might be mid edit.

  House rules: headings are CMG Sans and never serif, body copy is Source
  Serif, gold is type and rules and one button but never a field, and there are
  no em dashes or en dashes anywhere, comments included.
*/

const BLACK = '#171918'
const GRAPHITE = '#2C302F'
const GOLD = '#CDB079'
const BONE = '#EEEAE1'
const STONE = '#AAA79E'
const STEEL = '#748790'

const HEADING = 'var(--font-cmg), system-ui, sans-serif'
const SERIF = 'var(--font-source-serif), Georgia, serif'

/** The ruled eyebrow, carried over from the Crosswalk visual language. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="block h-px w-8" style={{ background: STEEL, opacity: 0.7 }} />
      <span
        className="uppercase"
        style={{
          fontFamily: HEADING,
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.16em',
          color: STEEL,
        }}
      >
        {children}
      </span>
    </div>
  )
}

/** One of the four L shaped brackets that frame the panel. */
function Bracket({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const vertical = corner.startsWith('t') ? { top: 0 } : { bottom: 0 }
  const horizontal = corner.endsWith('l') ? { left: 0 } : { right: 0 }
  const sides = {
    borderTopWidth: corner.startsWith('t') ? 1 : 0,
    borderBottomWidth: corner.startsWith('b') ? 1 : 0,
    borderLeftWidth: corner.endsWith('l') ? 1 : 0,
    borderRightWidth: corner.endsWith('r') ? 1 : 0,
  }
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute h-6 w-6"
      style={{ ...vertical, ...horizontal, ...sides, borderColor: GOLD, borderStyle: 'solid', opacity: 0.55 }}
    />
  )
}

function DoorLink({
  href,
  label,
  note,
}: {
  href: string
  label: string
  note: string
}) {
  return (
    <Link
      href={href}
      className="group block rounded-[3px] border px-5 py-4 transition-colors"
      style={{ borderColor: 'rgba(238,234,225,0.10)', background: 'rgba(44,48,47,0.35)' }}
    >
      <span
        className="block"
        style={{ fontFamily: HEADING, fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', color: BONE }}
      >
        {label}
      </span>
      <span
        className="mt-1 block"
        style={{ fontFamily: SERIF, fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(170,167,158,0.9)' }}
      >
        {note}
      </span>
    </Link>
  )
}

/*
  The doors.

  Deliberately a static list rather than a live read of the collections.

  The not-found boundary is part of every route's tree, so this component is
  rendered on every request in the site, not only on a 404. An await here is
  therefore a database read on every page, and a swallowed failure here turns a
  working page into a 500. Both were measured, not guessed. The nine paths
  below are the standing entry points, none of which moved in the rebuild.
*/
const DOORS: { href: string; label: string; note: string }[] = [
  {
    href: '/scripture',
    label: 'Scripture',
    note: 'The canon as an index, book by book and chapter by chapter.',
  },
  {
    href: '/topics',
    label: 'Topics',
    note: 'What the teaching is about, gathered by theme.',
  },
  {
    href: '/library/browse',
    label: 'Browse everything',
    note: 'Filter by collection, format, depth, topic and passage.',
  },
  {
    href: '/sermons',
    label: 'Sermons',
    note: 'Sunday preaching, newest first.',
  },
  {
    href: '/teaching',
    label: 'In the Text',
    note: 'Book studies and topical series, taught a chapter at a time.',
  },
  {
    href: '/word-for-word',
    label: 'Word for Word',
    note: 'Straight answers to the questions people actually ask.',
  },
  {
    href: '/exegetica',
    label: 'Exegetica',
    note: 'Longer scholarly work on the text itself.',
  },
  {
    href: '/forum-and-pulpit',
    label: 'Forum and Pulpit',
    note: 'The moment in front of us, read through Scripture.',
  },
]

export default function NotFound() {

  return (
    <div className="px-6 py-28 lg:px-10 lg:py-36" style={{ background: BLACK }}>
      <div className="mx-auto max-w-[68rem]">
        <div
          className="relative px-6 py-12 sm:px-10 sm:py-16"
          style={{ border: '1px solid rgba(238,234,225,0.08)', borderRadius: 3 }}
        >
          <Bracket corner="tl" />
          <Bracket corner="tr" />
          <Bracket corner="bl" />
          <Bracket corner="br" />

          <Eyebrow>Error 404</Eyebrow>

          <h1
            className="mt-6 max-w-[20ch] text-balance"
            style={{
              fontFamily: HEADING,
              fontSize: 'clamp(2.6rem, 6.6vw, 5.4rem)',
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              color: BONE,
            }}
          >
            Nothing lives at this address
          </h1>

          <p
            className="mt-8 max-w-[62ch]"
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(1.02rem, 1.35vw, 1.2rem)',
              lineHeight: 1.72,
              color: 'rgba(238,234,225,0.74)',
            }}
          >
            Every sermon, study, article and paper ever published here still answers at the
            address it was published under. If you followed a link from somewhere else and
            landed on this page, the link is either mistyped or it was never one of ours.
            Nothing has been taken down.
          </p>

          <p
            className="mt-4 max-w-[62ch]"
            style={{ fontFamily: SERIF, fontSize: '1rem', lineHeight: 1.72, color: STONE }}
          >
            The whole library is searchable, and it can be entered through Scripture, through
            a topic, or through the collection a piece belongs to.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/library"
              className="inline-flex items-center rounded-[3px] px-6 py-3 uppercase transition-opacity hover:opacity-90"
              style={{
                background: GOLD,
                color: BLACK,
                fontFamily: HEADING,
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
              }}
            >
              Enter the Library
            </Link>
            <Link
              href="/"
              className="uppercase underline-offset-4 hover:underline"
              style={{
                fontFamily: HEADING,
                fontSize: '0.74rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                color: STONE,
              }}
            >
              Back to the front page
            </Link>
          </div>
        </div>

        <div className="mt-14">
          <Eyebrow>Ways in</Eyebrow>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DOORS.map(door => (
              <DoorLink key={door.href} href={door.href} label={door.label} note={door.note} />
            ))}
          </div>
        </div>

        <p
          className="mt-14 border-t pt-6"
          style={{
            borderColor: GRAPHITE,
            fontFamily: SERIF,
            fontSize: '0.92rem',
            lineHeight: 1.7,
            color: STONE,
          }}
        >
          Still looking for something specific? The{' '}
          <Link href="/library/browse" className="underline underline-offset-4" style={{ color: GOLD }}>
            full index
          </Link>{' '}
          carries every piece on the site, and{' '}
          <Link href="/about" className="underline underline-offset-4" style={{ color: GOLD }}>
            the about page
          </Link>{' '}
          has a way to get in touch.
        </p>
      </div>
    </div>
  )
}
