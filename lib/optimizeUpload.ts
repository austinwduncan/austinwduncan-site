import sharp from "sharp";

/*
  Upload-time image optimization: every image staff upload (media drawer,
  sermon stills and artwork, leadership headshots, content intake, group
  graphics) is auto-rotated, capped in width, and re-encoded as WebP before
  it reaches storage, so nobody has to hand-compress anything ever again.
  Non-images (videos, PDFs, SVGs, GIFs) pass through untouched, and if the
  re-encode ever comes out larger the original wins.
*/

const OPTIMIZABLE = /^image\/(jpe?g|png|webp|avif|tiff|heic|heif)$/i;

export async function optimizeImageUpload(
  bytes: Buffer,
  contentType: string,
  opts?: { maxWidth?: number },
): Promise<{ bytes: Buffer; contentType: string; ext: string } | null> {
  if (!OPTIMIZABLE.test(contentType || "")) return null;
  try {
    const out = await sharp(bytes, { failOn: "none" })
      .rotate()
      .resize({ width: opts?.maxWidth ?? 1920, withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90 })
      .toBuffer();
    if (out.length >= bytes.length) return null;
    return { bytes: out, contentType: "image/webp", ext: "webp" };
  } catch {
    return null;
  }
}
