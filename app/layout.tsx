import type { Metadata } from 'next'
import { Bebas_Neue, Geist, Geist_Mono, Montserrat } from 'next/font/google'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Nav from '@/components/nav'
import Footer from '@/components/footer'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

/*
  CMG Sans. The church's licensed "CMG Sans" is Montserrat with a renamed name
  table (designer Julieta Ulanovsky, SIL Open Font License), confirmed by
  reading the woff2 name records. Loading Montserrat from Google gives the same
  typeface with the full variable weight axis instead of four static cuts.
  Used for every heading, site-wide.
*/
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  display: 'swap',
})

/*
  Bebas Neue for every heading, matching the Crosswalk site. Body copy stays
  Montserrat (CMG Sans). Bebas is caps only and has one weight.
*/
const bebas = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Austin W. Duncan',
    default: 'Austin W. Duncan',
  },
  description:
    'Sermons, biblical teaching, scholarly articles, and cultural commentary from Austin W. Duncan.',
  metadataBase: new URL('https://austinwduncan.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Austin W. Duncan',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Austin W. Duncan' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image'],
  },
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/word-for-word/feed', title: 'Word for Word RSS Feed' },
        { url: '/sermons/feed', title: 'Sermons RSS Feed' },
      ],
    },
  },
}

const SITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://austinwduncan.com/#person',
      name: 'Austin W. Duncan',
      url: 'https://austinwduncan.com',
      jobTitle: 'Pastor, Teacher, Theologian',
      description: 'Sermons, biblical teaching, scholarly articles, and cultural commentary from Austin W. Duncan.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://austinwduncan.com/#website',
      url: 'https://austinwduncan.com',
      name: 'Austin W. Duncan',
      description: 'Sermons, biblical teaching, scholarly articles, and cultural commentary from Austin W. Duncan.',
      author: { '@id': 'https://austinwduncan.com/#person' },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${bebas.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_SCHEMA) }}
        />
      </head>
      {/*
        The ground lives here, not on a page. bg-white and text-zinc-900
        were left from the old light design, and a utility on body beats
        anything in the base layer, so every page that did not paint its
        own background showed white behind the nav. The nav is transparent
        until it scrolls, so that white strip was the first thing a reader
        saw on all but the homepage.

        Pages that want a light ground still set their own, for example
        /about on warm bone.
      */}
      <body className="min-h-full flex flex-col" style={{ background: 'var(--awd-black)', color: 'var(--awd-bone)' }}>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <SpeedInsights />
      </body>

      {/* Google Analytics 4 */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}
          </Script>
        </>
      )}
    </html>
  )
}
