import { NextResponse } from "next/server";
import { canManage } from "@/lib/adminSession";
import { supabaseService } from "@/lib/supabase";
import { optimizeImageUpload } from "@/lib/optimizeUpload";

/*
  Upload sermon/series artwork or a study-guide document (staff/sermons-gated).
  Stores in the public `content-intake` bucket under a sermons/ prefix and
  returns the public URL + original filename. No table write here, so it works
  for brand-new (unsaved) sermons and series.
*/

export const runtime = "nodejs";
const MAX_BYTES = 40 * 1024 * 1024; // 40 MB (artwork + PDFs)
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

export async function POST(req: Request) {
  if (!(await canManage("sermons"))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const db = supabaseService();
  if (!db) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 501 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const kind = String(form?.get("kind") ?? "artwork"); // "artwork" | "document"
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  if (file.size === 0) return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });

  const allowed = kind === "document" ? DOC_TYPES : IMAGE_TYPES;
  if (file.type && !allowed.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "bad_type" }, { status: 415 });
  }

  const ext =
    (file.name.split(".").pop() || (kind === "document" ? "pdf" : "jpg"))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 5) || "bin";
  const prefix =
    kind === "document"
      ? "sermons/docs"
      : kind === "speaker"
        ? "sermons/speakers"
        : kind.startsWith("hero")
          ? "sermons/hero"
          : "sermons/artwork";
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  let buf: Buffer = Buffer.from(await file.arrayBuffer());
  let uploadType = file.type || (kind === "document" ? "application/octet-stream" : "image/jpeg");
  let uploadPath = path;
  if (kind !== "document") {
    const opt = await optimizeImageUpload(buf, uploadType, { maxWidth: 1920 });
    if (opt) {
      buf = opt.bytes;
      uploadType = opt.contentType;
      uploadPath = path.replace(/\.[a-z0-9]+$/, ".webp");
    }
  }

  const { error: up } = await db.storage.from("content-intake").upload(uploadPath, buf, {
    contentType: uploadType,
    upsert: true,
  });
  if (up) return NextResponse.json({ ok: false, error: "upload", detail: up.message }, { status: 502 });

  const { data: pub } = db.storage.from("content-intake").getPublicUrl(uploadPath);
  return NextResponse.json({ ok: true, url: pub?.publicUrl ?? null, name: file.name });
}
