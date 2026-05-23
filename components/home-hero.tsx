'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const DECO =
  "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23B8892E' stroke-width='0.9'/%3E%3Cpath d='M30 13L47 30L30 47L13 30Z' fill='none' stroke='%23B8892E' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='0' r='1.8' fill='%23B8892E'/%3E%3Ccircle cx='60' cy='30' r='1.8' fill='%23B8892E'/%3E%3Ccircle cx='30' cy='60' r='1.8' fill='%23B8892E'/%3E%3Ccircle cx='0' cy='30' r='1.8' fill='%23B8892E'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='%23B8892E'/%3E%3Ccircle cx='60' cy='0' r='1.2' fill='%23B8892E'/%3E%3Ccircle cx='60' cy='60' r='1.2' fill='%23B8892E'/%3E%3Ccircle cx='0' cy='60' r='1.2' fill='%23B8892E'/%3E%3Ccircle cx='30' cy='30' r='1.2' fill='%23B8892E'/%3E%3C/svg%3E"

function CountUp({ end }: { end: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        observer.disconnect()
        const duration = 1600
        const startTime = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - startTime) / duration, 1)
          const eased = 1 - Math.pow(1 - t, 3)
          setCount(Math.floor(eased * end))
          if (t < 1) requestAnimationFrame(tick)
          else setCount(end)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end])

  return <span ref={ref}>{count}</span>
}

export type HeroStat = { label: string; value: number; suffix?: string }

export default function HomeHero({
  stats,
  primaryCtaHref,
  primaryCtaLabel,
  secondaryCtaHref,
  secondaryCtaLabel,
}: {
  stats: HeroStat[]
  primaryCtaHref: string
  primaryCtaLabel: string
  secondaryCtaHref?: string
  secondaryCtaLabel?: string
}) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 18,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 14,
    })
  }

  const handleMouseLeave = () => setMouse({ x: 0, y: 0 })

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: '#141210' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Art-deco geometric pattern — subtle, parallaxes with mouse */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("${DECO}")`,
          backgroundSize: '60px 60px',
          opacity: 0.09,
          transform: `translate(${mouse.x}px, ${mouse.y}px)`,
          transition: 'transform 0.18s ease-out',
          willChange: 'transform',
        }}
      />

      {/* Ambient amber glow — bottom-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 5% 90%, rgba(184,137,46,0.14) 0%, transparent 55%)',
        }}
      />

      {/* Fade to amber strip at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: 60, background: 'linear-gradient(to bottom, transparent, rgba(122,92,30,0.18))' }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-8" style={{ color: '#B8892E' }}>
          <span className="inline-block h-px w-8" style={{ background: '#B8892E' }} />
          <span className="text-[0.65rem] font-medium tracking-[0.22em] uppercase">Austin W. Duncan</span>
        </div>

        {/* Headline */}
        <h1
          className="leading-[1.05] tracking-tight mb-5 max-w-[720px]"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2.8rem, 6vw, 4.8rem)',
            fontWeight: 400,
            color: '#F9F6F0',
          }}
        >
          Bible teaching for people who want to read Scripture carefully.
        </h1>

        {/* Subtitle */}
        <p
          className="leading-[1.72] mb-10 max-w-[520px]"
          style={{
            fontFamily: 'var(--font-source-serif)',
            fontSize: 'clamp(0.92rem, 1.4vw, 1.05rem)',
            color: 'rgba(255,255,255,0.42)',
          }}
        >
          Sermons, studies, scholarly articles, and a reading list — for Christians who want depth without being talked down to.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4 mb-14 lg:mb-16">
          <Link
            href={primaryCtaHref}
            className="inline-flex items-center gap-2 px-6 py-3 text-[0.8rem] font-medium tracking-[0.04em] text-white transition-opacity hover:opacity-85"
            style={{ background: '#7A5C1E' }}
          >
            {primaryCtaLabel} <ArrowRight size={13} />
          </Link>
          {secondaryCtaHref && secondaryCtaLabel && (
            <Link
              href={secondaryCtaHref}
              className="text-[0.8rem] font-medium pb-px border-b transition-colors hover:text-[#B8892E] hover:border-[#B8892E]"
              style={{ color: 'rgba(255,255,255,0.38)', borderColor: 'rgba(255,255,255,0.14)' }}
            >
              {secondaryCtaLabel}
            </Link>
          )}
        </div>

        {/* Stats */}
        <div
          className="flex flex-wrap gap-8 pt-8 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          {stats.map(({ label, value, suffix }) => (
            <div key={label}>
              <p
                className="leading-none mb-1.5"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  fontWeight: 300,
                  color: '#B8892E',
                }}
              >
                <CountUp end={value} />{suffix ?? '+'}
              </p>
              <p
                className="text-[0.65rem] font-medium tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.22)' }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
