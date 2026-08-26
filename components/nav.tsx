'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'

/*
  "In the Text" is a display label only: the routes stay /teaching/... on
  purpose, so none of the ~220 published URLs move and nothing needs redirecting.
*/
type NavLink = {
  href: string
  label: string
  exact?: boolean
  children?: { href: string; label: string }[]
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Home', exact: true },
  { href: '/browse', label: 'Browse' },
  { href: '/sermons', label: 'Sermons' },
  {
    href: '/teaching',
    label: 'In the Text',
    children: [
      { href: '/teaching/expositional', label: 'Expositional' },
      { href: '/teaching/topical', label: 'Topical' },
    ],
  },
  { href: '/word-for-word', label: 'Word for Word' },
  { href: '/exegetica', label: 'Exegetica' },
  { href: '/forum-and-pulpit', label: 'Forum & Pulpit' },
  { href: '/library', label: 'Library' },
  { href: '/about', label: 'About' },
]

function isActive(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + '/')
}

export default function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [teachingOpen, setTeachingOpen] = useState(false)

  /*
    The header is transparent while the page is at the top so the hero photo
    runs clean to the edge, then the glass bar drops in on first scroll and
    stays until you return to the top. Passive listener, and it primes itself
    on mount so a mid-page reload does not start transparent over content.
  */
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The mobile panel needs a readable ground even at the top of the page.
  const solid = scrolled || mobileOpen

  // Glass header, matching the Crosswalk recipe: a translucent near-black
  // ground plus backdrop-blur-md and a hairline white border. Browsers without
  // backdrop-filter simply get the near-solid colour, which still reads fine.
  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid ? 'border-white/10 backdrop-blur-md' : 'border-transparent'
      }`}
      style={{
        background: solid
          ? 'color-mix(in srgb, var(--awd-black) 88%, transparent)'
          : 'transparent',
      }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-[60px] items-center justify-between">

          {/* Logo + name */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-75 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/AWDLogoWhite.svg"
              alt="Austin W. Duncan"
              className="h-8 w-auto"
            />
            <span className="text-white font-semibold text-[15px] tracking-tight">
              Austin W. Duncan
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href, link.exact)

              if (link.children) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setTeachingOpen(true)}
                    onMouseLeave={() => setTeachingOpen(false)}
                  >
                    <button
                      className={`flex items-center gap-1 text-[14px] transition-colors ${
                        active ? 'text-gold' : 'text-white/75 hover:text-gold'
                      }`}
                    >
                      {link.label}
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-150 ${teachingOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {teachingOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                        <div className="border border-white/12 py-1 min-w-[164px] shadow-xl backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--awd-graphite) 92%, transparent)' }}>
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-4 py-2.5 text-[13px] transition-colors ${
                                isActive(pathname, child.href)
                                  ? 'text-gold'
                                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                              }`}
                              onClick={() => setTeachingOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[14px] transition-colors ${
                    active ? 'text-gold' : 'text-white/75 hover:text-gold'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-zinc-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 px-6 py-5 backdrop-blur-md">
          <nav className="flex flex-col">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href, link.exact)
              if (link.children) {
                return (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      className={`block py-2.5 text-[14px] transition-colors ${
                        active ? 'text-gold' : 'text-zinc-300 hover:text-white'
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                    <div className="ml-4 pl-4 border-l border-zinc-700 mb-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block py-2 text-[13px] transition-colors ${
                            isActive(pathname, child.href)
                              ? 'text-gold'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-2.5 text-[14px] transition-colors ${
                    active ? 'text-gold' : 'text-zinc-300 hover:text-white'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
