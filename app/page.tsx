import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  getAll,
  getAllTeaching,
  sortByDate,
  isPublished,
  primaryBookFromScripture,
  type SermonFrontmatter,
  type ArticleFrontmatter,
  type TeachingFrontmatter,
} from '@/lib/content'
import AnimatedHero, { type HeroSlide } from '@/components/animated-hero'
import ScrollReveal from '@/components/scroll-reveal'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Austin W. Duncan',
  description:
    'Pastor, teacher, and theologian — sermons, biblical teaching, scholarly articles, and cultural commentary.',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

function cleanExcerpt(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\\([_*[\]])/g, '$1')
    .trim()
}

// ─── Types ───────────────────────────────────────────────────────────────────

type CardItem = {
  category: string
  title: string
  excerpt: string
  href: string
  date: string
  image?: string
}

// ─── UI components ───────────────────────────────────────────────────────────

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

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div
      className="flex items-center gap-3 mb-10 pb-3"
      style={{ borderBottom: '2px solid #cdb079' }}
    >
      <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">
        {title}
      </span>
      <div className="flex-1" />
      <Link
        href={href}
        className="flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors"
      >
        See All <ArrowRight size={10} />
      </Link>
    </div>
  )
}

function ArticleCard({ item }: { item: CardItem }) {
  return (
    <article className="group border-t border-zinc-200 pt-5">
      <Link href={item.href} className="block">
        {item.image && (
          <div className="mb-4 overflow-hidden bg-zinc-100 aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
        )}
        <div className="space-y-2">
          <CategoryLabel>{item.category}</CategoryLabel>
          <h3 className="text-[16px] font-semibold leading-snug tracking-tight text-zinc-900 group-hover:text-zinc-500 transition-colors">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="text-[14px] text-zinc-500 leading-relaxed line-clamp-3">{item.excerpt}</p>
          )}
          <p className="text-[12px] text-zinc-400 pt-1">{item.date}</p>
        </div>
      </Link>
    </article>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const allSermons   = sortByDate(getAll<SermonFrontmatter>('sermons').filter(a => isPublished(a.frontmatter.date)))
  const allWfw       = sortByDate(getAll<ArticleFrontmatter>('word-for-word').filter(a => isPublished(a.frontmatter.date)))
  const allExegetica = sortByDate(getAll<ArticleFrontmatter>('exegetica').filter(a => isPublished(a.frontmatter.date)))
  const allForum     = sortByDate(getAll<ArticleFrontmatter>('forum-and-pulpit').filter(a => isPublished(a.frontmatter.date)))

  // Teaching: combine both types with routing info
  const allTeachingRaw = sortByDate([
    ...getAllTeaching<TeachingFrontmatter>('expositional')
      .filter(a => isPublished(a.frontmatter.date))
      .map(a => ({ ...a, teachingType: 'expositional' as const })),
    ...getAllTeaching<TeachingFrontmatter>('topical')
      .filter(a => isPublished(a.frontmatter.date))
      .map(a => ({ ...a, teachingType: 'topical' as const })),
  ])

  // Build series for teaching section (grouped by last tag)
  const seriesMap = new Map<string, { image?: string; count: number; slug: string; type: 'expositional' | 'topical' }>()
  for (const { frontmatter: fm, slug, teachingType } of allTeachingRaw) {
    const series = fm.tags?.[fm.tags.length - 1] ?? 'Teaching'
    if (!seriesMap.has(series)) {
      seriesMap.set(series, { image: fm.image, count: 0, slug, type: teachingType })
    }
    seriesMap.get(series)!.count++
    if (fm.image && !seriesMap.get(series)!.image) seriesMap.get(series)!.image = fm.image
  }

  const teachingCards: CardItem[] = [...seriesMap.entries()].slice(0, 3).map(([series, v]) => ({
    category: v.type === 'expositional' ? 'Expositional' : 'Topical',
    title: series,
    excerpt: '',
    href: `/teaching/${v.type}/${v.slug}`,
    date: `${v.count} session${v.count !== 1 ? 's' : ''}`,
    image: v.image,
  }))

  // ── Hero slides ─────────────────────────────────────────────────────────────
  const heroSlides: HeroSlide[] = [
    allSermons[0] ? {
      section: 'Sermons',
      title: allSermons[0].frontmatter.title,
      excerpt: cleanExcerpt(allSermons[0].frontmatter.excerpt),
      href: `/sermons/${allSermons[0].slug}`,
      date: formatDate(allSermons[0].frontmatter.date),
      cta: 'Listen Now',
      image: allSermons[0].frontmatter.image || undefined,
    } : null,
    allWfw[0] ? {
      section: 'Word for Word',
      title: allWfw[0].frontmatter.title,
      excerpt: cleanExcerpt(allWfw[0].frontmatter.excerpt),
      href: `/word-for-word/${allWfw[0].slug}`,
      date: formatDate(allWfw[0].frontmatter.date),
      cta: 'Read Article',
      image: allWfw[0].frontmatter.image || undefined,
    } : null,
    allTeachingRaw[0] ? {
      section: 'Teaching',
      title: allTeachingRaw[0].frontmatter.title,
      excerpt: cleanExcerpt(allTeachingRaw[0].frontmatter.excerpt ?? ''),
      href: `/teaching/${allTeachingRaw[0].teachingType}/${allTeachingRaw[0].slug}`,
      date: formatDate(allTeachingRaw[0].frontmatter.date),
      cta: 'Begin Session',
      image: allTeachingRaw[0].frontmatter.image || undefined,
    } : null,
    allExegetica[0] ? {
      section: 'Exegetica',
      title: allExegetica[0].frontmatter.title,
      excerpt: cleanExcerpt(allExegetica[0].frontmatter.excerpt),
      href: `/exegetica/${allExegetica[0].slug}`,
      date: formatDate(allExegetica[0].frontmatter.date),
      cta: 'Read Article',
      image: allExegetica[0].frontmatter.image || undefined,
    } : null,
    allForum[0] ? {
      section: 'Forum & Pulpit',
      title: allForum[0].frontmatter.title,
      excerpt: cleanExcerpt(allForum[0].frontmatter.excerpt),
      href: `/forum-and-pulpit/${allForum[0].slug}`,
      date: formatDate(allForum[0].frontmatter.date),
      cta: 'Read Article',
      image: allForum[0].frontmatter.image || undefined,
    } : null,
  ].filter(Boolean) as HeroSlide[]

  // ── Section cards ────────────────────────────────────────────────────────────
  const sermonCards: CardItem[] = allSermons.slice(0, 3).map(({ frontmatter: fm, slug }) => ({
    category: primaryBookFromScripture(fm.scripture) ?? 'Sermon',
    title: fm.title,
    excerpt: cleanExcerpt(fm.excerpt),
    href: `/sermons/${slug}`,
    date: formatDate(fm.date),
    image: fm.image || undefined,
  }))

  const wfwCards: CardItem[] = allWfw.slice(0, 3).map(({ frontmatter: fm, slug }) => ({
    category: fm.tags?.[0] ?? 'Word for Word',
    title: fm.title,
    excerpt: cleanExcerpt(fm.excerpt),
    href: `/word-for-word/${slug}`,
    date: formatDate(fm.date),
    image: fm.image || undefined,
  }))

  const exegeticaCards: CardItem[] = allExegetica.slice(0, 3).map(({ frontmatter: fm, slug }) => ({
    category: fm.tags?.[0] ?? 'Exegetica',
    title: fm.title,
    excerpt: cleanExcerpt(fm.excerpt),
    href: `/exegetica/${slug}`,
    date: formatDate(fm.date),
    image: fm.image || undefined,
  }))

  const forumCards: CardItem[] = allForum.slice(0, 3).map(({ frontmatter: fm, slug }) => ({
    category: fm.tags?.[0] ?? 'Forum & Pulpit',
    title: fm.title,
    excerpt: cleanExcerpt(fm.excerpt),
    href: `/forum-and-pulpit/${slug}`,
    date: formatDate(fm.date),
    image: fm.image || undefined,
  }))

  return (
    <>
      {/* ── Animated hero ───────────────────────────────────────────────────── */}
      {heroSlides.length > 0 && <AnimatedHero slides={heroSlides} />}

      {/* ── Sermons ─────────────────────────────────────────────────────────── */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader title="Sermons" href="/sermons" />
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {sermonCards.map((item) => <ArticleCard key={item.href} item={item} />)}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Teaching ────────────────────────────────────────────────────────── */}
      <section className="section-pattern border-t border-zinc-100 bg-zinc-50 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader title="Teaching" href="/teaching" />
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {teachingCards.map((item) => <ArticleCard key={item.href} item={item} />)}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Word for Word ───────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-100 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader title="Word for Word" href="/word-for-word" />
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {wfwCards.map((item) => <ArticleCard key={item.href} item={item} />)}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Exegetica ───────────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader title="Exegetica" href="/exegetica" />
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {exegeticaCards.map((item) => <ArticleCard key={item.href} item={item} />)}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Forum & Pulpit ──────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-100 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <SectionHeader title="Forum & Pulpit" href="/forum-and-pulpit" />
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {forumCards.map((item) => <ArticleCard key={item.href} item={item} />)}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
