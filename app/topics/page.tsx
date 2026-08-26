import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollReveal from '@/components/scroll-reveal'
import { getTopicsWithCounts, type TopicWithCount } from '@/components/library/scripture/data'
import {
  BONE, GOLD, HEADING, SERIF, STONE, Eyebrow, Heading, Lede, Page, Section, Stat,
} from '@/components/library/scripture/kit'

/*
  All 152 topics.

  A flat list of 152 links tells a reader nothing, so the page is banded by
  weight instead. The handful of themes Austin returns to again and again are
  set large, the recurring ones sit in a tile grid, and the long tail of single
  studies is a dense field of chips. Size is the information: the shape of the
  page is the shape of the teaching.
*/

export const revalidate = 300

const BANDS = [
  {
    key: 'major',
    label: 'The through lines',
    note: 'Themes Austin returns to across the whole library.',
    min: 25,
    max: Number.POSITIVE_INFINITY,
  },
  {
    key: 'recurring',
    label: 'Recurring',
    note: 'Worked out over a run of sermons, studies and articles.',
    min: 8,
    max: 24,
  },
  {
    key: 'occasional',
    label: 'Taken up now and then',
    note: 'A few pieces each, often tied to a particular passage.',
    min: 3,
    max: 7,
  },
  {
    key: 'single',
    label: 'Single studies',
    note: 'One or two pieces. Narrow on purpose, and often the most specific.',
    min: 1,
    max: 2,
  },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const topics = await getTopicsWithCounts()
  return {
    title: 'Topics',
    description: `Every theme in the library, ${topics.length} of them, sized by how often Austin W. Duncan returns to it.`,
    alternates: { canonical: '/topics' },
    openGraph: {
      title: 'Topics | Austin W. Duncan',
      description: `${topics.length} themes across sermons, studies and written work.`,
      type: 'website',
    },
  }
}

function Major({ entry }: { entry: TopicWithCount }) {
  return (
    <Link
      href={`/topics/${entry.topic.slug}`}
      className="group relative flex min-w-0 flex-col justify-between rounded-[3px] border px-7 py-8 transition-colors"
      style={{ borderColor: 'rgba(205,176,121,0.3)', background: 'rgba(205,176,121,0.045)' }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[3px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(205,176,121,0.75)' }}
      />
      <span className="block text-bone transition-colors group-hover:text-gold">
        <Heading as="h3" size="sm" color="currentColor">{entry.topic.name}</Heading>
      </span>
      <span className="mt-8 flex items-baseline gap-2">
        <span
          style={{ fontFamily: HEADING, fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, color: GOLD, fontVariantNumeric: 'tabular-nums' }}
        >
          {entry.count}
        </span>
        <span
          className="uppercase"
          style={{ fontFamily: HEADING, fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
        >
          {entry.count === 1 ? 'piece' : 'pieces'}
        </span>
      </span>
    </Link>
  )
}

function Tile({ entry }: { entry: TopicWithCount }) {
  return (
    <Link
      href={`/topics/${entry.topic.slug}`}
      className="group relative flex min-w-0 items-baseline justify-between gap-4 rounded-[3px] border px-5 py-4 transition-colors"
      style={{ borderColor: 'rgba(238,234,225,0.12)', background: 'rgba(238,234,225,0.02)' }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[3px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(205,176,121,0.6)' }}
      />
      <span
        className="min-w-0 text-bone transition-colors group-hover:text-gold"
        style={{ fontFamily: HEADING, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}
      >
        {entry.topic.name}
      </span>
      <span
        className="shrink-0"
        style={{ fontFamily: HEADING, fontSize: '0.78rem', fontWeight: 700, color: GOLD, fontVariantNumeric: 'tabular-nums' }}
      >
        {entry.count}
      </span>
    </Link>
  )
}

function ChipLink({ entry }: { entry: TopicWithCount }) {
  return (
    <Link
      href={`/topics/${entry.topic.slug}`}
      className="inline-flex min-w-0 items-baseline gap-2 rounded-[2px] border px-3 py-2 transition-colors hover:text-gold"
      style={{ borderColor: 'rgba(238,234,225,0.1)', fontFamily: HEADING, fontSize: '0.76rem', fontWeight: 600, letterSpacing: '-0.005em', color: 'rgba(238,234,225,0.72)' }}
    >
      <span className="min-w-0">{entry.topic.name}</span>
      <span style={{ fontSize: '0.66rem', color: STONE, fontVariantNumeric: 'tabular-nums' }}>{entry.count}</span>
    </Link>
  )
}

function Band({
  label,
  note,
  entries,
  render,
  columns,
}: {
  label: string
  note: string
  entries: TopicWithCount[]
  render: (e: TopicWithCount) => React.ReactNode
  columns: string
}) {
  if (!entries.length) return null
  return (
    <ScrollReveal>
      <div className="border-t pt-10" style={{ borderColor: 'rgba(238,234,225,0.12)' }}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <Heading as="h2" size="sm" uppercase>{label}</Heading>
            <p
              className="mt-2"
              style={{ fontFamily: SERIF, fontSize: '0.96rem', lineHeight: 1.6, color: 'rgba(238,234,225,0.55)' }}
            >
              {note}
            </p>
          </div>
          <span
            className="uppercase"
            style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE, fontVariantNumeric: 'tabular-nums' }}
          >
            {`${entries.length} ${entries.length === 1 ? 'topic' : 'topics'}`}
          </span>
        </div>
        <div style={{ display: 'grid', gap: '0.7rem', gridTemplateColumns: columns }}>
          {entries.map(e => (
            <div key={e.topic.id} className="min-w-0">{render(e)}</div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  )
}

export default async function TopicsPage() {
  const topics = await getTopicsWithCounts()
  const band = (key: (typeof BANDS)[number]['key']) => {
    const b = BANDS.find(x => x.key === key)!
    return topics.filter(t => t.count >= b.min && t.count <= b.max)
  }

  const major = band('major')
  const recurring = band('recurring')
  const occasional = band('occasional')
  const single = band('single')
  const total = topics.reduce((a, t) => a + t.count, 0)

  return (
    <Page>
      <Section className="pb-10 lg:pb-14">
        <ScrollReveal>
          <Eyebrow>The Library</Eyebrow>
          <Heading as="h1" size="xl" uppercase className="mt-6">Topics</Heading>
          <Lede className="mt-7">
            Every theme in the library, sized by how often Austin returns to it. The
            through lines sit at the top, the single studies at the bottom, and both
            are equally worth reading.
          </Lede>

          <div
            className="mt-12 flex flex-wrap gap-x-14 gap-y-8 border-t pt-10"
            style={{ borderColor: 'rgba(238,234,225,0.12)' }}
          >
            <Stat value={topics.length} label="Topics" />
            <Stat value={major.length} label="Through lines" />
            <Stat value={total} label="Topic assignments" />
          </div>
        </ScrollReveal>
      </Section>

      <Section tight className="pt-0">
        <div className="flex flex-col gap-16">
          <Band
            label={BANDS[0].label}
            note={BANDS[0].note}
            entries={major}
            columns="repeat(auto-fill, minmax(min(100%, 17rem), 1fr))"
            render={e => <Major entry={e} />}
          />
          <Band
            label={BANDS[1].label}
            note={BANDS[1].note}
            entries={recurring}
            columns="repeat(auto-fill, minmax(min(100%, 15rem), 1fr))"
            render={e => <Tile entry={e} />}
          />
          <Band
            label={BANDS[2].label}
            note={BANDS[2].note}
            entries={occasional}
            columns="repeat(auto-fill, minmax(min(100%, 13rem), 1fr))"
            render={e => <Tile entry={e} />}
          />
          <Band
            label={BANDS[3].label}
            note={BANDS[3].note}
            entries={single}
            columns="repeat(auto-fill, minmax(min(100%, 11.5rem), 1fr))"
            render={e => <ChipLink entry={e} />}
          />
        </div>
      </Section>

      <Section tight className="pt-0">
        <ScrollReveal>
          <div
            className="flex flex-wrap items-center justify-between gap-6 border-t pt-10"
            style={{ borderColor: 'rgba(238,234,225,0.12)' }}
          >
            <p style={{ fontFamily: SERIF, fontSize: '1rem', lineHeight: 1.7, color: 'rgba(238,234,225,0.6)' }}>
              Prefer to start from a passage?
            </p>
            <Link
              href="/scripture"
              className="inline-flex items-center gap-3 border px-6 py-3 transition-colors"
              style={{ borderColor: 'rgba(205,176,121,0.45)', color: GOLD, fontFamily: HEADING, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em' }}
            >
              <span className="uppercase">Browse Scripture</span>
              <span aria-hidden style={{ color: BONE }}>&rarr;</span>
            </Link>
          </div>
        </ScrollReveal>
      </Section>
    </Page>
  )
}
