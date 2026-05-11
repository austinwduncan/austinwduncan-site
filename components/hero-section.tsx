'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Greeting from '@/components/greeting'

export interface HeroPick {
  category: string
  title: string
  href: string
  date: string
}

export interface HeroFeatured {
  category: string
  title: string
  excerpt: string
  href: string
  date: string
  image?: string
}

interface Props {
  featured: HeroFeatured
  picks: HeroPick[]
}

function CategoryLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[11px] font-semibold tracking-[0.14em] uppercase"
      style={{ color: '#cdb079' }}
    >
      {children}
    </span>
  )
}

export default function HeroSection({ featured, picks }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const hasImage = Boolean(featured.image)

  useEffect(() => {
    if (!hasImage) return
    const onScroll = () => {
      if (imgRef.current) {
        imgRef.current.style.transform = `scale(1.12) translateY(${window.scrollY * 0.28}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hasImage])

  return (
    <section className="border-b border-zinc-200">
      <div className="grid lg:grid-cols-[1fr_340px]">

        {/* Featured panel — full-bleed dark with optional parallax image */}
        <div className="relative flex flex-col justify-between min-h-[460px] overflow-hidden">

          {/* Background layer */}
          <div className="absolute inset-0">
            {hasImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={featured.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: 'scale(1.12) translateY(0px)', filter: 'blur(3px)' }}
              />
            )}
            {/* Dark overlay — full black when no image, 75% when image present */}
            <div
              className="absolute inset-0 bg-zinc-950"
              style={{ opacity: hasImage ? 0.75 : 1 }}
            />
          </div>

          {/* Content */}
          <div
            className="relative z-10 flex flex-col justify-between h-full py-12 lg:py-16 pr-8 lg:pr-14"
            style={{ paddingLeft: 'max(2rem, calc((100vw - 80rem) / 2 + 2rem))' }}
          >
            <div>
              <Greeting />
              <div className="flex items-center gap-2 mt-5">
                <CategoryLabel>{featured.category}</CategoryLabel>
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-white leading-[1.06] tracking-tight max-w-xl">
                {featured.title}
              </h1>
              {featured.excerpt && (
                <p className="mt-5 text-[16px] text-zinc-400 leading-relaxed max-w-lg font-light line-clamp-3">
                  {featured.excerpt}
                </p>
              )}
            </div>
            <div className="mt-10 flex items-center gap-6">
              <Link
                href={featured.href}
                className="inline-flex items-center gap-2 text-[14px] font-medium tracking-wide hover:opacity-75 transition-opacity"
                style={{ color: '#cdb079' }}
              >
                Listen Now <ArrowRight size={13} />
              </Link>
              <span className="text-zinc-600 text-[13px]">{featured.date}</span>
            </div>
          </div>
        </div>

        {/* Secondary picks */}
        <div
          className="bg-white border-t-4 lg:border-t-0 lg:border-l border-zinc-200 px-8 py-10 flex flex-col"
          style={{ borderTopColor: '#cdb079' }}
        >
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-7">
            Also —
          </p>
          <div className="flex flex-col flex-1 divide-y divide-zinc-100">
            {picks.map((pick) => (
              <Link key={pick.href} href={pick.href} className="group py-5 first:pt-0 last:pb-0">
                <CategoryLabel>{pick.category}</CategoryLabel>
                <h3 className="mt-2 text-[15px] font-semibold leading-snug text-zinc-800 group-hover:text-zinc-500 transition-colors">
                  {pick.title}
                </h3>
                <p className="mt-2 text-[12px] text-zinc-400">{pick.date}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
