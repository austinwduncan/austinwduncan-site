import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { canManage } from "@/lib/adminSession";
import { supabaseAnon, supabaseService } from "@/lib/supabase";
import { slugify } from "@/lib/sermons";
import { recordAudit } from "@/lib/site";

const SELECT = "id,slug,name,role,photo_url,bio,sort_order,published";

export async function GET() {
  const db = supabaseAnon();
  if (!db) return NextResponse.json([]);
  const { data } = await db.from("speakers").select(SELECT).order("sort_order").order("name");
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  if (!(await canManage("sermons"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = supabaseService();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 422 });
  const slug = body.slug ? slugify(String(body.slug)) : slugify(name);

  const insert = {
    slug,
    name,
    role: body.role ? String(body.role) : null,
    photo_url: body.photoUrl ? String(body.photoUrl) : null,
    bio: body.bio ? String(body.bio) : null,
    sort_order: Number.isFinite(Number(body.sortOrder)) ? Math.round(Number(body.sortOrder)) : 0,
    published: body.published !== false,
  };

  const { data, error } = await db.from("speakers").insert(insert).select(SELECT).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await recordAudit("sermons", `Added speaker ${name}`);
  revalidatePath("/sermons");
  revalidatePath(`/sermons/speakers/${slug}`);
  return NextResponse.json(data);
}
