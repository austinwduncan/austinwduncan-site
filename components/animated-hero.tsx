'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export type HeroSlide = {
  section: string
  title: string
  excerpt: string
  href: string
  date: string
  cta: string
  image?: string
}

const DECO = "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23cdb079' stroke-width='0.9'/%3E%3Cpath d='M30 13L47 30L30 47L13 30Z' fill='none' stroke='%23cdb079' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='0' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='60' cy='30' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='30' cy='60' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='0' cy='30' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='60' cy='0' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='60' cy='60' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='0' cy='60' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='30' cy='30' r='1.2' fill='%23cdb079'/%3E%3C/svg%3E"

const INTERVAL = 7000

export default function AnimatedHero({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const startRef = useRef(Date.now())
  const capturedProgressRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const goTo = useCallback((idx: number) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(idx)
      setProgress(0)
      startRef.current = Date.now()
      setFading(false)
    }, 450)
  }, [])

  useEffect(() => {
    if (paused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    const tick = () => {
      const p = Math.min((Date.now() - startRef.current) / INTERVAL, 1)
      setProgress(p)
      if (p >= 1) {
        goTo((current + 1) % slides.length)
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [current, paused, goTo, slides.length])

  const slide = slides[current]

  return (
    <section
      className="relative overflow-hidden bg-zinc-950"
      style={{ height: 'min(88svh, 740px)', minHeight: '540px' }}
      onMouseEnter={() => {
        capturedProgressRef.current = progress
        setPaused(true)
      }}
      onMouseLeave={() => {
        startRef.current = Date.now() - capturedProgressRef.current * INTERVAL
        setPaused(false)
      }}
    >
      {/* Per-slide background images */}
      {slides.map((s, i) =>
        s.image ? (
          <div
            key={i}
            className="absolute inset-0"
            style={{ opacity: i === current && !fading ? 1 : 0, transition: 'opacity 0.9s ease' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image} alt="" className="w-full h-full object-cover" style={{ opacity: 0.25 }} />
          </div>
        ) : null
      )}

      {/* Art-deco pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `url("${DECO}")`, backgroundSize: '60px 60px', opacity: 0.15 }}
      />

      {/* Gradients */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.97) 0%, rgba(9,9,11,0.6) 45%, rgba(9,9,11,0.15) 100%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(9,9,11,0.4) 0%, transparent 60%)' }}
      />
      {/* Gold ambient glow */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 18% 82%, rgba(205,176,121,0.07) 0%, transparent 55%)' }}
      />

      {/* Slide content */}
      <div className="absolute inset-0 flex flex-col justify-end z-10">
        <div
          className="mx-auto max-w-7xl w-full px-6 lg:px-8 pb-8 lg:pb-10"
          style={{
            opacity: fading ? 0 : 1,
            transform: fading ? 'translateY(10px)' : 'translateY(0)',
            transition: 'opacity 0.45s ease, transform 0.45s ease',
          }}
        >
          {/* Section badge */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 flex-shrink-0" style={{ backgroundColor: '#cdb079' }} />
            <span
              className="text-[11px] font-bold tracking-[0.26em] uppercase"
              style={{ color: '#cdb079' }}
            >
              {slide.section}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-white leading-[1.07] tracking-tight max-w-3xl">
            {slide.title}
          </h1>

          {/* Excerpt */}
          {slide.excerpt && (
            <p className="mt-4 text-base lg:text-[17px] text-zinc-400 leading-relaxed max-w-2xl line-clamp-2 font-light">
              {slide.excerpt}
            </p>
          )}

          {/* CTA + date */}
          <div className="mt-8 flex items-center gap-6">
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.14em] uppercase transition-opacity hover:opacity-70"
              style={{ color: '#cdb079' }}
            >
              {slide.cta} <ArrowRight size={12} />
            </Link>
            <span className="text-zinc-500 text-[13px]">{slide.date}</span>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="mx-auto max-w-7xl w-full px-6 lg:px-8 pb-10 lg:pb-12">
          <div className="flex items-center gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { if (!fading && i !== current) goTo(i) }}
                aria-label={`Go to slide ${i + 1}`}
                className="relative overflow-hidden flex-shrink-0 cursor-pointer"
                style={{
                  height: '3px',
                  width: i === current ? '48px' : '20px',
                  backgroundColor: 'rgba(255,255,255,0.14)',
                  transition: 'width 0.35s ease',
                }}
              >
                {i === current && (
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: '#cdb079',
                      transition: 'width 0.1s linear',
                    }}
                  />
                )}
                {i < current && (
                  <div className="absolute inset-0" style={{ backgroundColor: 'rgba(205,176,121,0.45)' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
