import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // Keep native modules out of the bundler; only the cutout route loads them.
  serverExternalPackages: ['onnxruntime-node', 'sharp'],
  // onnxruntime-node dlopens its shared library at runtime, which the tracer
  // misses. Force the Linux binaries into the cutout function.
  outputFileTracingIncludes: {
    '/api/sermons/cutout': ['./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/**'],
  },
  /*
    Legacy paths. Every URL the site has ever published either still resolves
    or lands here. Static redirects are checked before the filesystem and cost
    nothing per request. Permanent unless noted.
  */
  async redirects() {
    const go = (source: string, destination: string, permanent = true) => ({ source, destination, permanent })
    return [
      go('/browse', '/'),
      go('/library', '/'),
      go('/library/browse', '/'),
      go('/library/in-the-text', '/teaching'),
      go('/library/sermons', '/sermons'),
      go('/library/word-for-word', '/word-for-word'),
      go('/library/exegetica', '/exegetica'),
      go('/library/forum-and-pulpit', '/forum-and-pulpit'),
      go('/teaching/expositional', '/teaching'),
      go('/teaching/topical', '/teaching'),
      go('/teaching/expositional/:slug', '/teaching/:slug'),
      go('/teaching/topical/:slug', '/teaching/:slug'),
      go('/teaching/series/:slug', '/series/:slug'),
      go('/sermons/scripture-index', '/library/bible'),
      go('/sermons/bible', '/library/bible'),
      go('/sermons/bible/:book', '/library/bible?book=:book', false),
      go('/sermons/search', '/library/search'),
      go('/sermons/topics/:topic', '/library/topics/:topic'),
      go('/sermons/series', '/library/series'),
      go('/sermons/speakers/:s', '/sermons'),
      go('/topics', '/'),
      go('/topics/:slug', '/library/topics/:slug'),
      go('/scripture', '/library/bible'),
      go('/scripture/:book', '/library/bible?book=:book'),
      go('/scripture/:book/:chapter', '/library/bible?book=:book'),
      go('/studio', '/staff'),
      go('/studio/:path*', '/staff'),
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      /*
        Immutable caching is correct in production, where every filename is
        content hashed, and actively harmful in development, where Next reuses
        a stable name such as [root-of-the-server]__048~ozt._.css across every
        rebuild.

        With immutable on a stable URL the browser is told never to revalidate
        for a year. Once it has cached a stylesheet built before a directory
        existed, no reload, restart or rebuild will replace it: the page keeps
        rendering with classes that no longer resolve, and elements sized by a
        utility fall back to their intrinsic size. That is what made cards
        render at their image's natural 1920px while the server was serving
        correct CSS the whole time.
      */
      ...(process.env.NODE_ENV === 'production'
        ? [{
            source: '/_next/static/(.*)',
            headers: [
              { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
            ],
          }]
        : [{
            source: '/_next/static/(.*)',
            headers: [
              { key: 'Cache-Control', value: 'no-store, must-revalidate' },
            ],
          }]),
    ]
  },
}

export default nextConfig;
