"use client";

import { useState } from "react";
import type { Series } from "@/lib/series";
import type { SermonRecord } from "@/lib/sermons";
import UploadField from "./UploadField";

/*
  Sermon series manager (Subsplash "Media Series"), two-column like the Subsplash
  series editor: the main column holds Basic info and the list of sermons in the
  series; the right sidebar holds Save, Publish status, and the 1920x1080 artwork.
  Sermons link to a series and inherit its artwork when they have none of their own.
*/

type Form = {
  id: number | null;
  slug: string;
  title: string;
  subtitle: string;
  startsOn: string;
  endsOn: string;
  description: string;
  artworkUrl: string;
  bannerUrl: string;
  backgroundUrl: string;
  status: "published" | "draft" | "scheduled";
  scheduledAt: string;
};

const field =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/45 outline-none focus:border-secondary";
const label = "block text-xs font-semibold uppercase tracking-wide text-ink/70";
const section = "rounded-2xl border border-ink/10 bg-white p-5";
const sectionTitle = "font-[family-name:var(--font-display)] text-lg tracking-wide text-ink";

const BLANK: Form = {
  id: null, slug: "", title: "", subtitle: "", startsOn: "", endsOn: "", description: "", artworkUrl: "", bannerUrl: "", backgroundUrl: "", status: "draft", scheduledAt: "",
};

function toForm(s: Series): Form {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    subtitle: s.subtitle ?? "",
    startsOn: s.startsOn ?? "",
    endsOn: s.endsOn ?? "",
    description: s.description ?? "",
    artworkUrl: s.artworkUrl ?? "",
    bannerUrl: s.bannerUrl ?? "",
    backgroundUrl: s.backgroundUrl ?? "",
    status: s.status,
    scheduledAt: s.scheduledAt ? new Date(s.scheduledAt).toISOString().slice(0, 16) : "",
  };
}

export default function SeriesManager({
  initial,
  sermons = [],
  onChanged,
}: {
  initial: Series[];
  sermons?: SermonRecord[];
  onChanged?: (list: Series[]) => void;
}) {
  const [list, setList] = useState<Series[]>(initial);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Sermons that belong to the series being edited (matched by id, then title).
  const members =
    !form?.id && !form?.title
      ? []
      : sermons.filter(
          (s) =>
            (form!.id != null && s.seriesId === form!.id) ||
            (!!form!.title && (s.seriesTitle ?? s.series)?.toLowerCase() === form!.title.toLowerCase()),
        );

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
  }

  async function save() {
    if (!form?.title.trim()) {
      setMsg("Title is required.");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        ...form,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
      };
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "save failed");
      const all: Series[] = await fetch("/api/series").then((r) => r.json());
      setList(all);
      onChanged?.(all);
      setMsg("Saved.");
      setSavedAt(
        new Intl.DateTimeFormat("en-US", {
          month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
        }).format(new Date()),
      );
      const saved = all.find((s) => s.slug === (form.slug || form.title));
      if (saved) setForm(toForm(saved));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!form?.id) return;
    if (!confirm(`Delete series "${form.title}"? Sermons in it keep their own artwork.`)) return;
    setSaving(true);
    try {
      await fetch(`/api/series?id=${form.id}`, { method: "DELETE" });
      const all: Series[] = await fetch("/api/series").then((r) => r.json());
      setList(all);
      onChanged?.(all);
      setForm(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      {/* list */}
      <div>
        <button
          type="button"
          onClick={() => { setMsg(null); setSavedAt(null); setForm({ ...BLANK }); }}
          className="mb-4 w-full rounded-lg bg-primary-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-widest text-white"
        >
          + New series
        </button>
        <ul className="space-y-2">
          {list.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => { setMsg(null); setSavedAt(null); setForm(toForm(s)); }}
                className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${
                  form?.id === s.id ? "border-secondary bg-secondary/[0.06]" : "border-ink/10 hover:border-ink/25"
                }`}
              >
                {s.artworkUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.artworkUrl} alt="" className="h-10 w-[4.4rem] shrink-0 rounded object-cover" />
                ) : (
                  <span className="h-10 w-[4.4rem] shrink-0 rounded bg-ink/10" />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{s.title}</span>
                  <span className="text-[0.7rem] uppercase tracking-wide text-ink/55">{s.status}</span>
                </span>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="text-sm text-ink/55">No series yet.</li>}
        </ul>
      </div>

      {form ? (
        <div className="space-y-6">
          {/* header bar */}
          <div className="sticky top-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
            <span className="truncate text-sm font-semibold text-ink">{form.title || "Untitled series"}</span>
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

          <div className="grid gap-6 xl:grid-cols-[1fr_19rem]">
            {/* main */}
            <div className="min-w-0 space-y-6">
              <div className={section}>
                <p className={sectionTitle}>Basic info</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className={label}>Title</label>
                    <input className={field} value={form.title} onChange={(e) => set("title", e.target.value)} />
                  </div>
                  <div>
                    <label className={label}>Scripture</label>
                    <input className={field} value={form.subtitle} placeholder="e.g. James 1-5" onChange={(e) => set("subtitle", e.target.value)} />
                    <p className="mt-1 text-xs text-ink/45">The passage(s) this series covers.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label}>Starts</label>
                      <input type="date" className={field} value={form.startsOn} onChange={(e) => set("startsOn", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Ends</label>
                      <input type="date" className={field} value={form.endsOn} onChange={(e) => set("endsOn", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={label}>Description</label>
                    <textarea className={`${field} resize-y`} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* sermons in this series */}
              <div className={section}>
                <div className="flex items-center justify-between">
                  <p className={sectionTitle}>Sermons</p>
                  <span className="text-xs text-ink/55">{members.length} in this series</span>
                </div>
                {members.length > 0 ? (
                  <ul className="mt-4 divide-y divide-ink/10">
                    {members.map((s) => (
                      <li key={s.slug + String(s.id)} className="flex items-center gap-3 py-2.5">
                        <span className="flex h-11 w-[4.9rem] shrink-0 items-center justify-center overflow-hidden rounded bg-ink/10">
                          {(s.artworkUrl ?? s.seriesArtworkUrl ?? (s.youtubeId ? `https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg` : "")) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={s.artworkUrl ?? s.seriesArtworkUrl ?? `https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg`}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink">{s.title}</span>
                          <span className="text-xs text-ink/55">
                            {[s.date, s.speaker].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-ink/55">
                    No sermons yet. Assign one to this series from the Sermons tab (Media series).
                  </p>
                )}
              </div>
            </div>

            {/* sidebar */}
            <div className="space-y-5">
              <div className={section}>
                <div className="flex items-center justify-between">
                  <p className={sectionTitle}>Publish</p>
                  <span className={`rounded px-1.5 py-0.5 text-[0.7rem] uppercase tracking-wide ${
                    form.status === "published" ? "bg-green-600/15 text-green-700"
                    : form.status === "scheduled" ? "bg-secondary/20 text-ink/70"
                    : "bg-amber-500/15 text-amber-700"
                  }`}>{form.status}</span>
                </div>
                <label className={`${label} mt-4`}>Status</label>
                <select className={`${field} mt-1`} value={form.status} onChange={(e) => set("status", e.target.value as Form["status"])}>
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

              <div className={section}>
                <p className={sectionTitle}>Artwork</p>
                <p className="mt-0.5 text-xs text-ink/70">1920 × 1080 (16:9). Sermons without their own art use this.</p>
                <div className="mt-3">
                  <UploadField kind="artwork" url={form.artworkUrl} onChange={(url) => set("artworkUrl", url)} hint="Series graphic." />
                </div>
                <p className={`${sectionTitle} mt-5`}>Banner</p>
                <p className="mt-0.5 text-xs text-ink/70">Wide banner for the series page header. Falls back to the artwork if empty.</p>
                <div className="mt-3">
                  <UploadField kind="artwork" url={form.bannerUrl} onChange={(url) => set("bannerUrl", url)} hint="Wide banner image." />
                </div>
              </div>

              <div className={section}>
                <p className={sectionTitle}>Hero background</p>
                <p className="mt-0.5 text-xs text-ink/70">Composited behind the speaker on every message hero and thumbnail. A wide, cinematic 16:9 image works best. Only messages that have a speaker photo show it; a background-removed cut-out sits over it most cleanly.</p>
                <div className="mt-3">
                  <UploadField kind="hero-background" url={form.backgroundUrl} onChange={(url) => set("backgroundUrl", url)} hint="Series background." />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[16rem] items-center justify-center rounded-2xl border border-dashed border-ink/15 text-ink/55">
          Pick a series to edit, or create a new one.
        </div>
      )}
    </div>
  );
}
