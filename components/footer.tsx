import Link from 'next/link'

const sections = [
  {
    heading: 'Content',
    links: [
      { href: '/sermons', label: 'Sermons' },
      { href: '/teaching', label: 'Teaching' },
      { href: '/word-for-word', label: 'Word for Word' },
      { href: '/exegetica', label: 'Exegetica' },
    ],
  },
  {
    heading: 'More',
    links: [
      { href: '/forum-and-pulpit', label: 'Forum & Pulpit' },
      { href: '/resources', label: 'Resources' },
      { href: '/about', label: 'About' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1fr_auto_auto]">

          {/* Brand column */}
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center hover:opacity-70 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/AWDLogoWhite.svg"
                alt="Austin W. Duncan"
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              Pastor, teacher, and theologian — committed to faithful exposition of Scripture.
            </p>
          </div>

          {/* Nav columns */}
          {sections.map((section) => (
            <div key={section.heading}>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-600 mb-4">
                {section.heading}
              </p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} Austin W. Duncan. All rights reserved.
          </p>
          <div className="w-6 h-px" style={{ backgroundColor: '#cdb079', opacity: 0.5 }} />
        </div>
      </div>
    </footer>
  )
}
