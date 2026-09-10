import type { Tile } from "@/lib/browse";

/* Topic chips linking to the cross-cutting topic pages. */
export default function TopicChips({ topics, className = "" }: { topics: Tile[]; className?: string }) {
  if (topics.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {topics.map((t) => (
        <a
          key={t.slug}
          href={`/library/topics/${t.slug}`}
          className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-secondary"
        >
          {t.label} <span className="text-white/40">{t.count}</span>
        </a>
      ))}
    </div>
  );
}
