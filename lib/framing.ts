/*
  Thumbnail framing. The focal point (focalX/Y) is the speaker's face in the
  source frame; the target (targetX/Y) is where that face should land in the
  thumbnail; zoom is how far to push in. Given the container and image sizes we
  compute the image size + translate that places the face on the target, clamped
  so the image always covers the container (no gaps).
*/

export const DEFAULT_TARGET_X = 50; // top-third, centered
export const DEFAULT_TARGET_Y = 33;
export const DEFAULT_ZOOM = 1.5;

// A few named target spots for the picker (percent of the thumbnail).
export const TARGET_PRESETS: { key: string; label: string; x: number; y: number }[] = [
  { key: "tl", label: "Top left", x: 33, y: 33 },
  { key: "tc", label: "Top center", x: 50, y: 33 },
  { key: "tr", label: "Top right", x: 67, y: 33 },
  { key: "ml", label: "Left", x: 33, y: 50 },
  { key: "mc", label: "Center", x: 50, y: 50 },
  { key: "mr", label: "Right", x: 67, y: 50 },
];

export function frameTransform(
  containerW: number,
  containerH: number,
  imgW: number,
  imgH: number,
  focalX: number,
  focalY: number,
  targetX: number,
  targetY: number,
  zoom: number,
): { width: number; height: number; tx: number; ty: number } {
  const cover = Math.max(containerW / imgW, containerH / imgH);
  const scale = cover * Math.max(1, zoom);
  const dispW = imgW * scale;
  const dispH = imgH * scale;
  const fxPx = (focalX / 100) * dispW;
  const fyPx = (focalY / 100) * dispH;
  const txPx = (targetX / 100) * containerW;
  const tyPx = (targetY / 100) * containerH;
  // translate the image so the focal point sits on the target...
  let tx = txPx - fxPx;
  let ty = tyPx - fyPx;
  // ...but never reveal a gap: keep the image covering the container.
  tx = Math.min(0, Math.max(containerW - dispW, tx));
  ty = Math.min(0, Math.max(containerH - dispH, ty));
  return { width: dispW, height: dispH, tx, ty };
}
