import Link from "next/link";
import type { Sermon } from "@/lib/sermons";
import { pathFor } from "@/lib/categories";
import { INK, GOLD_INK } from "@/components/bright/PageHeader";

export function fmtDate(iso?: string, style: "long" | "short" = "short"): string {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00Z");
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/** A ruled list; rows invert on hover so the whole line reads as the link. */
export function RowList({ children }: { children: React.ReactNode }) {
  return <ul style={{ borderTop: `3px solid ${INK}` }}>{children}</ul>;
}

export function PieceRow({ piece, summary = false, date = true }: { piece: Sermon; summary?: boolean; date?: boolean }) {
  const blurb = piece.summary || piece.description;
  return (
    <li className="break-inside-avoid" style={{ borderBottom: "1px solid rgba(28,36,39,0.16)" }}>
      <Link
        href={pathFor(piece)}
        className="group flex items-baseline justify-between gap-6 px-2 py-4 transition-colors duration-150 hover:bg-[#1C2427] hover:text-white focus-visible:bg-[#1C2427] focus-visible:text-white focus-visible:outline-none"
      >
        <span>
          <span className="block text-[1.08rem] font-semibold leading-snug tracking-[-0.01em] lg:text-[1.15rem]">{piece.title}</span>
          {summary && blurb && (
            <span className="mt-1.5 line-clamp-2 block max-w-[72ch] text-[0.95rem] leading-relaxed opacity-70">{blurb}</span>
          )}
        </span>
        {date && piece.date && (
          <span
            className="hidden shrink-0 text-[0.85rem] font-semibold tabular-nums group-hover:text-[#9DB4C8] group-focus-visible:text-[#9DB4C8] sm:block"
            style={{ color: GOLD_INK }}
          >
            {fmtDate(piece.date)}
          </span>
        )}
      </Link>
    </li>
  );
}
