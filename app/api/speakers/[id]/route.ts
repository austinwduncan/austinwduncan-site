import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { canManage } from "@/lib/adminSession";
import { supabaseService } from "@/lib/supabase";
import { slugify } from "@/lib/sermons";
import { recordAudit } from "@/lib/site";

const SELECT = "id,slug,name,role,photo_url,bio,sort_order,published";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/speakers/[id]">) {
  if (!(await canManage("sermons"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = supabaseService();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (body.name != null) update.name = String(body.name).trim();
  if (body.slug != null) update.slug = slugify(String(body.slug));
  else if (body.name != null) update.slug = slugify(String(body.name));
  if ("role" in body) update.role = body.role ? String(body.role) : null;
  if ("photoUrl" in body) update.photo_url = body.photoUrl ? String(body.photoUrl) : null;
  if ("bio" in body) update.bio = body.bio ? String(body.bio) : null;
  if ("sortOrder" in body) update.sort_order = Math.round(Number(body.sortOrder) || 0);
  if ("published" in body) update.published = body.published !== false;

  const { data, error } = await db.from("speakers").update(update).eq("id", id).select(SELECT).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await recordAudit("sermons", `Updated speaker ${data?.name ?? id}`);
  revalidatePath("/sermons");
  if (data?.slug) revalidatePath(`/sermons/speakers/${data.slug}`);
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/speakers/[id]">) {
  if (!(await canManage("sermons"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = supabaseService();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const { error } = await db.from("speakers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await recordAudit("sermons", `Deleted speaker ${id}`);
  revalidatePath("/sermons");
  return NextResponse.json({ ok: true });
}
