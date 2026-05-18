'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export function AboutBioHeadshot() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col gap-7">
      {/* Photo */}
      <div
        ref={ref}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: 'opacity 1s ease-out, transform 1s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="aw-portrait relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
          <Image
            src="/images/Headshots/37fdc3a2-c0c8-4ccd-a8d4-741d6f636a55.jpg"
            alt="Austin W. Duncan"
            fill
            className="aw-portrait-img object-cover object-top"
            sizes="300px"
          />
        </div>
      </div>

      {/* Caption */}
      <div
        className="pl-4 border-l-2"
        style={{
          borderColor: '#E2DACE',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.8s ease-out 0.35s, transform 0.8s ease-out 0.35s',
        }}
      >
        <p
          className="text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-1"
          style={{ color: '#9A9189' }}
        >
          Currently serving at
        </p>
        <p
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.25rem',
            color: '#1A1714',
          }}
        >
          Crosswalk Church
        </p>
        <p className="text-[0.82rem] mt-0.5" style={{ color: '#5A544C' }}>
          Brentwood, Tennessee
        </p>
      </div>

      <style>{`
        .aw-portrait {
          transform: rotate(-1.2deg);
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease;
        }
        .aw-portrait:hover {
          transform: rotate(0deg) scale(1.025);
          box-shadow: 0 0 0 2.5px #B8892E, 0 12px 40px rgba(0,0,0,0.12);
        }
        .aw-portrait-img {
          filter: sepia(0.38) brightness(0.97);
          transition: filter 0.45s ease;
        }
        .aw-portrait:hover .aw-portrait-img {
          filter: sepia(0) brightness(1);
        }
      `}</style>
    </div>
  )
}
