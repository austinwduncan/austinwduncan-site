'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

export function AboutHero() {
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        if (imgRef.current) {
          imgRef.current.style.transform = `translateY(${window.scrollY * 0.32}px)`
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: 'min(46vh, 400px)', minHeight: 300 }}
    >
      {/* Parallax background */}
      <div
        ref={imgRef}
        className="absolute will-change-transform"
        style={{ inset: 0, top: '-22%', bottom: '-22%' }}
      >
        <Image
          src="/images/Headshots/Austin Duncan Preaching B&W.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Gradient overlay: heavy at bottom, lighter at top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(38,45,49,0.97) 0%, rgba(38,45,49,0.82) 30%, rgba(38,45,49,0.45) 60%, rgba(38,45,49,0.18) 100%)',
        }}
      />

      {/* Text, bottom left */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pb-10 lg:pb-12">
          <div className="aw-eyebrow flex items-center gap-2.5 mb-5">
            <span className="inline-block h-px w-5 shrink-0" style={{ background: '#7B9BB5' }} />
            <span
              className="text-[0.63rem] font-medium tracking-[0.2em] uppercase"
              style={{ color: '#7B9BB5' }}
            >
              Associate Pastor&nbsp;&nbsp;·&nbsp;&nbsp;Crosswalk Church&nbsp;&nbsp;·&nbsp;&nbsp;Brentwood, TN
            </span>
          </div>

          <h1
            className="aw-name leading-none mb-5 whitespace-nowrap uppercase"
            style={{
              fontFamily: 'var(--font-bebas), var(--font-cmg), sans-serif',
              fontSize: 'clamp(3.4rem, 8vw, 7rem)',
              fontWeight: 400,
              letterSpacing: '0.01em',
              lineHeight: 0.88,
              color: '#FFFFFF',
            }}
          >
            Austin W<span style={{ color: '#7B9BB5' }}>.</span> Duncan
          </h1>

          <div className="aw-rule h-px w-12 mb-4" style={{ background: '#4F6B84' }} />

          <p
            className="aw-desc text-[1rem] leading-[1.8]"
            style={{
              fontFamily: 'var(--font-cmg), system-ui, sans-serif',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.72)',
            }}
          >
            Pastor. Teacher. Student of Holy Scripture.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes awFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .aw-eyebrow { animation: awFadeUp 0.75s ease-out 0.05s both; }
        .aw-name    { animation: awFadeUp 0.75s ease-out 0.22s both; }
        .aw-rule    { animation: awFadeUp 0.55s ease-out 0.44s both; }
        .aw-desc    { animation: awFadeUp 0.75s ease-out 0.55s both; }
      `}</style>
    </section>
  )
}
