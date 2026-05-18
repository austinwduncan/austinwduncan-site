import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — Austin W. Duncan',
  description: 'Pastor, teacher, and student of Holy Scripture.',
}

export default function AboutPage() {
  return (
    <>
      <div style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-14">
          <div
            className="flex items-end justify-between gap-8 pb-10 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div>
              <div
                className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.12em] uppercase mb-3"
                style={{ color: '#B8892E' }}
              >
                <span className="inline-block h-px w-[18px]" style={{ background: '#B8892E' }} />
                About
              </div>
              <h1
                className="leading-[1.1] tracking-tight"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                  fontWeight: 400,
                  color: '#F9F6F0',
                }}
              >
                Austin W. Duncan
              </h1>
            </div>
            <p
              className="text-[0.92rem] italic max-w-[340px] text-right pb-0.5 leading-relaxed shrink-0"
              style={{
                fontFamily: 'var(--font-source-serif)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              Pastor. Teacher. Student of Holy Scripture.
            </p>
          </div>
        </div>
      </div>

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

      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="shrink-0 lg:w-[300px]">
              <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
                <Image
                  src="/images/Headshots/Austin Duncan Headshot.jpg"
                  alt="Austin W. Duncan"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 300px"
                  priority
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div
                className="space-y-5 text-[0.97rem] leading-[1.8]"
                style={{
                  fontFamily: 'var(--font-source-serif)',
                  color: '#1A1714',
                }}
              >
                <p>
                  Austin is the Associate Pastor of Crosswalk Church in Brentwood, TN. Crosswalk is dedicated to helping others find hope in Jesus Christ.
                </p>
                <p>
                  Austin, alongside his wonderful wife, Cassy, resides in the vibrant Middle Tennessee region. Together, they share a life enriched by faith, creativity, and a deep commitment to community.
                </p>
                <p>
                  With a heart firmly set on making a meaningful impact, Austin dedicates himself to multiple facets of outreach and ministry. His mission is to reach the lost locally, nationally, and internationally (Mark 16:15; Acts 1:8), care for those that are reached with intentionality (Acts 20:28), train others to be effective in their own ministries (Eph. 4:12), and to encourage other believers to action (Eph. 6:7).
                </p>
                <p>
                  Academically, Austin holds a Bachelor of Fine Arts in Studio Art (Digital Printmaking and Photography) from Texas Tech University, a Master of Arts in Design and Media Management from The Art Institute of Dallas, and an Advanced Master's Certification in Strategic Project Management from Villanova University. He is currently completing a Master of Divinity from Bethel Theological Seminary in St. Paul, Minnesota.
                </p>
              </div>

              <blockquote
                className="my-8 pl-5 text-[0.97rem] leading-[1.8] italic"
                style={{
                  fontFamily: 'var(--font-source-serif)',
                  color: '#5A544C',
                  borderLeft: '3px solid #B8892E',
                }}
              >
                "It's my desire that while in service to others, my life reflects a total reliance on God — so that others may find hope in Him."
              </blockquote>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/about/beliefs"
                  className="inline-flex items-center rounded border px-5 py-2.5 text-[0.8rem] font-medium tracking-[0.05em] transition-colors hover:bg-[#F2EFE7]"
                  style={{ borderColor: '#C8BFA8', color: '#7A5C1E' }}
                >
                  Austin's Beliefs
                </Link>
                <Link
                  href="/about/values"
                  className="inline-flex items-center rounded border px-5 py-2.5 text-[0.8rem] font-medium tracking-[0.05em] transition-colors hover:bg-[#F2EFE7]"
                  style={{ borderColor: '#C8BFA8', color: '#7A5C1E' }}
                >
                  Austin's Values
                </Link>
              </div>

              <div
                className="my-10 h-px w-full"
                style={{ background: '#E2DACE' }}
              />

              <div>
                <p
                  className="text-[0.75rem] font-medium tracking-[0.1em] uppercase mb-6"
                  style={{ color: '#9A9189' }}
                >
                  Austin is affiliated with the following:
                </p>
                <div className="flex flex-wrap items-center gap-8">
                  <Image
                    src="/images/Logos/cwc-full-logo-dark-color.png"
                    alt="Crosswalk Church"
                    width={140}
                    height={48}
                    className="h-10 w-auto object-contain"
                  />
                  <Image
                    src="/images/Logos/affiliation-symbis.png"
                    alt="SYMBIS Assessment"
                    width={120}
                    height={48}
                    className="h-10 w-auto object-contain"
                  />
                  <Image
                    src="/images/Logos/affiliation-dailykairos.png"
                    alt="Daily Kairos"
                    width={120}
                    height={48}
                    className="h-10 w-auto object-contain"
                  />
                  <Image
                    src="/images/Logos/affiliation-logos.png"
                    alt="Logos Bible Software"
                    width={120}
                    height={48}
                    className="h-10 w-auto object-contain"
                  />
                  <Image
                    src="/images/Logos/affiliate-seekjesus.png"
                    alt="Seek Jesus"
                    width={120}
                    height={48}
                    className="h-10 w-auto object-contain"
                  />
                </div>

                <div className="mt-5">
                  <Link
                    href="/about/disclosure"
                    className="text-[0.78rem] transition-colors hover:text-[#7A5C1E]"
                    style={{ color: '#9A9189' }}
                  >
                    Affiliation Disclosure →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
