/*
  Canonical origin for absolute URLs (metadata, structured data, sitemap,
  robots). Defaults to the current Vercel production URL so canonicals are
  correct today; override with NEXT_PUBLIC_SITE_URL if the domain
  ever changes.
*/
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://austinwduncan.com"
).replace(/\/+$/, "");
