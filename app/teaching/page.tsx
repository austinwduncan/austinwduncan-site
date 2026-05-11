import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAll, type TeachingFrontmatter } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Teaching',
  description: 'Multi-part expositional and topical series.',
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
  const series = getAll<TeachingFrontmatter>(`teaching/${type}`)
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {series.map(({ frontmatter: fm, slug }) => (
          <Link
            key={slug}
            href={`/teaching/${type}/${slug}`}
            className="group border border-zinc-100 p-6 hover:border-zinc-200 transition-colors"
          >
            <span
              className="text-[10px] font-semibold tracking-[0.14em] uppercase"
              style={{ color: '#cdb079' }}
            >
              {fm.status === 'ongoing' ? 'Ongoing' : `${fm.parts} parts`}
            </span>
            <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight text-zinc-900 group-hover:text-zinc-500 transition-colors">
              {fm.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed line-clamp-2">{fm.excerpt}</p>
          </Link>
        ))}
      </div>
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
