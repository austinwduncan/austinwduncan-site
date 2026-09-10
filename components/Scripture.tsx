/*
  Quoted Scripture, set apart from commentary. This is the sermon reader's most
  important cue: it must be instantly distinguishable from Austin's own words.
  Treatment: a serif block, indented behind a thin brand rule, with the
  reference in a small letterspaced line. Deliberately different from PullQuote
  (which is large, centered display) so the two never read as the same thing.
*/
export default function Scripture({
  reference,
  translation = "ESV",
  children,
}: {
  reference?: string;
  translation?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="my-8 border-l-2 border-secondary/60 pl-6">
      <blockquote className="font-[family-name:var(--font-serif)] text-lg leading-relaxed text-ink/85 [text-wrap:pretty]">
        {children}
      </blockquote>
      {reference && (
        <figcaption className="mt-3 font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.22em] text-accent">
          {reference}
          {translation ? (
            <span className="text-ink/70"> · {translation}</span>
          ) : null}
        </figcaption>
      )}
    </figure>
  );
}
