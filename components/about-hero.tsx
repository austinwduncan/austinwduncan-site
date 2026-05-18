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
      style={{ height: 'min(88vh, 740px)', minHeight: 520 }}
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

      {/* Gradient overlay — heavy at bottom, lighter at top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(14,12,10,0.97) 0%, rgba(14,12,10,0.82) 30%, rgba(14,12,10,0.45) 60%, rgba(14,12,10,0.18) 100%)',
        }}
      />

      {/* Text — bottom-left */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pb-14 lg:pb-18">
          <div className="aw-eyebrow flex items-center gap-2.5 mb-7">
            <span className="inline-block h-px w-5 shrink-0" style={{ background: '#B8892E' }} />
            <span
              className="text-[0.63rem] font-medium tracking-[0.2em] uppercase"
              style={{ color: '#B8892E' }}
            >
              Associate Pastor&nbsp;&nbsp;·&nbsp;&nbsp;Crosswalk Church&nbsp;&nbsp;·&nbsp;&nbsp;Brentwood, TN
            </span>
          </div>

          <h1 className="aw-name leading-[0.9] tracking-tight mb-6">
            <span
              className="block"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(4rem, 7.5vw, 6.8rem)',
                fontWeight: 300,
                color: '#F9F6F0',
              }}
            >
              Austin
            </span>
            <span
              className="block"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(4rem, 7.5vw, 6.8rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: '#C9984A',
              }}
            >
              W. Duncan
            </span>
          </h1>

          <div className="aw-rule h-px w-12 mb-6" style={{ background: '#7A5C1E' }} />

          <p
            className="aw-desc text-[1rem] leading-[1.8]"
            style={{
              fontFamily: 'var(--font-source-serif)',
              fontStyle: 'italic',
              color: 'rgba(249,246,240,0.45)',
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
