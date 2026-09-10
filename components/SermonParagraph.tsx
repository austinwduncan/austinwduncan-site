import type { ReactNode } from "react";

/*
  Renders one paragraph block of a sermon body.

  Sermon bodies are plain text split on blank lines, but the sermons imported
  from this site's old MDX files carry light Markdown: **bold**, *italic*,
  [links](url) and line breaks inside a block (lists). This renders those
  inline marks and leaves everything else as text, so a body written by hand
  or by the formatter still displays exactly as typed.
*/

const TOKEN = /(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) {
      out.push(<strong key={key} className="font-semibold text-ink">{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("[")) {
      const lm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      if (lm) {
        const external = /^https?:\/\//.test(lm[2]);
        out.push(
          <a key={key} href={lm[2]} className="underline decoration-accent/50 underline-offset-2 hover:text-accent" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {lm[1]}
          </a>,
        );
      } else {
        out.push(tok);
      }
    } else {
      out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    }
    last = start + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function SermonParagraph({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const isQuote = lines.every((l) => l.startsWith("> ") || l.trim() === "");
  const cleaned = isQuote ? lines.map((l) => l.replace(/^> ?/, "")) : lines;
  const body = cleaned.flatMap((line, li) => {
    const nodes = inline(line.replace(/^[-*] /, "• "), `l${li}`);
    return li < cleaned.length - 1 ? [...nodes, <br key={`br${li}`} />] : nodes;
  });
  if (isQuote) {
    return (
      <blockquote className={`${className ?? ""} border-l-2 border-accent/40 pl-5 italic text-ink/75`}>
        {body}
      </blockquote>
    );
  }
  return <p className={className}>{body}</p>;
}
