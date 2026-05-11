import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  getAll,
  sortByDate,
  type SermonFrontmatter,
  type ArticleFrontmatter,
} from '@/lib/content'
import TeachingCarousel from '@/components/teaching-carousel'
import HeroSection from '@/components/hero-section'

export const metadata: Metadata = {
  title: 'Austin W. Duncan',
  description:
    'Pastor, teacher, and theologian — sermons, biblical teaching, scholarly articles, and cultural commentary.',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
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

// ─── UI helpers ──────────────────────────────────────────────────────────────

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
  // ── Fetch all content ──────────────────────────────────────────────────────
  const allSermons    = sortByDate(getAll<SermonFrontmatter>('sermons'))
  const allWfw        = sortByDate(getAll<ArticleFrontmatter>('word-for-word'))
  const allExegetica  = sortByDate(getAll<ArticleFrontmatter>('exegetica'))
  const allForum      = sortByDate(getAll<ArticleFrontmatter>('forum-and-pulpit'))

  // ── Hero: most recent sermon ───────────────────────────────────────────────
  const featuredSermon = allSermons[0]
  const heroFeatured = featuredSermon
    ? {
        category: featuredSermon.frontmatter.tags?.[0] ?? 'Sermon',
        title:    featuredSermon.frontmatter.title,
        excerpt:  cleanExcerpt(featuredSermon.frontmatter.excerpt),
        href:     `/sermons/${featuredSermon.slug}`,
        date:     formatDate(featuredSermon.frontmatter.date),
        image:    featuredSermon.frontmatter.image || undefined,
      }
    : null

  // ── Hero sidebar: most recent from wfw, forum, exegetica ──────────────────
  const heroPicks = [
    allWfw[0] && {
      category: allWfw[0].frontmatter.tags?.[0] ?? 'Word for Word',
      title:    allWfw[0].frontmatter.title,
      href:     `/word-for-word/${allWfw[0].slug}`,
      date:     formatDate(allWfw[0].frontmatter.date),
    },
    allForum[0] && {
      category: allForum[0].frontmatter.tags?.[0] ?? 'Forum & Pulpit',
      title:    allForum[0].frontmatter.title,
      href:     `/forum-and-pulpit/${allForum[0].slug}`,
      date:     formatDate(allForum[0].frontmatter.date),
    },
    allExegetica[0] && {
      category: allExegetica[0].frontmatter.tags?.[0] ?? 'Exegetica',
      title:    allExegetica[0].frontmatter.title,
      href:     `/exegetica/${allExegetica[0].slug}`,
      date:     formatDate(allExegetica[0].frontmatter.date),
    },
  ].filter(Boolean).slice(0, 3) as { category: string; title: string; href: string; date: string }[]

  // ── Section grids: 3 most recent each ─────────────────────────────────────
  const sermonCards: CardItem[] = allSermons.slice(0, 3).map(({ frontmatter: fm, slug }) => ({
    category: fm.tags?.[0] ?? 'Sermon',
    title:    fm.title,
    excerpt:  cleanExcerpt(fm.excerpt),
    href:     `/sermons/${slug}`,
    date:     formatDate(fm.date),
    image:    fm.image || undefined,
  }))

  const wfwCards: CardItem[] = allWfw.slice(0, 3).map(({ frontmatter: fm, slug }) => ({
    category: fm.tags?.[0] ?? 'Word for Word',
    title:    fm.title,
    excerpt:  cleanExcerpt(fm.excerpt),
    href:     `/word-for-word/${slug}`,
    date:     formatDate(fm.date),
    image:    fm.image || undefined,
  }))

  const exegeticaCards: CardItem[] = allExegetica.slice(0, 3).map(({ frontmatter: fm, slug }) => ({
    category: fm.tags?.[0] ?? 'Exegetica',
    title:    fm.title,
    excerpt:  cleanExcerpt(fm.excerpt),
    href:     `/exegetica/${slug}`,
    date:     formatDate(fm.date),
    image:    fm.image || undefined,
  }))

  const forumCards: CardItem[] = allForum.slice(0, 3).map(({ frontmatter: fm, slug }) => ({
    category: fm.tags?.[0] ?? 'Forum & Pulpit',
    title:    fm.title,
    excerpt:  cleanExcerpt(fm.excerpt),
    href:     `/forum-and-pulpit/${slug}`,
    date:     formatDate(fm.date),
    image:    fm.image || undefined,
  }))

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      {heroFeatured && (
        <HeroSection featured={heroFeatured} picks={heroPicks} />
      )}

      {/* ── Sermons ─────────────────────────────────────────────────────────── */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader title="Sermons" href="/sermons" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {sermonCards.map((item) => (
              <ArticleCard key={item.href} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Teaching ────────────────────────────────────────────────────────── */}
      <section className="section-pattern border-t border-zinc-100 bg-zinc-50 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader title="Teaching" href="/teaching" />
          <TeachingCarousel />
        </div>
      </section>

      {/* ── Word for Word ───────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-100 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader title="Word for Word" href="/word-for-word" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {wfwCards.map((item) => (
              <ArticleCard key={item.href} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Exegetica ───────────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader title="Exegetica" href="/exegetica" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {exegeticaCards.map((item) => (
              <ArticleCard key={item.href} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Forum & Pulpit ──────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-100 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader title="Forum & Pulpit" href="/forum-and-pulpit" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {forumCards.map((item) => (
              <ArticleCard key={item.href} item={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
