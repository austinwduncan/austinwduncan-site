import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getAllTeaching, sortByDate, isPublished, type TeachingFrontmatter } from '@/lib/content'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Teaching',
  description: 'Multi-part expositional and topical series.',
}

type SeriesEntry = {
  name: string
  count: number
  image?: string
  latestSlug: string
}

function buildSeries(
  type: 'expositional' | 'topical'
): SeriesEntry[] {
  const all = sortByDate(
    getAllTeaching<TeachingFrontmatter>(type).filter((a) => isPublished(a.frontmatter.date))
  )
  const map = new Map<string, { count: number; image?: string; latestSlug: string }>()
  for (const { frontmatter: fm, slug } of all) {
    const series = fm.tags?.[fm.tags.length - 1] ?? 'Other'
    if (!map.has(series)) {
      map.set(series, { count: 0, image: fm.image, latestSlug: slug })
    }
    map.get(series)!.count++
    if (fm.image && !map.get(series)!.image) map.get(series)!.image = fm.image
  }
  return [...map.entries()].map(([name, v]) => ({ name, ...v }))
}

function SeriesList({
  type,
  label,
  href,
}: {
  type: 'expositional' | 'topical'
  label: string
  href: string
}) {
  const series = buildSeries(type)

  return (
    <div>
      <div
        className="flex items-center gap-3 mb-8 pb-3"
        style={{ borderBottom: '2px solid #cdb079' }}
      >
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-zinc-900">
          {label}
        </span>
        <div className="flex-1" />
        <Link
          href={href}
          className="flex items-center gap-1.5 text-[11px] tracking-wide uppercase text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          All Series <ArrowRight size={10} />
        </Link>
      </div>

      {series.length === 0 ? (
        <p className="text-sm text-zinc-400">No published series yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map(({ name, count, image, latestSlug }) => (
            <Link
              key={name}
              href={href}
              className="group border-t border-zinc-200 pt-5"
            >
              {image && (
                <div className="mb-4 overflow-hidden bg-zinc-100 aspect-[16/9]">
                  <Image
                    src={image}
                    alt=""
                    width={400}
                    height={225}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              )}
              <h3 className="text-[15px] font-semibold leading-snug text-zinc-900 group-hover:text-zinc-500 transition-colors mb-1.5">
                {name}
              </h3>
              <p className="text-[12px] text-zinc-400">{count} session{count !== 1 ? 's' : ''}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TeachingPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
      <div className="mb-14">
        <span
          className="text-[10px] font-semibold tracking-[0.16em] uppercase"
          style={{ color: '#cdb079' }}
        >
          Teaching
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
          Series & Studies
        </h1>
        <p className="mt-3 text-base text-zinc-500 max-w-xl">
          Multi-part series working through books of the Bible and key theological topics.
        </p>
      </div>

      <div className="space-y-16">
        <SeriesList type="expositional" label="Expositional" href="/teaching/expositional" />
        <SeriesList type="topical" label="Topical" href="/teaching/topical" />
      </div>
    </div>
  )
}
