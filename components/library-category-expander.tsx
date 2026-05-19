'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type FeaturedCategory = {
  name: string
  cover: string
  count: number
}

type AllCategory = {
  name: string
  count: number
}

export function LibraryCategoryExpander({
  featured,
  all,
}: {
  featured: FeaturedCategory[]
  all: AllCategory[]
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      {/* Section header */}
      <div
        className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-10"
        style={{ color: '#9A9189' }}
      >
        Browse by Category
        <span className="flex-1 h-px" style={{ background: '#D8D0C4' }} />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 transition-colors hover:text-[#7A5C1E]"
          style={{ color: '#B8892E' }}
        >
          {expanded ? 'Show less ↑' : `View all ${all.length} →`}
        </button>
      </div>

      {/* Featured category image tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {featured.map((cat) => (
          <Link
            key={cat.name}
            href={`/library/browse?category=${encodeURIComponent(cat.name)}`}
            className="group relative overflow-hidden block"
            style={{ aspectRatio: '4/3' }}
          >
            <Image
              src={cat.cover}
              alt=""
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.08]"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{ background: 'linear-gradient(to top, rgba(14,12,10,0.88) 0%, rgba(14,12,10,0.6) 50%, rgba(14,12,10,0.3) 100%)' }}
            />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <span
                className="text-[0.55rem] font-semibold tracking-[0.14em] uppercase mb-1 transition-colors group-hover:text-[#C9984A]"
                style={{ color: '#B8892E' }}
              >
                {cat.count} books
              </span>
              <h3
                className="leading-tight tracking-tight transition-colors group-hover:text-[#F9F6F0]"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                  fontWeight: 500,
                  color: 'rgba(249,246,240,0.9)',
                }}
              >
                {cat.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Expandable all-categories chip list */}
      {expanded && (
        <div className="mt-8 pt-8 border-t" style={{ borderColor: '#D8D0C4' }}>
          <p
            className="text-[0.62rem] font-medium tracking-[0.1em] uppercase mb-5"
            style={{ color: '#B0A898' }}
          >
            All {all.length} Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {all.map((cat) => (
              <Link
                key={cat.name}
                href={`/library/browse?category=${encodeURIComponent(cat.name)}`}
                className="group inline-flex items-center gap-2 px-3.5 py-2 border transition-all duration-200 hover:border-[#B8892E] hover:bg-[#FEFCF7]"
                style={{ borderColor: '#D8D0C4', background: '#F5F2EB' }}
              >
                <span
                  className="text-[0.67rem] font-medium tracking-[0.08em] transition-colors group-hover:text-[#7A5C1E]"
                  style={{ color: '#4A4038' }}
                >
                  {cat.name}
                </span>
                <span
                  className="text-[0.56rem] font-medium tracking-[0.06em] transition-colors group-hover:text-[#B8892E]"
                  style={{ color: '#B0A898' }}
                >
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
