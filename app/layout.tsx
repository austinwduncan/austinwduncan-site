import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
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

export const metadata: Metadata = {
  title: {
    template: '%s | Austin W. Duncan',
    default: 'Austin W. Duncan',
  },
  description:
    'Pastor, teacher, and theologian — sermons, biblical teaching, scholarly articles, and cultural commentary.',
  metadataBase: new URL('https://austinwduncan.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Austin W. Duncan',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
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

      {/* Facebook Meta Pixel */}
      <Script id="fb-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','952271687080958');
          fbq('track','PageView');
        `}
      </Script>

      {/* Umami — add data-website-id once you have your Umami instance URL */}
      {/* <Script src="https://your-umami-instance/script.js" data-website-id="YOUR_ID" strategy="afterInteractive" /> */}
    </html>
  )
}
