import ort, { type InferenceSession } from "onnxruntime-node";
import sharp from "sharp";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

/*
  Background removal for sermon hero stills (server-side, runs only in the
  gated /api/sermons/cutout route so onnxruntime-node never leaks into other
  functions or the client bundle). Uses the U2Net matting model — the same
  model/pipeline as rembg, reimplemented in Node so we stay single-runtime.

  The ~176MB model is fetched once from CUTOUT_MODEL_URL (the official rembg
  release by default) and cached in the function's /tmp for its lifetime, so it
  is never committed to the repo or shipped in the deployment. Point
  CUTOUT_MODEL_URL at our own storage once the Supabase upload cap is raised.
*/

const MODEL_URL =
  process.env.CUTOUT_MODEL_URL ||
  "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx";
const SIZE = 320; // U2Net input resolution
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

let sessionPromise: Promise<InferenceSession> | null = null;

async function getSession(): Promise<InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const cachePath = path.join(os.tmpdir(), "cw-u2net.onnx");
      let bytes: Buffer;
      try {
        bytes = await fs.readFile(cachePath);
      } catch {
        const res = await fetch(MODEL_URL);
        if (!res.ok) throw new Error(`model_fetch_${res.status}`);
        bytes = Buffer.from(await res.arrayBuffer());
        await fs.writeFile(cachePath, bytes).catch(() => {});
      }
      return ort.InferenceSession.create(bytes);
    })().catch((e) => {
      sessionPromise = null; // let a later call retry the fetch
      throw e;
    });
  }
  return sessionPromise;
}

/** Remove the background from an image, returning a transparent PNG buffer. */
export async function removeBackground(input: Buffer): Promise<Buffer> {
  const meta = await sharp(input).metadata();
  const W = meta.width ?? 0;
  const H = meta.height ?? 0;
  if (!W || !H) throw new Error("bad_image");

  // Preprocess: resize to 320x320, normalize (U2Net / rembg convention), NCHW.
  const { data } = await sharp(input)
    .resize(SIZE, SIZE, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let max = 0;
  for (let i = 0; i < data.length; i++) if (data[i] > max) max = data[i];
  if (!max) max = 1;
  const plane = SIZE * SIZE;
  const chw = new Float32Array(3 * plane);
  for (let p = 0; p < plane; p++) {
    for (let c = 0; c < 3; c++) {
      chw[c * plane + p] = (data[p * 3 + c] / max - MEAN[c]) / STD[c];
    }
  }

  const sess = await getSession();
  const out = await sess.run({
    [sess.inputNames[0]]: new ort.Tensor("float32", chw, [1, 3, SIZE, SIZE]),
  });
  const pred = out[sess.outputNames[0]].data as Float32Array;

  // Normalize the predicted mask to 0..255.
  let mi = Infinity;
  let ma = -Infinity;
  for (let i = 0; i < plane; i++) {
    const v = pred[i];
    if (v < mi) mi = v;
    if (v > ma) ma = v;
  }
  const range = ma - mi || 1;
  const maskSmall = Buffer.alloc(plane);
  for (let i = 0; i < plane; i++) maskSmall[i] = Math.round(((pred[i] - mi) / range) * 255);

  // Upscale the mask to the original size and apply it as the alpha channel.
  const maskFull = await sharp(maskSmall, { raw: { width: SIZE, height: SIZE, channels: 1 } })
    .resize(W, H, { fit: "fill" })
    .extractChannel(0)
    .raw()
    .toBuffer();
  const rgb = await sharp(input).removeAlpha().raw().toBuffer();
  const rgba = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    rgba[i * 4] = rgb[i * 3];
    rgba[i * 4 + 1] = rgb[i * 3 + 1];
    rgba[i * 4 + 2] = rgb[i * 3 + 2];
    rgba[i * 4 + 3] = maskFull[i];
  }
  return sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .png()
    .toBuffer();
}
