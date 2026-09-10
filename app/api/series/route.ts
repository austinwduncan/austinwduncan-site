import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { canManage } from "@/lib/adminSession";
import { supabaseService } from "@/lib/supabase";
import { recordAudit } from "@/lib/site";
import { getAllSeries, slugify } from "@/lib/series";

/* Sermon series CRUD (staff/sermons-gated). */

export async function GET() {
  if (!(await canManage("sermons"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getAllSeries());
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

  const str = (v: unknown) => {
    const s = String(v ?? "").trim();
    return s ? s : null;
  };
  const status = ["published", "draft", "scheduled"].includes(b.status) ? b.status : "draft";
  const base = {
    slug: (String(b.slug ?? "").trim() || slugify(title)).slice(0, 120),
    title,
    subtitle: str(b.subtitle),
    description: str(b.description),
    artwork_url: str(b.artworkUrl),
    status,
    scheduled_at: status === "scheduled" ? str(b.scheduledAt) : null,
    updated_at: new Date().toISOString(),
  };
  // Columns from later migrations (0018 background, 0021 dates); drop them and
  // retry with just `base` if they don't exist yet.
  const row = {
    ...base,
    banner_url: str(b.bannerUrl),
    background_url: str(b.backgroundUrl),
    starts_on: str(b.startsOn),
    ends_on: str(b.endsOn),
  };

  const write = (r: Record<string, unknown>) =>
    b.id
      ? db.from("sermon_series").update(r).eq("id", b.id).select("*").single()
      : db.from("sermon_series").upsert(r, { onConflict: "slug" }).select("*").single();

  let res = await write(row);
  if (res.error && /column|schema cache|could not find/i.test(res.error.message)) {
    res = await write(base);
  }

  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 400 });
  await recordAudit("staff", `Saved series "${title}"`);
  revalidatePath("/staff/sermons");
  revalidatePath("/sermons");
  return NextResponse.json(res.data);
}

export async function DELETE(req: Request) {
  if (!(await canManage("sermons"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = supabaseService();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "no_id" }, { status: 400 });
  const { error } = await db.from("sermon_series").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await recordAudit("staff", `Deleted series ${id}`);
  return NextResponse.json({ ok: true });
}
