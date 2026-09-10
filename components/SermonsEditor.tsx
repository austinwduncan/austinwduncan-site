"use client";

import { CATEGORIES, CATEGORY_ORDER, type Category } from "@/lib/categories";
import { useMemo, useState } from "react";
import type { SermonRecord } from "@/lib/sermons";
import type { Series } from "@/lib/series";
import { parseYouTubeId } from "@/lib/youtubeId";
import { lookupCatalog, type CatalogEntry } from "@/lib/sermonCatalog";
import TagInput from "./sermons/TagInput";
import UploadField from "./sermons/UploadField";
import FocusPicker from "./sermons/FocusPicker";
import HeroFramePicker from "./sermons/HeroFramePicker";
import CutoutButton from "./sermons/CutoutButton";
import FramingControls from "./sermons/FramingControls";
import { DEFAULT_TARGET_X, DEFAULT_TARGET_Y, DEFAULT_ZOOM } from "@/lib/framing";

/*
  Subsplash-style sermon builder (/staff/sermons). Sections: Basic Info, Tags,
  Media Series, Artwork, Status. "Build from video" pulls the transcript and
  drafts the whole record (title, subtitle, scripture, topics, description, and
  the article). A live preview shows how the article body will parse.
*/

/* Turn a failed /api/sermons/format response into a message that names the cause. */
function draftErrorMessage(data: { reason?: string; error?: string }, fallback: string): string {
  switch (data.reason) {
    case "no_credit":
      return "The AI drafting service is out of credits. Add credits to the Anthropic account, then try again. (Your text is still here.)";
    case "busy":
      return "The AI service is busy right now. Wait a moment and try again.";
    case "truncated":
      return "The sermon was too long to draft in one pass. Try formatting just the sermon portion.";
    case "refusal":
      return "The drafter declined this source. Paste just the sermon (without song lyrics) and try again.";
    default:
      return fallback;
  }
}

type Status = "published" | "draft" | "scheduled";

type Form = {
  id: number | null;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  week: string;
  description: string;
  speakers: string[];
  scripture: string[];
  topics: string[];
  youtubeId: string;
  documentUrl: string;
  documentName: string;
  webLink1Url: string;
  webLink1Label: string;
  webLink2Url: string;
  webLink2Label: string;
  seriesId: number | null;
  artworkUrl: string;
  heroStillUrl: string;
  heroStillCandidates: string[];
  heroCutoutUrl: string;
  heroFocalX: number;
  heroFocalY: number;
  heroTargetX: number;
  heroTargetY: number;
  heroZoom: number;
  canonicalUrl: string;
  body: string;
  status: Status;
  scheduledAt: string;
  category: Category;
};

const field =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/45 outline-none focus:border-secondary";
const label = "block text-xs font-semibold uppercase tracking-wide text-ink/70";
const section = "rounded-2xl border border-ink/10 bg-white p-5";
const sectionTitle = "font-[family-name:var(--font-display)] text-lg tracking-wide text-ink";

const BLANK: Form = {
  id: null, slug: "", title: "", subtitle: "", date: "", week: "", description: "",
  speakers: ["Austin W. Duncan"], scripture: [], topics: [], youtubeId: "",
  documentUrl: "", documentName: "", webLink1Url: "", webLink1Label: "",
  webLink2Url: "", webLink2Label: "", seriesId: null, artworkUrl: "",
  heroStillUrl: "", heroStillCandidates: [], heroCutoutUrl: "", heroFocalX: 50, heroFocalY: 35,
  heroTargetX: DEFAULT_TARGET_X, heroTargetY: DEFAULT_TARGET_Y, heroZoom: DEFAULT_ZOOM,
  canonicalUrl: "", body: "", status: "draft", scheduledAt: "", category: "sermon",
};

function toForm(s: SermonRecord): Form {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    subtitle: s.subtitle ?? "",
    date: s.date ?? "",
    week: s.week != null ? String(s.week) : "",
    description: s.description ?? s.summary ?? "",
    speakers: s.speakers?.length ? s.speakers : s.speaker ? [s.speaker] : [],
    scripture: s.scripture?.length ? s.scripture : s.passage ? [s.passage] : [],
    topics: s.topics ?? [],
    youtubeId: s.youtubeId ?? "",
    documentUrl: s.documentUrl ?? "",
    documentName: s.documentName ?? "",
    webLink1Url: s.webLink1Url ?? "",
    webLink1Label: s.webLink1Label ?? "",
    webLink2Url: s.webLink2Url ?? "",
    webLink2Label: s.webLink2Label ?? "",
    seriesId: s.seriesId ?? null,
    artworkUrl: s.artworkUrl ?? "",
    heroStillUrl: s.heroStillUrl ?? "",
    heroStillCandidates: s.heroStillCandidates ?? [],
    heroCutoutUrl: s.heroCutoutUrl ?? "",
    heroFocalX: s.heroFocalX ?? 50,
    heroFocalY: s.heroFocalY ?? 35,
    heroTargetX: s.heroTargetX ?? DEFAULT_TARGET_X,
    heroTargetY: s.heroTargetY ?? DEFAULT_TARGET_Y,
    heroZoom: s.heroZoom ?? DEFAULT_ZOOM,
    canonicalUrl: s.canonicalUrl ?? "",
    body: s.body ?? "",
    status: s.status ?? (s.published ? "published" : "draft"),
    category: s.category ?? "sermon",
    scheduledAt: s.scheduledAt ? new Date(s.scheduledAt).toISOString().slice(0, 16) : "",
  };
}

// Live preview parse (mirrors parseSermonBody, no server import).
function analyze(body: string) {
  const blocks = body.trim().split(/\n\s*\n/).map((b) => b.trim());
  const sections: { text: string; t: string | null }[] = [];
  let scripture = 0;
  for (const b of blocks) {
    if (b.startsWith("## ")) {
      const rest = b.slice(3).trim();
      const m = /^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*/.exec(rest);
      sections.push({ text: m ? rest.slice(m[0].length) : rest, t: m ? m[1] : null });
    } else if (/^["“]/.test(b) && /ESV\.?$/i.test(b)) {
      scripture += 1;
    }
  }
  const words = body.replace(/^##\s+/gm, "").trim().split(/\s+/).filter(Boolean).length;
  return { sections, scripture, mins: Math.max(1, Math.round(words / 200)) };
}

export default function SermonsEditor({
  initial,
  series,
}: {
  initial: SermonRecord[];
  series: Series[];
}) {
  const [list, setList] = useState<SermonRecord[]>(initial);
  const [listCategory, setListCategory] = useState<Category | "all">("all");
  const shown = useMemo(
    () => (listCategory === "all" ? list : list.filter((s) => (s.category ?? "sermon") === listCategory)),
    [list, listCategory],
  );
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [source, setSource] = useState("");
  const [building, setBuilding] = useState(false);
  const [buildStage, setBuildStage] = useState<string | null>(null);
  const [draftMsg, setDraftMsg] = useState<string | null>(null);

  const preview = useMemo(() => (form ? analyze(form.body) : null), [form?.body]);
  const seriesById = useMemo(() => new Map(series.map((s) => [s.id, s])), [series]);
  const seriesBySlug = useMemo(() => new Map(series.map((s) => [s.slug, s])), [series]);
  const selectedSeries = form?.seriesId != null ? seriesById.get(form.seriesId) : undefined;
  const videoId = form?.youtubeId ? parseYouTubeId(form.youtubeId) : null;

  function edit(s: SermonRecord) {
    setMsg(null);
    setDraftMsg(null);
    setSavedAt(null);
    setSource("");
    setForm(toForm(s));
  }
  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
  }

  async function save() {
    if (!form) return;
    if (!form.title.trim()) {
      setMsg("Title is required.");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        ...form,
        series: form.seriesId != null ? seriesById.get(form.seriesId)?.title ?? "" : "",
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
      };
      const res = await fetch("/api/sermons", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "save failed");
      const all = await fetch("/api/sermons").then((r) => r.json());
      setList(all);
      setMsg("Saved.");
      setSavedAt(
        new Intl.DateTimeFormat("en-US", {
          month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
        }).format(new Date()),
      );
      const saved = (all as SermonRecord[]).find((s) => s.slug === (form.slug || form.title));
      if (saved) setForm(toForm(saved));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!form?.id) return;
    if (!confirm(`Delete "${form.title}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await fetch(`/api/sermons?id=${form.id}`, { method: "DELETE" });
      const all = await fetch("/api/sermons").then((r) => r.json());
      setList(all);
      setForm(null);
      setMsg("Deleted.");
    } finally {
      setSaving(false);
    }
  }

  // Fill the form from a draft (title/subtitle/scripture/topics/description/body).
  function applyDraft(d: {
    title?: string;
    subtitle?: string;
    series?: string;
    passage?: string;
    topics?: string[];
    summary?: string;
    body?: string;
  }) {
    setForm((f) => {
      if (!f) return f;
      const matchedSeries = d.series
        ? series.find((s) => s.title.toLowerCase() === d.series!.trim().toLowerCase())
        : undefined;
      return {
        ...f,
        title: d.title?.trim() || f.title,
        subtitle: d.subtitle?.trim() || f.subtitle,
        description: d.summary?.trim() || f.description,
        scripture: d.passage?.trim() ? Array.from(new Set([d.passage.trim(), ...f.scripture])) : f.scripture,
        topics: d.topics?.length ? Array.from(new Set([...d.topics, ...f.topics])) : f.topics,
        seriesId: matchedSeries ? matchedSeries.id : f.seriesId,
        body: d.body ?? f.body,
      };
    });
  }

  // Prefill series / speaker / date / scripture from the sermon catalog by the
  // pasted YouTube id (livestream or upload). Returns the entry if matched.
  function applyCatalog(rawId: string): CatalogEntry | undefined {
    const id = parseYouTubeId(rawId);
    if (!id) return;
    const c = lookupCatalog(id);
    if (!c) return;
    setForm((f) => {
      if (!f) return f;
      const s = c.seriesSlug ? seriesBySlug.get(c.seriesSlug) : undefined;
      const refs = c.scripture ? c.scripture.split(",").map((x) => x.trim()).filter(Boolean) : [];
      return {
        ...f,
        date: c.date || f.date,
        speakers: c.speaker ? [c.speaker] : f.speakers,
        seriesId: s ? s.id : f.seriesId,
        scripture: refs.length ? Array.from(new Set([...refs, ...f.scripture])) : f.scripture,
      };
    });
    setDraftMsg(`Prefilled from the catalog — ${c.seriesTitle || "series"} · ${c.speaker || "?"} · ${c.date}. Build the article when ready.`);
    return c;
  }

  // One click: video URL -> transcript -> full draft, with staged progress.
  async function buildFromVideo() {
    if (!form) return;
    if (!form.youtubeId.trim()) {
      setDraftMsg("Add the service video link first.");
      return;
    }
    const cat = applyCatalog(form.youtubeId);
    setBuilding(true);
    setDraftMsg(null);
    try {
      setBuildStage("Fetching the transcript… (this can take up to a minute)");
      const tRes = await fetch("/api/sermons/format", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "transcript", youtubeId: form.youtubeId }),
      });
      const tData = await tRes.json().catch(() => ({}));
      if (!tRes.ok || !tData.transcript) {
        if (tData.error === "transcript_not_configured")
          setDraftMsg("The transcript service key isn't set on the server yet.");
        else setDraftMsg("Couldn't get captions for that video. Paste the manuscript or transcript below and format it.");
        return;
      }
      setSource(tData.transcript);

      setBuildStage("Reading the service and drafting the article…");
      const fRes = await fetch("/api/sermons/format", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "format",
          source: tData.transcript,
          title: tData.title,
          speaker: cat?.speaker || form.speakers[0],
        }),
      });
      const fData = await fRes.json().catch(() => ({}));
      if (fRes.ok && fData.body) {
        applyDraft(fData);
        setDraftMsg(
          cat
            ? `Built the draft. Series, speaker (${cat.speaker}), date, and scripture were prefilled from the catalog — review and save.`
            : "Built the draft from the video. Review it, set a date, then save.",
        );
      } else {
        setDraftMsg(draftErrorMessage(fData, "Drafting failed. Try again, or paste the source and format it."));
      }
    } catch {
      setDraftMsg("Build failed. Try the paste-and-format path below.");
    } finally {
      setBuilding(false);
      setBuildStage(null);
    }
  }

  // Format a pasted source (manuscript/transcript) into a full draft.
  async function formatSource() {
    if (!form || !source.trim()) {
      setDraftMsg("Paste a transcript or manuscript first.");
      return;
    }
    setBuilding(true);
    setDraftMsg(null);
    setBuildStage("Reading the source and drafting the article…");
    try {
      const res = await fetch("/api/sermons/format", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "format", source, title: form.title, speaker: form.speakers[0] }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.body) {
        applyDraft(data);
        setDraftMsg("Drafted the whole thing. Review it against the source before saving.");
      } else {
        setDraftMsg(draftErrorMessage(data, "Formatting failed. Try again, or fill it in by hand."));
      }
    } catch {
      setDraftMsg("Formatting failed. Try again, or fill it in by hand.");
    } finally {
      setBuilding(false);
      setBuildStage(null);
    }
  }

  const statusBadge = (st: string, inCode: boolean) =>
    inCode ? (
      <span className="rounded bg-ink/10 px-1.5 py-0.5 text-ink/70">In code</span>
    ) : st === "published" ? (
      <span className="rounded bg-green-600/15 px-1.5 py-0.5 text-green-700">Published</span>
    ) : st === "scheduled" ? (
      <span className="rounded bg-secondary/20 px-1.5 py-0.5 text-ink/70">Scheduled</span>
    ) : (
      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-700">Draft</span>
    );

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      {/* list */}
      <div>
        <button
          type="button"
          onClick={() => { setMsg(null); setDraftMsg(null); setSavedAt(null); setSource(""); setForm({ ...BLANK }); }}
          className="mb-4 w-full rounded-lg bg-primary-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-widest text-white"
        >
          + New piece
        </button>
        <select
          className={`${field} mb-3 text-sm`}
          value={listCategory}
          onChange={(e) => setListCategory(e.target.value as Category | "all")}
          aria-label="Filter by category"
        >
          <option value="all">All categories ({list.length})</option>
          {CATEGORY_ORDER.map((k) => (
            <option key={k} value={k}>
              {CATEGORIES[k].label} ({list.filter((s) => (s.category ?? "sermon") === k).length})
            </option>
          ))}
        </select>
        <ul className="space-y-2">
          {shown.map((s) => (
            <li key={s.slug + String(s.id)}>
              <button
                type="button"
                onClick={() => edit(s)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  form?.slug === s.slug && form?.id === s.id
                    ? "border-secondary bg-secondary/[0.06]"
                    : "border-ink/10 hover:border-ink/25"
                }`}
              >
                <span className="block text-sm font-semibold text-ink">{s.title}</span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-wide">
                  <span className="text-accent">{CATEGORIES[s.category ?? "sermon"].label}</span>
                  {s.series && <span className="text-ink/70">{s.series}</span>}
                  {statusBadge(s.status ?? (s.published ? "published" : "draft"), s.id === null)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* builder */}
      {form ? (
        <div className="space-y-6">
          {/* header bar: breadcrumb + last saved + save */}
          <div className="sticky top-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="truncate text-ink/55">
                {selectedSeries?.title ?? "No series"}
              </span>
              <span aria-hidden className="text-ink/25">/</span>
              <span className="truncate font-semibold text-ink">{form.title || "Untitled sermon"}</span>
            </div>
            <div className="flex items-center gap-3">
              {savedAt ? (
                <span className="hidden text-xs text-ink/55 sm:inline">Last saved on {savedAt}</span>
              ) : msg ? (
                <span className="text-xs font-semibold text-accent">{msg}</span>
              ) : null}
              {form.id && (
                <button type="button" onClick={remove} disabled={saving} className="text-xs font-semibold uppercase tracking-widest text-red-600/80 hover:text-red-600">
                  Delete
                </button>
              )}
              <button type="button" onClick={save} disabled={saving} className="rounded-full bg-primary-deep px-6 py-2 text-sm font-semibold uppercase tracking-widest text-white disabled:opacity-60">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

          {form.id === null && form.slug && (
            <p className="rounded-lg bg-ink/[0.04] p-3 text-sm text-ink/75">
              This sermon lives in code. Saving copies it into the database so you can manage it here.
            </p>
          )}

          <div className="grid gap-6 xl:grid-cols-[1fr_19rem]">
            {/* main column */}
            <div className="min-w-0 space-y-6">
              {/* Build */}
              <div className="rounded-2xl border border-secondary/30 bg-secondary/[0.05] p-5">
                <p className={sectionTitle}>Build from the video</p>
                <p className="mt-0.5 text-xs text-ink/70">
                  Add the service video link and speaker, then Build: it pulls the transcript and drafts
                  the title, subtitle, scripture, topics, description, and the sermon article (the sermon
                  is lifted out of the full service automatically). No captions? Paste the manuscript or
                  transcript below and Format it.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={buildFromVideo}
                    disabled={building || !form.youtubeId.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-primary-deep px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white transition-transform duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {building && (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
                    )}
                    {building ? "Building…" : "Build from video"}
                  </button>
                  <span className="text-xs text-ink/45">or paste below and</span>
                  <button
                    type="button"
                    onClick={formatSource}
                    disabled={building || !source.trim()}
                    className="rounded-full border border-ink/25 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-ink transition-colors hover:border-ink/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Format
                  </button>
                </div>
                {buildStage && (
                  <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-ink/70">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink/25 border-t-ink/70" aria-hidden />
                    {buildStage}
                  </p>
                )}
                <textarea
                  className={`${field} mt-3 min-h-[8rem] resize-y font-mono text-[0.75rem] leading-relaxed`}
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Paste a manuscript or transcript here (only for the paste path, or when a video has no captions)…"
                />
                {draftMsg && !buildStage && <p className="mt-2 text-xs font-semibold text-accent">{draftMsg}</p>}
              </div>

              {/* Basic Info */}
              <div className={section}>
                <p className={sectionTitle}>Basic info</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className={label}>Title</label>
                    <input className={field} value={form.title} onChange={(e) => set("title", e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label}>Subtitle</label>
                      <input className={field} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Category</label>
                      <select className={field} value={form.category} onChange={(e) => set("category", e.target.value as Category)}>
                        {CATEGORY_ORDER.map((k) => (
                          <option key={k} value={k}>{CATEGORIES[k].label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-3">
                      <div>
                        <label className={label}>Date</label>
                        <input type="date" className={field} value={form.date} onChange={(e) => set("date", e.target.value)} />
                      </div>
                      <div className="w-24">
                        <label className={label}>Week</label>
                        <input type="number" min={1} className={field} value={form.week} placeholder="#" onChange={(e) => set("week", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={label}>Description</label>
                    <textarea className={`${field} resize-y`} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
                  </div>
                  <div>
                    <label className={label}>Slug (URL)</label>
                    <input className={field} value={form.slug} placeholder="auto from title" onChange={(e) => set("slug", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className={section}>
                <p className={sectionTitle}>Tags</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className={label}>Speakers</label>
                    <TagInput values={form.speakers} onChange={(v) => set("speakers", v)} placeholder="Add a speaker…" />
                  </div>
                  <div>
                    <label className={label}>Scripture</label>
                    <TagInput values={form.scripture} onChange={(v) => set("scripture", v)} placeholder="e.g. James 5:1-6" />
                  </div>
                  <div>
                    <label className={label}>Topics</label>
                    <TagInput values={form.topics} onChange={(v) => set("topics", v)} placeholder="e.g. Prayer, Trusting God" />
                  </div>
                </div>
              </div>

              {/* Media (the video) */}
              <div className={section}>
                <p className={sectionTitle}>Media</p>
                <p className="mt-0.5 text-xs text-ink/70">The full-service video. Article timestamps map to it.</p>
                <input
                  className={`${field} mt-3`}
                  value={form.youtubeId}
                  placeholder="youtube.com/watch?v=…"
                  onChange={(e) => set("youtubeId", e.target.value)}
                  onBlur={(e) => applyCatalog(e.target.value)}
                />
                <p className="mt-1 text-[0.7rem] text-ink/45">Paste a link and it auto-fills the series, speaker, date, and scripture from the catalog.</p>
                {videoId && (
                  <div className="relative mt-3 aspect-video overflow-hidden rounded-xl bg-primary-deep ring-1 ring-ink/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-primary-deep shadow">
                      <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                    </span>
                    <p className="absolute inset-x-3 bottom-3 truncate text-xs font-semibold text-white/90">
                      youtube.com/watch?v={videoId}
                    </p>
                  </div>
                )}
              </div>

              {/* Document */}
              <div className={section}>
                <p className={sectionTitle}>Document</p>
                <p className="mt-0.5 text-xs text-ink/70">Study or small-group guide.</p>
                <div className="mt-3">
                  <UploadField
                    kind="document"
                    url={form.documentUrl}
                    name={form.documentName}
                    onChange={(url, name) => setForm((f) => (f ? { ...f, documentUrl: url, documentName: name ?? "" } : f))}
                    hint="PDF, Word, or text."
                  />
                </div>
              </div>

              {/* Web links */}
              <div className={section}>
                <p className={sectionTitle}>Web links</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label}>Link 1 label</label>
                    <input className={`${field} mb-2`} value={form.webLink1Label} placeholder="e.g. Register" onChange={(e) => set("webLink1Label", e.target.value)} />
                    <input className={field} value={form.webLink1Url} placeholder="https://…" onChange={(e) => set("webLink1Url", e.target.value)} />
                  </div>
                  <div>
                    <label className={label}>Link 2 label</label>
                    <input className={`${field} mb-2`} value={form.webLink2Label} placeholder="Label" onChange={(e) => set("webLink2Label", e.target.value)} />
                    <input className={field} value={form.webLink2Url} placeholder="https://…" onChange={(e) => set("webLink2Url", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Article body */}
              <div className={section}>
                <div className="flex items-center justify-between gap-3">
                  <p className={sectionTitle}>Article</p>
                  {preview && (
                    <span className="text-right text-xs text-ink/60">
                      {preview.sections.length} sections · {preview.sections.filter((s) => s.t).length} timestamped · {preview.scripture} scripture · {preview.mins} min read
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink/70">
                  Headings: <code>## [mm:ss] Section</code> (timestamp optional). ESV quotes on their own line ending in “…ESV” render as Scripture. Blank line between paragraphs.
                </p>
                <textarea
                  className={`${field} mt-2 min-h-[22rem] font-mono text-[0.8rem] leading-relaxed`}
                  value={form.body}
                  onChange={(e) => set("body", e.target.value)}
                />
              </div>
            </div>

            {/* sidebar */}
            <div className="space-y-5">
              {/* Publish */}
              <div className={section}>
                <div className="flex items-center justify-between">
                  <p className={sectionTitle}>Publish</p>
                  {statusBadge(form.status, false)}
                </div>
                <label className={`${label} mt-4`}>Status</label>
                <select className={`${field} mt-1`} value={form.status} onChange={(e) => set("status", e.target.value as Status)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
                {form.status === "scheduled" && (
                  <div className="mt-3">
                    <label className={label}>Publish at</label>
                    <input type="datetime-local" className={`${field} mt-1`} value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} />
                  </div>
                )}
                <button type="button" onClick={save} disabled={saving} className="mt-4 w-full rounded-full bg-primary-deep px-6 py-2.5 text-sm font-semibold uppercase tracking-widest text-white disabled:opacity-60">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>

              {/* Media series */}
              <div className={section}>
                <p className={sectionTitle}>Media series</p>
                <select
                  className={`${field} mt-3`}
                  value={form.seriesId ?? ""}
                  onChange={(e) => set("seriesId", e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">No series</option>
                  {series.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-ink/55">Manage series on the Series tab.</p>
              </div>

              {/* Speaker portrait (hero) */}
              <div className={section}>
                <p className={sectionTitle}>Speaker portrait</p>
                <p className="mt-0.5 text-xs text-ink/70">Drives the message hero — a good photo of the speaker (graded on the page).</p>
                <div className="mt-3">
                  {form.youtubeId.trim() && (
                    <HeroFramePicker
                      youtubeId={form.youtubeId}
                      onPick={(url) => setForm((f) => (f ? { ...f, heroStillUrl: url, heroCutoutUrl: "" } : f))}
                    />
                  )}
                  {form.heroStillCandidates.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-ink/80">Midpoint frames (tap to use)</p>
                      <div className="mt-1.5 flex gap-2">
                        {form.heroStillCandidates.map((url, i) => (
                          <button
                            key={url}
                            type="button"
                            onClick={() => setForm((f) => (f ? { ...f, heroStillUrl: url, heroCutoutUrl: "" } : f))}
                            className={`relative aspect-video w-24 overflow-hidden rounded-md border-2 transition-colors ${form.heroStillUrl === url ? "border-secondary" : "border-transparent hover:border-ink/25"}`}
                            title={i === 0 ? "one minute before midpoint" : i === 1 ? "service midpoint" : "one minute after midpoint"}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <UploadField
                    kind="hero-still"
                    url={form.heroStillUrl}
                    onChange={(url) => setForm((f) => (f ? { ...f, heroStillUrl: url, heroCutoutUrl: "" } : f))}
                    hint="Landscape works best; the face should be near the top."
                  />
                  {form.heroStillUrl && (
                    <div className="mt-3">
                      <FocusPicker
                        url={form.heroStillUrl}
                        x={form.heroFocalX}
                        y={form.heroFocalY}
                        onChange={(x, y) => setForm((f) => (f ? { ...f, heroFocalX: x, heroFocalY: y } : f))}
                      />
                    </div>
                  )}
                  {form.heroStillUrl && (
                    <CutoutButton
                      stillUrl={form.heroStillUrl}
                      cutoutUrl={form.heroCutoutUrl}
                      seriesBg={selectedSeries?.backgroundUrl}
                      onCutout={(url) => setForm((f) => (f ? { ...f, heroCutoutUrl: url } : f))}
                    />
                  )}
                  {form.heroStillUrl && (
                    <FramingControls
                      src={form.heroCutoutUrl || form.heroStillUrl}
                      seriesBg={selectedSeries?.backgroundUrl}
                      focalX={form.heroFocalX}
                      focalY={form.heroFocalY}
                      targetX={form.heroTargetX}
                      targetY={form.heroTargetY}
                      zoom={form.heroZoom}
                      onChange={(patch) => setForm((f) => (f ? { ...f, ...patch } : f))}
                    />
                  )}
                </div>
              </div>

              {/* Artwork */}
              <div className={section}>
                <p className={sectionTitle}>Artwork</p>
                <p className="mt-0.5 text-xs text-ink/70">1920 × 1080. Used for the card and social image; falls back to the series artwork.</p>
                <div className="mt-3">
                  <UploadField
                    kind="artwork"
                    url={form.artworkUrl}
                    onChange={(url) => set("artworkUrl", url)}
                    hint="Sermon-specific graphic."
                  />
                  {!form.artworkUrl && selectedSeries?.artworkUrl && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs text-ink/55">Using series artwork:</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedSeries.artworkUrl} alt="" className="aspect-video w-full rounded-lg object-cover opacity-90" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[16rem] items-center justify-center rounded-2xl border border-dashed border-ink/15 text-ink/55">
          Pick a sermon to edit, or start a new one.
        </div>
      )}
    </div>
  );
}
