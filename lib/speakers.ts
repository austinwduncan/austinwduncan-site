import { supabaseAnon, supabaseService } from "./supabase";
import { slugify } from "./sermons";

/*
  Speaker profiles. A speaker is keyed by `slug` = slugify(name), which is exactly
  how the sermon browse derives its speaker links — so a sermon's speaker name
  resolves to its profile (photo, role, bio) with no join and no sermon-schema
  change. Missing profiles simply fall back to the bare name.
*/

export type Speaker = {
  id: number;
  slug: string;
  name: string;
  role?: string;
  photoUrl?: string;
  bio?: string;
  sortOrder: number;
  published: boolean;
};

type Row = {
  id: number;
  slug: string;
  name: string;
  role: string | null;
  photo_url: string | null;
  bio: string | null;
  sort_order: number;
  published: boolean;
};

const SELECT = "id,slug,name,role,photo_url,bio,sort_order,published";

function rowToSpeaker(r: Row): Speaker {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    role: r.role ?? undefined,
    photoUrl: r.photo_url ?? undefined,
    bio: r.bio ?? undefined,
    sortOrder: r.sort_order ?? 0,
    published: r.published ?? true,
  };
}

/** Published speaker profiles (public), ordered for display. */
export async function getPublishedSpeakers(): Promise<Speaker[]> {
  const db = supabaseAnon();
  if (!db) return [];
  try {
    const { data, error } = await db
      .from("speakers")
      .select(SELECT)
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error || !data) return [];
    return (data as Row[]).map(rowToSpeaker);
  } catch {
    return [];
  }
}

/** Every speaker, published or not (staff management). */
export async function getAllSpeakers(): Promise<Speaker[]> {
  const db = supabaseService();
  if (!db) return [];
  try {
    const { data } = await db
      .from("speakers")
      .select(SELECT)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    return ((data as Row[]) ?? []).map(rowToSpeaker);
  } catch {
    return [];
  }
}

/** A single published speaker by slug (public profile page). */
export async function getSpeaker(slug: string): Promise<Speaker | null> {
  const db = supabaseAnon();
  if (!db) return null;
  try {
    const { data, error } = await db
      .from("speakers")
      .select(SELECT)
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error || !data) return null;
    return rowToSpeaker(data as Row);
  } catch {
    return null;
  }
}

/** Slug -> speaker map for the browse surfaces. */
export function speakerBySlug(list: Speaker[]): Map<string, Speaker> {
  return new Map(list.map((s) => [s.slug, s]));
}

export { slugify };
