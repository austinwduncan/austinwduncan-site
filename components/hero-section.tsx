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

// Art-deco diamond lattice: outer diamond + concentric inner diamond +
// ornamental dots at vertices and corners. Gold on dark, tiles at 60×60px.
const DECO_PATTERN = "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23cdb079' stroke-width='0.9'/%3E%3Cpath d='M30 13L47 30L30 47L13 30Z' fill='none' stroke='%23cdb079' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='0' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='60' cy='30' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='30' cy='60' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='0' cy='30' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='60' cy='0' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='60' cy='60' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='0' cy='60' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='30' cy='30' r='1.2' fill='%23cdb079'/%3E%3C/svg%3E"

export default function HeroSection({ featured, picks }: Props) {
  return (
    <section className="border-b border-zinc-200">
      <div className="grid lg:grid-cols-[1fr_340px]">

        {/* Featured panel */}
        <div className="relative flex flex-col justify-between min-h-[460px] overflow-hidden">

          {/* Background: dark + art-deco pattern + subtle gold glow */}
          <div className="absolute inset-0 bg-zinc-950">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("${DECO_PATTERN}")`,
                backgroundSize: '60px 60px',
                opacity: 0.18,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 28% 55%, rgba(205,176,121,0.07) 0%, transparent 60%)',
              }}
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
