import type { NextConfig } from "next";
import { legacyRedirects } from "./lib/seo";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  /*
    Legacy paths, generated rather than listed.

    content_slug_history holds every path that has ever been published. This
    reads it at build time and emits a 308 for each row whose recorded path no
    longer equals the canonical path the data layer produces, so a slug that
    moves is redirected by the act of recording the move, with nobody
    hand maintaining a list of 213 entries.

    Static redirects are checked before the filesystem and cost nothing per
    request, which is why this is here rather than in a proxy. The trade is
    that the table is read once per build: a slug that moves after a deploy
    starts redirecting at the next build, not the moment the row lands.

    A failure here must never fail the build. Losing the redirect table for one
    deploy is recoverable. Losing the deploy is not.
  */
  async redirects() {
    try {
      const moves = await legacyRedirects()
      console.log(`[urls] ${moves.length} legacy redirects generated from content_slug_history`)
      return moves.map(move => ({
        source: move.from,
        destination: move.to,
        permanent: true,
      }))
    } catch (error) {
      console.warn(
        '[urls] could not read content_slug_history, building with no legacy redirects:',
        error instanceof Error ? error.message : error,
      )
      return []
    }
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
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig;
