/*
  Focal-point framing. Given a container (Cw×Ch), an image's intrinsic size
  (Nw×Nh) and a focus point (fx,fy as % of the image), compute the CSS
  object-position (%) that, with object-fit:cover, lands the focus point at target
  fractions (tx,ty) of the container — i.e. actually *centers* on the face. Using
  object-cover guarantees full coverage (no gaps/tiling), and the computed position
  works per-crop, so one focus point frames correctly on desktop and mobile.
*/
const clamp = (v: number) => Math.max(0, Math.min(100, v));

export function focalPosition(
  Cw: number,
  Ch: number,
  Nw: number,
  Nh: number,
  fx: number,
  fy: number,
  tx: number,
  ty: number,
): { x: number; y: number } | null {
  if (!Cw || !Ch || !Nw || !Nh) return null;
  const s = Math.max(Cw / Nw, Ch / Nh); // object-cover scale
  const Sw = Nw * s;
  const Sh = Nh * s;
  const ox = Sw - Cw; // horizontal overflow
  const oy = Sh - Ch; // vertical overflow
  const x = ox > 1 ? clamp((fx * Sw - 100 * tx * Cw) / ox) : 50;
  const y = oy > 1 ? clamp((fy * Sh - 100 * ty * Ch) / oy) : 50;
  return { x, y };
}
