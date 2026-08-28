'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export type ExploreSection = {
  slug: string
  label: string
  description: string
  count: number
  countLabel: string
  href: string
}

export default function HomeExplore({ sections }: { sections: ExploreSection[] }) {
  return (
    <div
      className="grid gap-px sm:grid-cols-2 lg:grid-cols-3"
      style={{ background: '#E2DACE' }}
    >
      {sections.map((section) => (
        <Link
          key={section.slug}
          href={section.href}
          className="group relative flex flex-col p-7 transition-all duration-200 hover:-translate-y-[2px]"
          style={{ background: '#fff' }}
        >
          {/* Hover background */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{ background: '#F9F3E8' }}
          />

          {/* Left accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: '#CDB079' }}
          />

          {/* Count */}
          <p
            className="relative leading-none mb-1 transition-colors duration-200"
            style={{
              fontFamily: 'var(--font-cmg), system-ui, sans-serif',
              fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
              fontWeight: 700,
              color: '#E2DACE',
            }}
          >
            <span
              className="transition-colors duration-200 group-hover:text-[#6E5A2E]"
              style={{ color: 'inherit' }}
            >
              {section.count}
            </span>
          </p>

          <p
            className="relative text-[0.62rem] font-medium tracking-[0.1em] uppercase mb-3"
            style={{ color: '#C8BFA8' }}
          >
            {section.countLabel}
          </p>

          <p
            className="relative uppercase mb-2 transition-colors duration-200 group-hover:text-[#7A5C1E]"
            style={{
              fontFamily: 'var(--font-cmg), system-ui, sans-serif',
              fontSize: '1.2rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: '#1A1714',
            }}
          >
            {section.label}
          </p>

          <p
            className="relative text-[0.82rem] leading-[1.65] flex-1 mb-5"
            style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: '#9A9189' }}
          >
            {section.description}
          </p>

          <div
            className="relative flex items-center gap-1.5 text-[0.7rem] font-medium tracking-[0.06em] uppercase transition-colors duration-200 group-hover:text-[#7A5C1E]"
            style={{ color: '#C8BFA8' }}
          >
            Explore
            <ArrowRight
              size={11}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </div>
        </Link>
      ))}
    </div>
  )
}
