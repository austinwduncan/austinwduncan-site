import Link from "next/link";

/*
  The bright page system (Library, Sermons, Series): white ground, one giant
  Montserrat 800 word in sentence case, a count at the right, a thick black
  rule. Shared so the three sections cannot drift apart.
*/
export const INK = "#171918";
export const GOLD = "#CDB079";
export const GOLD_INK = "#6E5A2E";
export const MIST = "#F4F4F5";
export const FACE = "var(--font-cmg), system-ui, sans-serif";

export const pageStyle = { background: "#FFFFFF", color: INK, fontFamily: FACE } as const;
export const wrap = "mx-auto max-w-[1500px] px-6 lg:px-10";

export const h2Style = {
  fontWeight: 800,
  fontSize: "clamp(2rem, 4.6vw, 4.2rem)",
  lineHeight: 0.92,
  letterSpacing: "-0.045em",
} as const;

export function PageHeader({
  title,
  count,
  countLabel,
  crumbs,
  size = "xl",
}: {
  title: string;
  count?: number;
  countLabel?: string;
  crumbs?: { href?: string; label: string }[];
  /** xl for one short word, lg for a longer title that must wrap. */
  size?: "xl" | "lg";
}) {
  return (
    <div className={`${wrap} pt-10 lg:pt-14`}>
      {crumbs && crumbs.length > 0 && (
        <p className="mb-5 text-[0.9rem] font-semibold">
          {crumbs.map((c, i) => (
            <span key={i}>
              {i > 0 && <span className="px-2" style={{ color: "rgba(23,25,24,0.4)" }}>/</span>}
              {c.href ? (
                <Link href={c.href} className="underline decoration-2 underline-offset-4 hover:no-underline">
                  {c.label}
                </Link>
              ) : (
                <span style={{ color: "rgba(23,25,24,0.6)" }}>{c.label}</span>
              )}
            </span>
          ))}
        </p>
      )}
      <div className="flex items-end justify-between gap-8 pb-8" style={{ borderBottom: `7px solid ${INK}` }}>
        <h1
          className="text-balance"
          style={{
            fontWeight: 800,
            fontSize: size === "xl" ? "clamp(4.2rem, 17vw, 19rem)" : "clamp(2.6rem, 7.4vw, 7.4rem)",
            lineHeight: size === "xl" ? 0.8 : 0.9,
            letterSpacing: size === "xl" ? "-0.06em" : "-0.05em",
            marginLeft: "-0.05em",
          }}
        >
          {title}
        </h1>
        {count != null && (
          <p
            className="hidden shrink-0 pb-1 text-right tabular-nums sm:block"
            style={{ fontWeight: 700, fontSize: "clamp(1.1rem, 2.2vw, 2.2rem)", lineHeight: 1, letterSpacing: "-0.03em" }}
          >
            {count}
            {countLabel && (
              <span className="mt-1 block text-[0.8rem] font-medium tracking-normal" style={{ color: "rgba(23,25,24,0.55)" }}>
                {countLabel}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export function PillLink({ href, children, tone = "ink" }: { href: string; children: React.ReactNode; tone?: "ink" | "outline" | "gold" }) {
  const styles =
    tone === "ink"
      ? { background: INK, color: "#FFFFFF", outlineColor: INK }
      : tone === "gold"
        ? { background: GOLD, color: INK, outlineColor: GOLD }
        : { border: `2px solid ${INK}`, color: INK, outlineColor: INK };
  return (
    <Link
      href={href}
      className="inline-block rounded-full px-8 py-4 text-[0.85rem] font-bold transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={styles}
    >
      {children}
    </Link>
  );
}
