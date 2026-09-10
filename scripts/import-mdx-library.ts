/*
  One-time import of the old content/*.mdx sections into the sermons table
  (the single library table that /staff/sermons manages), one row per piece
  with its `category` set:

    content/sermons/*.mdx                     -> sermon      (already gone)
    content/teaching/{expositional,topical}/  -> teaching    (one sermon_series per directory)
    content/word-for-word/*.mdx               -> episode
    content/exegetica/*.mdx                   -> paper
    content/forum-and-pulpit/*.mdx            -> commentary

    npx tsx scripts/import-mdx-library.ts --dry   # show what would change
    npx tsx scripts/import-mdx-library.ts --dry --show <slug>   # plus one full body
    npx tsx scripts/import-mdx-library.ts         # upsert, by slug

  Bodies stay Markdown-light: level 1 and 2 headings become "## " sections,
  "### " and deeper are kept as subheads, blockquotes and lists stay single
  blocks, and inline **bold**, *italic*, [links](url) and image links are left
  in place. Word for Word bodies lose the scraped newsletter block.

  Teaching series metadata comes from data/teaching-series.ts, matched on the
  last frontmatter tag (seriesTag). Re-runs are safe: series upsert on slug,
  pieces upsert on slug, scripture chips replaced.
*/
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";
import { replaceSermonScriptureRefs } from "../lib/scripture";
import { parseScripture } from "../lib/scriptureRef";
import { TEACHING_SERIES, type SeriesMetadata } from "../data/teaching-series";
import type { Category } from "../lib/categories";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) throw new Error("Supabase env missing");
const db = createClient(url, key, { auth: { persistSession: false } });
const dry = process.argv.includes("--dry");
const showSlug = process.argv[process.argv.indexOf("--show") + 1]; // --show <slug>: print that piece's full body (dry only)

const SPEAKER = "Austin W. Duncan";
const CONTENT = path.join(process.cwd(), "content");

type Fm = {
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  youtube?: string;
  image?: string;
  scripture?: string;
  featured?: boolean;
};

type Section = { category: Category; dir: string; label: string };

const SECTIONS: Section[] = [
  { category: "sermon", dir: "sermons", label: "Sermons" },
  { category: "teaching", dir: "teaching", label: "In the Text" },
  { category: "episode", dir: "word-for-word", label: "Word for Word" },
  { category: "paper", dir: "exegetica", label: "Exegetica" },
  { category: "commentary", dir: "forum-and-pulpit", label: "Forum & Pulpit" },
];

type SeriesRow = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  artwork_url: string | null;
  status: string;
  sort_order: number;
  starts_on: string | null;
  ends_on: string | null;
};

type Piece = {
  section: Section;
  file: string;
  slug: string;
  fm: Fm;
  body: string;
  chips: string[];
  topics: string[];
  seriesSlug: string | null;
  seriesTitle: string | null;
  week: number | null;
  hadNewsletter: boolean;
};

// ---------------------------------------------------------------------------
// Body conversion

function convertBody(src: string): string {
  const blocks = src
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^(import|export) .*$/gm, "")
    .trim()
    .split(/\n\s*\n/);
  const out: string[] = [];
  for (const raw of blocks) {
    const b = raw.trim();
    if (!b) continue;
    // level 1 and 2 headings become section headings; ### and deeper stay subheads
    const h = /^#{1,2}\s+(.*)$/.exec(b);
    if (h && !b.includes("\n")) {
      out.push(`## ${h[1].replace(/\*\*/g, "").trim()}`);
      continue;
    }
    // horizontal rules carry nothing
    if (/^([-*_]\s*){3,}$/.test(b)) continue;
    out.push(b);
  }
  return out.join("\n\n");
}

/*
  Word for Word bodies were scraped from the old site and carry the newsletter
  sign-up block: from the "Equipping You to Think and Live Biblically" heading
  through the "**Privacy Disclaimer" paragraph. Returns the cleaned source and
  whether the block was found.
*/
function stripNewsletter(src: string): { body: string; found: boolean } {
  const lines = src.split("\n");
  const start = lines.findIndex((l) => /^#{1,6}\s/.test(l) && l.includes("Equipping You to Think and Live Biblically"));
  let found = false;
  if (start >= 0) {
    let end = lines.findIndex((l, i) => i > start && l.trim().startsWith("**Privacy Disclaimer"));
    if (end >= 0) {
      // through the end of that paragraph
      while (end + 1 < lines.length && lines[end + 1].trim() !== "") end++;
      lines.splice(start, end - start + 1);
      found = true;
    }
  }
  const kept = lines.filter((l) => {
    const t = l.trim();
    return t !== "Email Address" && t !== "Sign Up";
  });
  return { body: kept.join("\n"), found };
}

// ---------------------------------------------------------------------------
// Helpers

function artwork(image?: string): string | null {
  const s = (image ?? "").trim();
  if (!s) return null;
  return /^https?:\/\//.test(s) ? s : encodeURI(s);
}

/** "Hebrews 3: The Faithful Builder" -> "Hebrews 3"; "Daniel 7" -> "Daniel 7"; else null. */
function scriptureFromTitle(title: string): string | null {
  const head = title.split(":")[0].replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
  // book (optional ordinal) with an optional chapter or chapter range only
  if (!/^(?:[1-3]\s+)?[A-Za-z][A-Za-z ]*?(?:\s+\d+(?:-\d+)?)?$/.test(head)) return null;
  return parseScripture(head).length ? head : null;
}

/** The session number in a slug: the first all-digit hyphen segment ("hebrews-3", "daniel-1-faithfulness", "1-lost-in-translation"). */
function weekFromSlug(slug: string): number | null {
  const seg = slug.split("-").find((s) => /^\d+$/.test(s));
  return seg ? Number(seg) : null;
}

/** "/images/Word for Word/Word for Word - Episode 71.jpg" -> 71 */
function episodeFromImage(image?: string): number | null {
  const m = /Episode\s+(\d+)/i.exec(image ?? "");
  return m ? Number(m[1]) : null;
}

/** Retry a network call a few times; Supabase REST drops the odd request on long runs. */
async function retry<T>(label: string, fn: () => Promise<T>, attempts = 4): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i >= attempts) throw new Error(`${label}: ${(e as Error).message}`);
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
}

function listMdx(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).sort();
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function readPiece(section: Section, file: string): Piece {
  const slug = path.basename(file, ".mdx");
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const fm = data as Fm;
  let src = content;
  let hadNewsletter = false;
  if (section.category === "episode") {
    const r = stripNewsletter(src);
    src = r.body;
    hadNewsletter = r.found;
  }
  return {
    section,
    file,
    slug,
    fm,
    body: convertBody(src),
    chips: [],
    topics: (fm.tags ?? []).map((t) => String(t).trim()).filter(Boolean),
    seriesSlug: null,
    seriesTitle: null,
    week: null,
    hadNewsletter,
  };
}

// ---------------------------------------------------------------------------
// Sections

type SeriesBuild = { row: SeriesRow; meta: SeriesMetadata | null; dirName: string; pieces: Piece[] };

function loadTeaching(section: Section, series: Map<string, SeriesBuild>, warnings: string[]): Piece[] {
  const root = path.join(CONTENT, section.dir);
  if (!fs.existsSync(root)) return [];
  const pieces: Piece[] = [];
  for (const kind of fs.readdirSync(root)) {
    const kindDir = path.join(root, kind);
    if (!fs.statSync(kindDir).isDirectory()) continue;
    for (const dirName of fs.readdirSync(kindDir)) {
      const dir = path.join(kindDir, dirName);
      if (!fs.statSync(dir).isDirectory()) continue;
      const files = listMdx(dir);
      if (!files.length) continue;
      const group = files.map((f) => readPiece(section, path.join(dir, f)));

      // the last tag is the series tag; every file in the directory should agree
      const tags = new Set(group.map((p) => p.topics[p.topics.length - 1] ?? ""));
      if (tags.size !== 1) warnings.push(`${dirName}: files disagree on the series tag (${[...tags].join(" | ")})`);
      const seriesTag = group[0].topics[group[0].topics.length - 1] ?? dirName;
      const meta = TEACHING_SERIES.find((s) => s.seriesTag === seriesTag) ?? null;
      if (!meta) warnings.push(`${dirName}: no entry in data/teaching-series.ts with seriesTag "${seriesTag}", created from the directory name`);

      const dates = group.map((p) => p.fm.date).filter(Boolean).sort();
      const row: SeriesRow = meta
        ? {
            slug: meta.slug,
            title: meta.title,
            subtitle: meta.subtitle || null,
            description: meta.whyStudy || meta.excerpt || null,
            artwork_url: artwork(meta.image),
            status: "published",
            sort_order: meta.priority,
            starts_on: dates[0] ?? null,
            ends_on: dates[dates.length - 1] ?? null,
          }
        : {
            slug: slugify(dirName),
            title: dirName,
            subtitle: null,
            description: null,
            artwork_url: artwork(group.find((p) => p.fm.image)?.fm.image),
            status: "published",
            sort_order: 0,
            starts_on: dates[0] ?? null,
            ends_on: dates[dates.length - 1] ?? null,
          };
      if (series.has(row.slug)) warnings.push(`${dirName}: series slug "${row.slug}" already produced by another directory`);

      // week: the number in the filename, else 1-based position by date
      const byDate = [...group].sort((a, b) => (a.fm.date ?? "").localeCompare(b.fm.date ?? "") || a.slug.localeCompare(b.slug));
      for (const p of group) {
        p.seriesSlug = row.slug;
        p.seriesTitle = row.title;
        p.topics = p.topics.filter((t) => t !== seriesTag);
        p.week = weekFromSlug(p.slug) ?? byDate.indexOf(p) + 1;
        const chip = scriptureFromTitle(p.fm.title);
        p.chips = chip ? [chip] : [];
      }
      // An unnumbered intro that comes first collides with session 1. The
      // roadmap in data/teaching-series.ts counts that intro as session 1, so
      // shift the numbered files up by one to match it.
      const unnumbered = group.filter((p) => weekFromSlug(p.slug) == null);
      if (unnumbered.length === 1 && unnumbered[0] === byDate[0] && group.some((p) => weekFromSlug(p.slug) === 1)) {
        for (const p of group) if (p !== unnumbered[0]) p.week = (p.week ?? 0) + 1;
        warnings.push(`${dirName}: "${unnumbered[0].slug}" is an unnumbered intro dated first; numbered sessions shifted +1 so it is week 1 (matches the roadmap)`);
      }
      const weeks = group.map((p) => p.week);
      const dup = weeks.filter((w, i) => weeks.indexOf(w) !== i);
      if (dup.length) warnings.push(`${dirName}: duplicate week numbers ${[...new Set(dup)].join(", ")}`);

      series.set(row.slug, { row, meta, dirName, pieces: group });
      pieces.push(...group);
    }
  }
  return pieces;
}

function loadFlat(section: Section): Piece[] {
  const dir = path.join(CONTENT, section.dir);
  return listMdx(dir).map((f) => {
    const p = readPiece(section, path.join(dir, f));
    if (section.category === "sermon") {
      const passage = (p.fm.scripture ?? "").replace(/[–—]/g, "-").trim();
      p.chips = passage ? passage.split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean) : [];
      p.topics = [];
    }
    if (section.category === "episode") p.week = episodeFromImage(p.fm.image);
    return p;
  });
}

// ---------------------------------------------------------------------------

function toRow(p: Piece, seriesId: number | null) {
  return {
    slug: p.slug,
    title: p.fm.title,
    date: p.fm.date || null,
    summary: p.fm.excerpt ?? "",
    description: p.fm.excerpt || null,
    speaker: SPEAKER,
    speakers: [SPEAKER],
    passage: p.chips[0] ?? null,
    scripture: p.chips,
    topics: p.topics,
    series: p.seriesTitle,
    series_id: seriesId,
    week: p.week,
    youtube_id: p.fm.youtube || null,
    artwork_url: artwork(p.fm.image),
    body: p.body,
    status: "published",
    published: true,
    category: p.section.category,
  };
}

async function main() {
  const warnings: string[] = [];
  const series = new Map<string, SeriesBuild>();
  const bySection = new Map<Section, Piece[]>();
  for (const s of SECTIONS) {
    const pieces = s.category === "teaching" ? loadTeaching(s, series, warnings) : loadFlat(s);
    bySection.set(s, pieces);
  }
  const all = [...bySection.values()].flat();

  // slug collisions: within the MDX, and against rows of another category already in the table
  const seen = new Map<string, Piece>();
  const collisions: string[] = [];
  for (const p of all) {
    const prev = seen.get(p.slug);
    if (prev) collisions.push(`${p.slug}: ${prev.file} and ${p.file}`);
    seen.set(p.slug, p);
  }
  const { data: existing, error: exErr } = await db.from("sermons").select("slug, category");
  if (exErr) throw exErr;
  for (const r of existing ?? []) {
    const p = seen.get(r.slug as string);
    if (p && r.category !== p.section.category) collisions.push(`${p.slug}: already in the table as category "${r.category}" (would become "${p.section.category}")`);
  }
  if (collisions.length) {
    console.error("Slug collisions, nothing written:");
    for (const c of collisions) console.error("  " + c);
    process.exit(1);
  }

  const newsletterCount = all.filter((p) => p.hadNewsletter).length;

  console.log("Per section:");
  for (const [s, pieces] of bySection) console.log(`  ${s.category.padEnd(11)} ${String(pieces.length).padStart(3)}  (${s.label}, content/${s.dir})`);
  console.log(`  total       ${String(all.length).padStart(3)}`);
  console.log(`\nSeries (${series.size}):`);
  for (const b of series.values()) {
    console.log(`  ${b.row.slug.padEnd(30)} "${b.row.title}"  ${b.pieces.length} sessions  ${b.row.starts_on} to ${b.row.ends_on}  sort ${b.row.sort_order}${b.meta ? "" : "  [NO teaching-series.ts ENTRY]"}`);
  }
  console.log(`\nNewsletter blocks stripped from Word for Word: ${newsletterCount}`);
  if (warnings.length) {
    console.log("\nWarnings:");
    for (const w of warnings) console.log("  " + w);
  }

  if (dry) {
    for (const [s, pieces] of bySection) {
      if (!pieces.length) continue;
      const p = pieces[0];
      const row = toRow(p, null);
      console.log(`\n--- sample ${s.category} row (${path.relative(process.cwd(), p.file)}, body truncated):`);
      console.log(JSON.stringify({ ...row, body: row.body.slice(0, 500) + " ..." }, null, 2));
      const kinds = {
        sections: (row.body.match(/^## /gm) ?? []).length,
        subheads: (row.body.match(/^###+ /gm) ?? []).length,
        quotes: (row.body.match(/^> /gm) ?? []).length,
        lists: (row.body.match(/^[-*] /gm) ?? []).length,
      };
      console.log("block stats:", kinds);
    }
    console.log("\nTeaching weeks and scripture chips:");
    for (const b of series.values()) {
      const line = [...b.pieces]
        .sort((a, c) => (a.week ?? 0) - (c.week ?? 0))
        .map((p) => `${p.week}${p.chips.length ? `[${p.chips[0]}]` : ""}`)
        .join("  ");
      console.log(`  ${b.row.slug}: ${line}`);
    }
    const epWeeks = (bySection.get(SECTIONS[2]) ?? []).map((p) => p.week);
    console.log(`\nEpisode numbers present: ${epWeeks.filter((w) => w != null).length}/${epWeeks.length}`);
    if (process.argv.includes("--show")) {
      const p = all.find((x) => x.slug === showSlug);
      console.log(`\n--- full body of ${showSlug}:`);
      console.log(p ? p.body : "(no such slug)");
    }
    console.log(`\ndry run: ${all.length} pieces and ${series.size} series would be upserted`);
    return;
  }

  // speaker
  {
    const { error } = await db.from("speakers").upsert(
      { slug: "austin-w-duncan", name: SPEAKER, role: "Pastor and teacher", published: true, sort_order: 0 },
      { onConflict: "slug" },
    );
    if (error) throw error;
  }

  // series
  const seriesIds = new Map<string, number>();
  for (const b of series.values()) {
    const id = await retry(`series ${b.row.slug}`, async () => {
      const { data, error } = await db.from("sermon_series").upsert(b.row, { onConflict: "slug" }).select("id").single();
      if (error) throw new Error(error.message);
      return data.id as number;
    });
    seriesIds.set(b.row.slug, id);
  }

  // pieces, a few at a time
  let n = 0;
  const CONCURRENCY = 4;
  const queue = [...all];
  async function worker() {
    for (let p = queue.shift(); p; p = queue.shift()) {
      const seriesId = p.seriesSlug ? seriesIds.get(p.seriesSlug) ?? null : null;
      if (p.seriesSlug && seriesId == null) throw new Error(`${p.slug}: series ${p.seriesSlug} has no id`);
      const row = toRow(p, seriesId);
      const piece = p;
      const id = await retry(piece.slug, async () => {
        const { data: saved, error } = await db.from("sermons").upsert(row, { onConflict: "slug" }).select("id").single();
        if (error) throw new Error(error.message);
        return saved.id as number;
      });
      await retry(`${piece.slug} scripture refs`, () => replaceSermonScriptureRefs(db, id, piece.chips));
      n++;
      if (n % 25 === 0) console.log(`  ${n}/${all.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`\nupserted ${series.size} series and ${n} pieces`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
