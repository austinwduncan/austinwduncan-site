import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AboutHero } from '@/components/about-hero'
import { AboutBioHeadshot } from '@/components/about-bio-headshot'

export const metadata: Metadata = {
  title: 'About',
  description: 'Pastor, teacher, and student of Holy Scripture — Austin W. Duncan.',
}


const MISSION = [
  { n: '01', title: 'Reach the Lost',      body: 'Locally, nationally, and internationally.',   ref: 'Mark 16:15 · Acts 1:8' },
  { n: '02', title: 'Care for the Reached', body: 'With intentionality and faithfulness.',        ref: 'Acts 20:28' },
  { n: '03', title: 'Train Others',         body: 'To be effective in their own ministries.',    ref: 'Eph. 4:12' },
  { n: '04', title: 'Encourage Believers',  body: 'Toward faithful and wholehearted action.',    ref: 'Eph. 6:7' },
]

const DEGREES = [
  { school: 'Texas Tech University',      degree: 'Bachelor of Fine Arts in Studio Art',          focus: 'Digital Printmaking & Photography' },
  { school: 'The Art Institute of Dallas', degree: 'Master of Arts in Design & Media Management', focus: '' },
  { school: 'Villanova University',        degree: 'Advanced Master’s Certification',         focus: 'Strategic Project Management' },
  { school: 'Bethel Theological Seminary', degree: 'Master of Divinity',                          focus: 'In progress · St. Paul, Minnesota' },
]

const LOGOS = [
  { src: '/images/Logos/cwc-full-logo-dark-color.png', alt: 'Crosswalk Church' },
  { src: '/images/Logos/affiliation-symbis.png',       alt: 'SYMBIS Assessment' },
  { src: '/images/Logos/affiliation-logos.png',        alt: 'Logos Bible Software' },
  { src: '/images/Logos/affiliate-seekjesus.png',      alt: 'Seek Jesus' },
  { src: '/images/Logos/affiliation-dailykairos.png',  alt: 'Daily Kairos' },
]

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <AboutHero />

      {/* ── AMBER STRIP ───────────────────────────────────────────────────── */}
      <div
        className="h-[14px] w-full"
        style={{
          backgroundColor: '#7A5C1E',
          backgroundImage: `
            repeating-linear-gradient(60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px),
            repeating-linear-gradient(-60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px)
          `,
        }}
      />

      {/* ── BIO ───────────────────────────────────────────────────────────── */}
      <section style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-[1fr_300px] gap-14 lg:gap-20 items-start">

            {/* Text */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <span className="h-px w-8" style={{ background: '#B8892E' }} />
                <span className="text-[0.63rem] font-medium tracking-[0.18em] uppercase" style={{ color: '#B8892E' }}>
                  Biography
                </span>
              </div>

              <div
                className="space-y-6 text-[1rem] leading-[1.9]"
                style={{ fontFamily: 'var(--font-source-serif)', color: '#1A1714' }}
              >
                <p className="text-[1.1rem] leading-[1.85]" style={{ color: '#2A2420' }}>
                  Austin is the Associate Pastor of Crosswalk Church in Brentwood, TN — a church
                  dedicated to helping others find hope in Jesus Christ.
                </p>
                <p>
                  Austin, alongside his wife Cassy, resides in Middle Tennessee. Together they share
                  a life enriched by faith, creativity, and a deep commitment to community.
                </p>
                <p>
                  With a heart firmly set on making a meaningful impact, Austin dedicates himself to
                  multiple facets of outreach and ministry — reaching the lost, caring for those
                  reached, equipping others for ministry, and encouraging believers to faithful action.
                </p>
              </div>

              <blockquote
                className="mt-10 pl-5 text-[0.97rem] leading-[1.85] italic"
                style={{
                  fontFamily: 'var(--font-source-serif)',
                  color: '#5A544C',
                  borderLeft: '2.5px solid #B8892E',
                }}
              >
                "It's my desire that while in service to others, my life reflects a total reliance
                on God — so that others may find hope in Him."
              </blockquote>
            </div>

            {/* Right column — interactive portrait */}
            <AboutBioHeadshot />
          </div>
        </div>
      </section>

      {/* ── QUOTE ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#0E0C0A' }}>
        <div className="mx-auto max-w-[900px] px-8 py-24 lg:py-32 text-center">
          <div className="mb-8 inline-block h-px w-12" style={{ background: '#7A5C1E' }} />
          <blockquote
            className="leading-[1.2] tracking-tight"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#F9F6F0',
            }}
          >
            "It's my desire that while in service to others, my life reflects a total reliance on
            God — so that others may find hope in Him."
          </blockquote>
        </div>
      </section>

      {/* ── MISSION ───────────────────────────────────────────────────────── */}
      <section style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-20 lg:py-24">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8" style={{ background: '#B8892E' }} />
            <span className="text-[0.63rem] font-medium tracking-[0.18em] uppercase" style={{ color: '#B8892E' }}>
              Mission
            </span>
          </div>
          <h2
            className="mb-12 leading-tight"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
              fontWeight: 400,
              color: '#1A1714',
            }}
          >
            Four Commitments
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l" style={{ borderColor: '#E2DACE' }}>
            {MISSION.map((m) => (
              <div key={m.n} className="pl-6 pr-4 pb-8 pt-1 border-r" style={{ borderColor: '#E2DACE' }}>
                <div className="text-[0.6rem] font-medium tracking-[0.14em] uppercase mb-4" style={{ color: '#C9984A' }}>
                  {m.n}
                </div>
                <div
                  className="mb-2 leading-tight"
                  style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.35rem', fontWeight: 500, color: '#1A1714' }}
                >
                  {m.title}
                </div>
                <p className="text-[0.84rem] leading-relaxed mb-4" style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}>
                  {m.body}
                </p>
                <p className="text-[0.68rem] italic" style={{ color: '#B8892E' }}>
                  {m.ref}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDUCATION ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#F0EDE6' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-20 lg:py-24">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8" style={{ background: '#B8892E' }} />
            <span className="text-[0.63rem] font-medium tracking-[0.18em] uppercase" style={{ color: '#B8892E' }}>
              Education
            </span>
          </div>
          <h2
            className="mb-12 leading-tight"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
              fontWeight: 400,
              color: '#1A1714',
            }}
          >
            Academic Background
          </h2>

          <div className="grid sm:grid-cols-2 gap-px" style={{ background: '#D8D0C4' }}>
            {DEGREES.map((d) => (
              <div key={d.school} className="px-8 py-7" style={{ background: '#F0EDE6' }}>
                <p className="text-[0.68rem] font-medium tracking-[0.1em] uppercase mb-2" style={{ color: '#9A9189' }}>
                  {d.school}
                </p>
                <p
                  className="leading-tight mb-1"
                  style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 500, color: '#1A1714' }}
                >
                  {d.degree}
                </p>
                {d.focus && (
                  <p className="text-[0.82rem] italic" style={{ fontFamily: 'var(--font-source-serif)', color: '#7A6F65' }}>
                    {d.focus}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BELIEFS + VALUES ──────────────────────────────────────────────── */}
      <section style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-20 lg:py-24">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8" style={{ background: '#7A5C1E' }} />
            <span className="text-[0.63rem] font-medium tracking-[0.18em] uppercase" style={{ color: '#7A5C1E' }}>
              Doctrine &amp; Practice
            </span>
          </div>
          <h2
            className="mb-12 leading-tight"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
              fontWeight: 400,
              color: '#F9F6F0',
            }}
          >
            What Austin Believes &amp; How He Serves
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                href: '/about/beliefs',
                tag: 'Statement of Faith',
                title: "Austin's Beliefs",
                desc: 'A full statement of faith across Scripture, God, Christ, the Spirit, salvation, the church, and last things.',
              },
              {
                href: '/about/values',
                tag: 'Ministry Values',
                title: "Austin's Values",
                desc: 'Eight commitments that shape the way Austin approaches preaching, leadership, and pastoral care.',
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col justify-between p-8 lg:p-10 border transition-colors duration-200 hover:border-[#B8892E]"
                style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#1A1714', minHeight: 200 }}
              >
                <div>
                  <div className="text-[0.6rem] font-medium tracking-[0.18em] uppercase mb-5" style={{ color: '#7A5C1E' }}>
                    {card.tag}
                  </div>
                  <h3
                    className="leading-tight"
                    style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem, 2.5vw, 2.4rem)', fontWeight: 400, color: '#F9F6F0' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="mt-3 text-[0.87rem] leading-relaxed"
                    style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(249,246,240,0.38)' }}
                  >
                    {card.desc}
                  </p>
                </div>
                <div
                  className="mt-8 flex items-center gap-2 text-[0.75rem] tracking-[0.06em] transition-colors group-hover:text-[#C9984A]"
                  style={{ color: '#7A5C1E' }}
                >
                  Read
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/about/faq"
              className="text-[0.78rem] tracking-[0.06em] transition-colors hover:text-[#B8892E]"
              style={{ color: 'rgba(255,255,255,0.22)' }}
            >
              Frequently Asked Questions →
            </Link>
          </div>
        </div>
      </section>

      {/* ── AFFILIATIONS ──────────────────────────────────────────────────── */}
      <section style={{ background: '#F5F2EB' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-14 lg:py-16">
          <p
            className="text-[0.62rem] font-medium tracking-[0.18em] uppercase mb-8 text-center"
            style={{ color: '#9A9189' }}
          >
            Affiliated with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-14">
            {LOGOS.map((l) => (
              <Image
                key={l.src}
                src={l.src}
                alt={l.alt}
                width={140}
                height={48}
                className="h-9 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/about/disclosure"
              className="text-[0.74rem] tracking-[0.06em] transition-colors hover:text-[#7A5C1E]"
              style={{ color: '#B0A898' }}
            >
              Affiliation Disclosure →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
