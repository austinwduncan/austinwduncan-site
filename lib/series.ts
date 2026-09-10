import { supabaseAnon, supabaseService } from "./supabase";
import { slugify } from "./sermons";

/*
  Sermon series (Subsplash "Media Series"). A series carries the shared artwork
  and blurb a sermon inherits when it has no graphic of its own. Visibility works
  like sermons: published, or scheduled whose time has passed.
*/

export type SeriesStatus = "published" | "draft" | "scheduled";

export type Series = {
  id: number;
  slug: string;
  title: string;
  description?: string;
  /** Repurposed: the scripture the series covers. */
  subtitle?: string;
  artworkUrl?: string;
  /** Wide banner image (Subsplash-style) for the series-page header. */
  bannerUrl?: string;
  /** Background image shown behind the speaker on the message hero. */
  backgroundUrl?: string;
  /** Series run dates (ISO YYYY-MM-DD). */
  startsOn?: string;
  endsOn?: string;
  status: SeriesStatus;
  scheduledAt?: string;
};

type Row = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  artwork_url: string | null;
  banner_url?: string | null;
  background_url?: string | null;
  starts_on?: string | null;
  ends_on?: string | null;
  status: string | null;
  scheduled_at: string | null;
};

function rowToSeries(r: Row): Series {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle ?? undefined,
    description: r.description ?? undefined,
    artworkUrl: r.artwork_url ?? undefined,
    bannerUrl: r.banner_url ?? undefined,
    backgroundUrl: r.background_url ?? undefined,
    startsOn: r.starts_on ?? undefined,
    endsOn: r.ends_on ?? undefined,
    status: (r.status as SeriesStatus) ?? "draft",
    scheduledAt: r.scheduled_at ?? undefined,
  };
}

function visibleOr(): string {
  const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  return `status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`;
}

/** Staff: every series (service role). Empty array if the table isn't there yet. */
export async function getAllSeries(): Promise<Series[]> {
  const db = supabaseService();
  if (!db) return [];
  const { data, error } = await db
    .from("sermon_series")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as Row[]).map(rowToSeries);
}

/** Public: visible series only. */
export async function getPublishedSeries(): Promise<Series[]> {
  const db = supabaseAnon();
  if (!db) return [];
  const { data, error } = await db
    .from("sermon_series")
    .select("*")
    .or(visibleOr())
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as Row[]).map(rowToSeries);
}

/** Public: a single visible series by slug. */
export async function getSeries(slug: string): Promise<Series | null> {
  const db = supabaseAnon();
  if (!db) return null;
  const { data, error } = await db
    .from("sermon_series")
    .select("*")
    .eq("slug", slug)
    .or(visibleOr())
    .maybeSingle();
  if (error || !data) return null;
  return rowToSeries(data as Row);
}

export { slugify };
