"use client";

import { useState } from "react";
import type { Speaker } from "@/lib/speakers";
import type { SermonRecord } from "@/lib/sermons";
import UploadField from "./UploadField";

/*
  Speaker profiles for the Messages section. A speaker is keyed by slug =
  slugify(name), which is exactly how sermon browse links to speakers — so filling
  in a profile here lights up that speaker's page and cards with a photo, role, and
  bio. Guest speakers can be added even before (or without) a sermon.
*/

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

type Form = {
  id: number | null;
  name: string;
  role: string;
  photoUrl: string;
  bio: string;
  sortOrder: number;
  published: boolean;
  slug: string;
};

const field =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/45 outline-none focus:border-secondary";
const label = "block text-xs font-semibold uppercase tracking-wide text-ink/70";
const section = "rounded-2xl border border-ink/10 bg-white p-5";
const sectionTitle = "font-[family-name:var(--font-display)] text-lg tracking-wide text-ink";

const BLANK: Form = { id: null, name: "", role: "", photoUrl: "", bio: "", sortOrder: 0, published: true, slug: "" };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function normalize(r: Row): Speaker {
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

function toForm(s: Speaker): Form {
  return {
    id: s.id,
    name: s.name,
    role: s.role ?? "",
    photoUrl: s.photoUrl ?? "",
    bio: s.bio ?? "",
    sortOrder: s.sortOrder ?? 0,
    published: s.published,
    slug: s.slug,
  };
}

export default function SpeakerManager({
  initial,
  sermons = [],
}: {
  initial: Speaker[];
  sermons?: SermonRecord[];
}) {
  const [list, setList] = useState<Speaker[]>(initial);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Speaker names that appear in sermons but have no profile yet — so Austin can
  // see who still needs one and add them in a click.
  const haveSlugs = new Set(list.map((s) => s.slug));
  const missing = Array.from(
    new Map(
      sermons
        .flatMap((s) => [s.speaker, ...(s.speakers ?? [])])
        .filter(Boolean)
        .map((n) => [slugify(n as string), n as string]),
    ).entries(),
  ).filter(([slug]) => slug && !haveSlugs.has(slug));

  const previewSlug = form ? form.slug || slugify(form.name) : "";
  const count = (slug: string) =>
    sermons.filter((s) => slugify(s.speaker) === slug || (s.speakers ?? []).some((n) => slugify(n) === slug)).length;

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
  }

  async function refetch() {
    const rows: Row[] = await fetch("/api/speakers").then((r) => r.json());
    setList(rows.map(normalize));
    return rows.map(normalize);
  }

  async function save() {
    if (!form?.name.trim()) {
      setMsg("Name is required.");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role,
        photoUrl: form.photoUrl,
        bio: form.bio,
        sortOrder: form.sortOrder,
        published: form.published,
      };
      const res = await fetch(form.id ? `/api/speakers/${form.id}` : "/api/speakers", {
        method: form.id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "save failed");
      const saved = normalize(await res.json());
      const all = await refetch();
      setForm(toForm(all.find((s) => s.id === saved.id) ?? saved));
      setMsg("Saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!form?.id) return;
    if (!confirm(`Delete ${form.name}'s profile? Their messages stay; only the photo/bio go.`)) return;
    setSaving(true);
    try {
      await fetch(`/api/speakers/${form.id}`, { method: "DELETE" });
      await refetch();
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
          onClick={() => { setMsg(null); setForm({ ...BLANK }); }}
          className="mb-4 w-full rounded-lg bg-primary-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-widest text-white"
        >
          + New speaker
        </button>
        <ul className="space-y-2">
          {list.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => { setMsg(null); setForm(toForm(s)); }}
                className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${
                  form?.id === s.id ? "border-secondary bg-secondary/[0.06]" : "border-ink/10 hover:border-ink/25"
                }`}
              >
                {s.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/10 text-xs font-semibold text-ink/50">
                    {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{s.name}</span>
                  <span className="text-[0.7rem] uppercase tracking-wide text-ink/55">
                    {s.published ? s.role || "Speaker" : "Hidden"} · {count(s.slug)} msg
                  </span>
                </span>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="text-sm text-ink/55">No speakers yet.</li>}
        </ul>

        {missing.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">In sermons, no profile</p>
            <ul className="flex flex-wrap gap-1.5">
              {missing.map(([slug, name]) => (
                <li key={slug}>
                  <button
                    type="button"
                    onClick={() => { setMsg(null); setForm({ ...BLANK, name }); }}
                    className="rounded-full border border-dashed border-ink/25 px-2.5 py-1 text-xs text-ink/70 hover:border-secondary hover:text-ink"
                  >
                    + {name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {form ? (
        <div className="space-y-6">
          <div className="sticky top-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
            <span className="truncate text-sm font-semibold text-ink">{form.name || "New speaker"}</span>
            <div className="flex items-center gap-3">
              {msg && <span className="text-xs font-semibold text-accent">{msg}</span>}
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

          <div className="grid gap-6 xl:grid-cols-[1fr_17rem]">
            <div className="min-w-0 space-y-6">
              <div className={section}>
                <p className={sectionTitle}>Profile</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className={label}>Name</label>
                    <input className={field} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Austin W. Duncan" />
                    {previewSlug && (
                      <p className="mt-1 text-xs text-ink/45">
                        Appears at <span className="text-ink/70">/sermons/speakers/{previewSlug}</span>
                        {form.name && ` · ${count(previewSlug)} message${count(previewSlug) === 1 ? "" : "s"} matched`}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={label}>Role</label>
                    <input className={field} value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Lead Pastor, Guest Speaker" />
                  </div>
                  <div>
                    <label className={label}>Bio</label>
                    <textarea className={`${field} resize-y`} rows={5} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="A short paragraph shown on the speaker's page." />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className={section}>
                <div className="flex items-center justify-between">
                  <p className={sectionTitle}>Visibility</p>
                  <span className={`rounded px-1.5 py-0.5 text-[0.7rem] uppercase tracking-wide ${form.published ? "bg-green-600/15 text-green-700" : "bg-amber-500/15 text-amber-700"}`}>
                    {form.published ? "Published" : "Hidden"}
                  </span>
                </div>
                <label className="mt-4 flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
                  Show this speaker publicly
                </label>
                <div className="mt-4">
                  <label className={label}>Sort order</label>
                  <input type="number" className={`${field} mt-1`} value={form.sortOrder} onChange={(e) => set("sortOrder", Math.round(Number(e.target.value) || 0))} />
                  <p className="mt-1 text-xs text-ink/45">Lower shows first (e.g. staff before guests).</p>
                </div>
                <button type="button" onClick={save} disabled={saving} className="mt-4 w-full rounded-full bg-primary-deep px-6 py-2.5 text-sm font-semibold uppercase tracking-widest text-white disabled:opacity-60">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>

              <div className={section}>
                <p className={sectionTitle}>Photo</p>
                <p className="mt-0.5 text-xs text-ink/70">A clean portrait. Square works best (shown as a circle in some places).</p>
                <div className="mt-3">
                  <UploadField kind="speaker" url={form.photoUrl} onChange={(url) => set("photoUrl", url)} hint="Speaker portrait." />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[16rem] items-center justify-center rounded-2xl border border-dashed border-ink/15 text-ink/55">
          Pick a speaker to edit, add a new one, or fill in one that&rsquo;s missing a profile.
        </div>
      )}
    </div>
  );
}
