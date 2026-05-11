'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home', exact: true },
  { href: '/sermons', label: 'Sermons' },
  {
    href: '/teaching',
    label: 'Teaching',
    children: [
      { href: '/teaching/expositional', label: 'Expositional' },
      { href: '/teaching/topical', label: 'Topical' },
    ],
  },
  { href: '/word-for-word', label: 'Word for Word' },
  { href: '/exegetica', label: 'Exegetica' },
  { href: '/forum-and-pulpit', label: 'Forum & Pulpit' },
  { href: '/resources', label: 'Resources' },
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

  return (
    <header className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800">
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
                        active ? 'text-[#cdb079]' : 'text-white/75 hover:text-[#cdb079]'
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
                        <div className="bg-zinc-900 border border-zinc-700 py-1 min-w-[164px] shadow-xl">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-4 py-2.5 text-[13px] transition-colors ${
                                isActive(pathname, child.href)
                                  ? 'text-[#cdb079]'
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
                    active ? 'text-[#cdb079]' : 'text-white/75 hover:text-[#cdb079]'
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
        <div className="lg:hidden border-t border-zinc-800 bg-zinc-950 px-6 py-5">
          <nav className="flex flex-col">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href, link.exact)
              if (link.children) {
                return (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      className={`block py-2.5 text-[14px] transition-colors ${
                        active ? 'text-[#cdb079]' : 'text-zinc-300 hover:text-white'
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
                              ? 'text-[#cdb079]'
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
                    active ? 'text-[#cdb079]' : 'text-zinc-300 hover:text-white'
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
