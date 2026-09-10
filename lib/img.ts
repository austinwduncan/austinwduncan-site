/*
  Route remote CMS images (YouTube stills, Subsplash artwork, Supabase storage
  uploads) through Next's built-in image optimizer, which resizes them and
  serves AVIF/WebP. Local photo assets under /photos, /ministries, /brand, and
  /found are optimized too (resize + modern formats beat even hand-compressed
  jpgs). This is the standing pipeline: any
  new thumbnail or artwork added week to week is optimized automatically.
*/

const OPTIMIZABLE = [
  /^\/(photos|ministries|brand|found)\/.+\.(jpe?g|png|webp)$/i,
  /^https:\/\/i\.ytimg\.com\//,
  /^https:\/\/img\.youtube\.com\//,
  /^https:\/\/images\.subsplash\.com\//,
  /^https:\/\/[a-z0-9-]+\.supabase\.co\//,
];

/** Widths must exist in Next's deviceSizes list. */
export type ImgWidth = 640 | 750 | 828 | 1080 | 1200 | 1920;

export function optimizedImg(url: string, width?: ImgWidth): string;
export function optimizedImg(url: string | null | undefined, width?: ImgWidth): string | undefined;
export function optimizedImg(url: string | null | undefined, width: ImgWidth = 1080): string | undefined {
  if (!url) return undefined;
  if (!OPTIMIZABLE.some((re) => re.test(url))) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
}
