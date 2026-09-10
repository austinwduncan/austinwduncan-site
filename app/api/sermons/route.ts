import { revalidatePath } from "next/cache";
import { isCategory } from "@/lib/categories";
import { NextResponse } from "next/server";
import { canManage } from "@/lib/adminSession";
import { supabaseService } from "@/lib/supabase";
import { recordAudit } from "@/lib/site";
import { getAllSermons, slugify } from "@/lib/sermons";
import { parseYouTubeId } from "@/lib/youtubeId";
import { replaceSermonScriptureRefs } from "@/lib/scripture";

export async function GET() {
  if (!(await canManage("sermons"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getAllSermons());
}

export async function POST(req: Request) {
  if (!(await canManage("sermons"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = supabaseService();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const title = String(b.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 422 });
  const slug = (String(b.slug ?? "").trim() || slugify(title)).slice(0, 120);

  const str = (v: unknown) => {
    const s = String(v ?? "").trim();
    return s ? s : null;
  };
  const arr = (v: unknown): string[] | null => {
    if (!Array.isArray(v)) return null;
    const out = v.map((x) => String(x ?? "").trim()).filter(Boolean);
    return out.length ? out : null;
  };
  const speakers = arr(b.speakers);
  const scripture = arr(b.scripture);
  const status: "published" | "draft" | "scheduled" = ["published", "draft", "scheduled"].includes(
    b.status,
  )
    ? b.status
    : b.published
      ? "published"
      : "draft";

  // Legacy columns that predate the Subsplash-style fields (always present).
  const base = {
    slug,
    title,
    series: str(b.series),
    speaker: (speakers?.[0] ?? str(b.speaker)) ?? "Austin W. Duncan",
    passage: scripture?.[0] ?? str(b.passage),
    date: str(b.date), // "YYYY-MM-DD" or null
    youtube_id: b.youtubeId ? parseYouTubeId(String(b.youtubeId)) : null,
    canonical_url: str(b.canonicalUrl),
    summary: str(b.description) ?? str(b.summary), // description doubles as the blurb
    body: String(b.body ?? ""),
    published: status === "published",
    updated_at: new Date().toISOString(),
  };
  // Fields added by migrations 0014/0015/0016.
  const extra = {
    youtube_id_full: b.youtubeIdFull ? parseYouTubeId(String(b.youtubeIdFull)) : null,
    subtitle: str(b.subtitle),
    description: str(b.description),
    speakers,
    scripture,
    topics: arr(b.topics),
    document_url: str(b.documentUrl),
    document_name: str(b.documentName),
    web_link_1_url: str(b.webLink1Url),
    web_link_1_label: str(b.webLink1Label),
    web_link_2_url: str(b.webLink2Url),
    web_link_2_label: str(b.webLink2Label),
    series_id: b.seriesId ? Number(b.seriesId) : null,
    artwork_url: str(b.artworkUrl),
    hero_still_url: str(b.heroStillUrl),
    hero_cutout_url: str(b.heroCutoutUrl),
    hero_still_candidates: arr(b.heroStillCandidates),
    hero_focal_x: b.heroFocalX == null ? null : Math.max(0, Math.min(100, Math.round(Number(b.heroFocalX)))),
    hero_focal_y: b.heroFocalY == null ? null : Math.max(0, Math.min(100, Math.round(Number(b.heroFocalY)))),
    hero_target_x: b.heroTargetX == null ? null : Math.max(0, Math.min(100, Math.round(Number(b.heroTargetX)))),
    hero_target_y: b.heroTargetY == null ? null : Math.max(0, Math.min(100, Math.round(Number(b.heroTargetY)))),
    hero_zoom: b.heroZoom == null ? null : Math.max(1, Math.min(3, Number(b.heroZoom))),
    week: b.week === "" || b.week == null || !Number.isFinite(Number(b.week)) ? null : Math.round(Number(b.week)),
    category: isCategory(b.category) ? b.category : "sermon",
    status,
    scheduled_at: status === "scheduled" ? str(b.scheduledAt) : null,
  };

  const write = (r: Record<string, unknown>) =>
    b.id
      ? db.from("sermons").update(r).eq("id", b.id).select("*").single()
      : db.from("sermons").upsert(r, { onConflict: "slug" }).select("*").single();

  let res = await write({ ...base, ...extra });
  // Survive the window before migrations add newer columns. Drop just the
  // framing columns first (0039), so a pre-migration save keeps the cutout/
  // focal/still fields; only fall back to the legacy row if something older
  // is still missing.
  if (res.error && /column|schema cache|could not find/i.test(res.error.message)) {
    const { hero_target_x: _tx, hero_target_y: _ty, hero_zoom: _z, ...extraLegacy } = extra;
    void _tx; void _ty; void _z;
    res = await write({ ...base, ...extraLegacy });
    if (res.error && /column|schema cache|could not find/i.test(res.error.message)) {
      res = await write(base);
    }
  }

  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 400 });

  // Keep the normalized scripture references in sync (best-effort; a missing table
  // pre-migration must not fail the save).
  const savedId = (res.data as { id?: number } | null)?.id ?? (b.id ? Number(b.id) : null);
  if (savedId) {
    try {
      await replaceSermonScriptureRefs(db, savedId, scripture ?? (base.passage ? [base.passage] : []));
    } catch {
      /* table not there yet — ignore */
    }
  }

  await recordAudit("staff", `Saved sermon "${title}"`);
  revalidatePath(`/sermons/${slug}`);
  revalidatePath("/staff/sermons");
  return NextResponse.json(res.data);
}

export async function DELETE(req: Request) {
  if (!(await canManage("sermons"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = supabaseService();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data } = await db.from("sermons").delete().eq("id", id).select("slug").maybeSingle();
  await recordAudit("staff", `Deleted sermon ${data?.slug ?? id}`);
  if (data?.slug) revalidatePath(`/sermons/${data.slug}`);
  revalidatePath("/staff/sermons");
  return NextResponse.json({ ok: true });
}
