import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Greeting from '@/components/greeting'

export const metadata: Metadata = {
  title: 'Austin W. Duncan',
  description:
    'Pastor, teacher, and theologian — sermons, biblical teaching, scholarly articles, and cultural commentary.',
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Article = {
  category: string
  title: string
  excerpt: string
  scripture?: string
  href: string
  date: string
}

// ─── Placeholder content — replace with CMS data ─────────────────────────────

const heroFeatured = {
  category: 'Sermon',
  reference: 'Genesis 16',
  title: 'The God Who Sees You in the Wilderness',
  excerpt:
    'In one of the most overlooked passages in Genesis, God reveals himself as the one who meets the outcast in her desperation — a message on Hagar, grace, and the name El Roi.',
  href: '/sermons/genesis-16',
  date: 'May 11, 2025',
}

const heroPicks = [
  {
    category: 'Teaching',
    title: 'The Letter to the Romans: A Book-by-Book Study',
    href: '/teaching/expositional/romans',
    date: 'Ongoing Series',
  },
  {
    category: 'Word for Word',
    title: 'If God Is Good, Why Does Evil Exist?',
    href: '/word-for-word/problem-of-evil',
    date: 'Apr 28, 2025',
  },
  {
    category: 'Forum & Pulpit',
    title: 'What Does the Church Owe the Public Square?',
    href: '/forum-and-pulpit/church-public-square',
    date: 'Apr 14, 2025',
  },
]

const sermons: Article[] = [
  {
    category: 'Genesis',
    title: 'The God Who Sees You in the Wilderness',
    excerpt: 'A message on Hagar, grace, and the name El Roi.',
    scripture: 'Genesis 16:1–16',
    href: '/sermons/genesis-16',
    date: 'May 11, 2025',
  },
  {
    category: 'Genesis',
    title: 'The Promise and the Wait',
    excerpt:
      "Abraham's faith was tested not in a moment but across decades. What do we do while we wait?",
    scripture: 'Genesis 15:1–21',
    href: '/sermons/genesis-15',
    date: 'May 4, 2025',
  },
  {
    category: 'Genesis',
    title: 'A New Name for a New Man',
    excerpt:
      "When God changes Abram's name, he is declaring a future that hasn't happened yet.",
    scripture: 'Genesis 17:1–8',
    href: '/sermons/genesis-17',
    date: 'Apr 27, 2025',
  },
]

const teachingFeatured: Article = {
  category: 'Expositional',
  title: 'The Letter to the Romans',
  excerpt:
    "A verse-by-verse walk through Paul's definitive statement of the gospel — from the wrath of God through justification by faith to the doxology of chapters 9–11 and the renewed ethics of 12–16. This series is currently in progress.",
  href: '/teaching/expositional/romans',
  date: 'Ongoing',
}

const teachingOther: Article[] = [
  {
    category: 'Topical',
    title: 'The Doctrines of Grace',
    excerpt: 'Five sessions on the TULIP: what the Reformation recovered, and why it still matters.',
    href: '/teaching/topical/doctrines-of-grace',
    date: '12 parts',
  },
  {
    category: 'Expositional',
    title: 'A Walk through Philippians',
    excerpt: "Paul's letter of joy from a Roman prison cell.",
    href: '/teaching/expositional/philippians',
    date: '8 parts',
  },
  {
    category: 'Topical',
    title: 'What Is the Church?',
    excerpt: 'An ecclesiology series for the local congregation.',
    href: '/teaching/topical/ecclesiology',
    date: '6 parts',
  },
]

const wordForWord: Article[] = [
  {
    category: 'Theodicy',
    title: 'If God Is Good, Why Does Evil Exist?',
    excerpt: "The problem of evil is real — and Scripture doesn't paper over it.",
    href: '/word-for-word/problem-of-evil',
    date: 'Apr 28, 2025',
  },
  {
    category: 'Bible',
    title: 'Can We Trust the Bible?',
    excerpt:
      "A look at the historical, manuscript, and theological case for Scripture's reliability.",
    href: '/word-for-word/can-we-trust-the-bible',
    date: 'Apr 7, 2025',
  },
  {
    category: 'Prayer',
    title: 'Does God Really Answer Prayer?',
    excerpt: 'What the New Testament teaches about a question every believer asks.',
    href: '/word-for-word/does-god-answer-prayer',
    date: 'Mar 17, 2025',
  },
]

const exegetica: Article[] = [
  {
    category: 'Pauline Studies',
    title: 'The Syntactic Function of ἐν Χριστῷ in the Pauline Corpus',
    excerpt:
      'An analysis of the instrumental and locative uses of the phrase across the undisputed letters.',
    href: '/exegetica/en-christo',
    date: 'March 2025',
  },
  {
    category: 'Old Testament',
    title: 'Hesed and Covenant Faithfulness in the Psalter',
    excerpt: 'Tracing the semantic range of חֶסֶד through the five books of Psalms.',
    href: '/exegetica/hesed-psalter',
    date: 'January 2025',
  },
  {
    category: 'Hermeneutics',
    title: 'Typology, Allegory, and the Plain Sense of Scripture',
    excerpt:
      'How the church fathers read the Old Testament — and what we can and cannot learn from them.',
    href: '/exegetica/typology-allegory',
    date: 'November 2024',
  },
]

const forumPulpit: Article[] = [
  {
    category: 'Church & Culture',
    title: 'What Does the Church Owe the Public Square?',
    excerpt:
      'A reflection on prophetic witness, political entanglement, and the limits of institutional religion.',
    href: '/forum-and-pulpit/church-public-square',
    date: 'Apr 14, 2025',
  },
  {
    category: 'Technology',
    title: 'The Slow Death of Attention and the Discipline of Reading',
    excerpt:
      'Digital distraction is not merely a productivity problem — it is a formation problem.',
    href: '/forum-and-pulpit/attention-reading',
    date: 'Mar 31, 2025',
  },
  {
    category: 'Sexuality',
    title: 'The Bible, Sexual Ethics, and Pastoral Compassion',
    excerpt:
      'How to hold conviction and tenderness together in a church that is actually full of people.',
    href: '/forum-and-pulpit/sexual-ethics-pastoral',
    date: 'Feb 19, 2025',
  },
]

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function CategoryLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[10px] font-semibold tracking-[0.14em] uppercase"
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
      <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-zinc-900">
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

function ArticleCard({ item }: { item: Article }) {
  return (
    <article className="group border-t border-zinc-200 pt-5">
      <Link href={item.href} className="block">
        <div className="space-y-2">
          <CategoryLabel>{item.category}</CategoryLabel>
          {item.scripture && (
            <p className="text-[10px] text-zinc-400 tracking-wide">{item.scripture}</p>
          )}
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-zinc-900 group-hover:text-zinc-500 transition-colors">
            {item.title}
          </h3>
          <p className="text-[13px] text-zinc-500 leading-relaxed line-clamp-3">{item.excerpt}</p>
          <p className="text-[11px] text-zinc-400 pt-1">{item.date}</p>
        </div>
      </Link>
    </article>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="grid lg:grid-cols-[1fr_340px] border-b border-zinc-200">
        {/* Featured item */}
        <div className="bg-zinc-950 px-8 py-12 lg:px-14 lg:py-16 flex flex-col justify-between min-h-[460px]">
          <div>
            <Greeting />
            <div className="flex items-center gap-2 mt-5">
              <CategoryLabel>{heroFeatured.category}</CategoryLabel>
              <span className="text-zinc-700 text-xs">·</span>
              <span className="text-[10px] text-zinc-500 tracking-wide">
                {heroFeatured.reference}
              </span>
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-white leading-[1.06] tracking-tight max-w-xl">
              {heroFeatured.title}
            </h1>
            <p className="mt-5 text-[15px] text-zinc-400 leading-relaxed max-w-lg font-light">
              {heroFeatured.excerpt}
            </p>
          </div>
          <div className="mt-10 flex items-center gap-6">
            <Link
              href={heroFeatured.href}
              className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wide hover:opacity-75 transition-opacity"
              style={{ color: '#cdb079' }}
            >
              Listen Now <ArrowRight size={13} />
            </Link>
            <span className="text-zinc-600 text-[12px]">{heroFeatured.date}</span>
          </div>
        </div>

        {/* Secondary picks */}
        <div className="bg-white border-t-4 lg:border-t-0 lg:border-l border-zinc-200 px-8 py-10 flex flex-col"
          style={{ borderTopColor: '#cdb079' }}
        >
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-7">
            Also —
          </p>
          <div className="flex flex-col flex-1 divide-y divide-zinc-100">
            {heroPicks.map((pick) => (
              <Link key={pick.href} href={pick.href} className="group py-5 first:pt-0 last:pb-0">
                <CategoryLabel>{pick.category}</CategoryLabel>
                <h3 className="mt-2 text-[14px] font-semibold leading-snug text-zinc-800 group-hover:text-zinc-500 transition-colors">
                  {pick.title}
                </h3>
                <p className="mt-2 text-[11px] text-zinc-400">{pick.date}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sermons ─────────────────────────────────────────────────────────── */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader title="Sermons" href="/sermons" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {sermons.map((item) => (
              <ArticleCard key={item.href} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Teaching ────────────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader title="Teaching" href="/teaching" />
          <div className="grid lg:grid-cols-[1fr_240px] gap-10 lg:gap-14 xl:gap-20">
            {/* Featured series */}
            <article className="group bg-white border border-zinc-200 p-8 lg:p-10">
              <CategoryLabel>{teachingFeatured.category}</CategoryLabel>
              <h3 className="mt-3 text-2xl lg:text-[1.6rem] font-bold leading-tight tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors">
                {teachingFeatured.title}
              </h3>
              <p className="mt-4 text-[14px] text-zinc-500 leading-relaxed">
                {teachingFeatured.excerpt}
              </p>
              <Link
                href={teachingFeatured.href}
                className="mt-7 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase hover:opacity-75 transition-opacity"
                style={{ color: '#cdb079' }}
              >
                Continue Series <ArrowRight size={11} />
              </Link>
            </article>

            {/* Other series */}
            <div className="divide-y divide-zinc-100">
              {teachingOther.map((item) => (
                <Link key={item.href} href={item.href} className="group block py-5 first:pt-0">
                  <CategoryLabel>{item.category}</CategoryLabel>
                  <h4 className="mt-1.5 text-[14px] font-semibold leading-snug text-zinc-800 group-hover:text-zinc-500 transition-colors">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-zinc-400">{item.date}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Word for Word ───────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-100 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader title="Word for Word" href="/word-for-word" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {wordForWord.map((item) => (
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
            {exegetica.map((item) => (
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
            {forumPulpit.map((item) => (
              <ArticleCard key={item.href} item={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
