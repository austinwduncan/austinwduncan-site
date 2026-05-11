import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Mic,
  BookOpen,
  MessageCircle,
  Scroll,
  Globe,
  Library,
  ArrowRight,
} from 'lucide-react'
import Greeting from '@/components/greeting'

export const metadata: Metadata = {
  title: 'Austin W. Duncan',
  description:
    'Pastor, teacher, and theologian — sermons, biblical teaching, scholarly articles, and cultural commentary.',
}

const sections = [
  {
    href: '/sermons',
    icon: Mic,
    title: 'Sermons',
    description: 'Weekly expository messages from Sunday worship.',
  },
  {
    href: '/teaching',
    icon: BookOpen,
    title: 'Teaching',
    description: 'Multi-part series: expositional book studies and topical surveys.',
  },
  {
    href: '/word-for-word',
    icon: MessageCircle,
    title: 'Word for Word',
    description: 'Honest answers to honest questions about Christianity.',
  },
  {
    href: '/exegetica',
    icon: Scroll,
    title: 'Exegetica',
    description: 'Scholarly biblical articles engaging the text in its original languages.',
  },
  {
    href: '/forum-and-pulpit',
    icon: Globe,
    title: 'Forum & Pulpit',
    description: 'Cultural commentary and current events through a biblical lens.',
  },
  {
    href: '/resources',
    icon: Library,
    title: 'Resources',
    description: 'Carefully curated book recommendations by category.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[82vh] flex-col justify-center px-6 lg:px-8">
        {/* Subtle gold rule — left edge accent */}
        <div
          className="absolute left-0 top-0 h-full w-px opacity-20"
          style={{ background: 'linear-gradient(to bottom, transparent, #cdb079 30%, #cdb079 70%, transparent)' }}
        />

        <div className="mx-auto w-full max-w-4xl">
          <Greeting />

          <h1 className="mt-4 text-[3.25rem] leading-[1.08] tracking-[-0.03em] font-light text-zinc-900 sm:text-7xl lg:text-8xl">
            Austin W.
            <br />
            Duncan
          </h1>

          <p className="mt-5 text-base text-zinc-500 tracking-wide uppercase text-sm font-light">
            Pastor &nbsp;·&nbsp; Teacher &nbsp;·&nbsp; Theologian
          </p>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-600 font-light">
            Committed to the faithful exposition of Scripture — in the pulpit, the classroom,
            and on the page.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/sermons"
              className="inline-flex items-center gap-2 rounded-none border px-6 py-3 text-sm font-light tracking-wide transition-colors hover:bg-zinc-950 hover:text-white"
              style={{ borderColor: '#cdb079', color: '#cdb079' }}
            >
              Latest Sermons
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-none border border-zinc-200 px-6 py-3 text-sm font-light tracking-wide text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
            >
              About Austin
            </Link>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div
          className="absolute bottom-0 left-6 right-6 lg:left-8 lg:right-8 h-px opacity-30"
          style={{ backgroundColor: '#cdb079' }}
        />
      </section>

      {/* Sections grid */}
      <section className="px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-400 mb-12">
            Explore
          </h2>

          <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3 bg-zinc-100">
            {sections.map(({ href, icon: Icon, title, description }) => (
              <Link
                key={href}
                href={href}
                className="group bg-white p-8 transition-colors hover:bg-zinc-50"
              >
                <Icon
                  size={18}
                  className="mb-5 transition-colors"
                  style={{ color: '#cdb079' }}
                />
                <h3 className="text-base font-medium text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 font-light">
                  {description}
                </p>
                <span
                  className="mt-6 inline-flex items-center gap-1.5 text-xs tracking-wide uppercase font-light transition-colors group-hover:gap-2.5"
                  style={{ color: '#cdb079' }}
                >
                  Browse
                  <ArrowRight size={11} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
