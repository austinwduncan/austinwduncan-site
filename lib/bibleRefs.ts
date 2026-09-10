/*
  Scripture-reference detection for sermon articles. We linkify references
  ourselves (rather than an external script) so we control the markup, the
  scope, and the interaction: each match becomes a <button.verse-ref> that
  opens our own passage drawer. The book list is the standard set of names and
  common abbreviations; a match requires a chapter:verse so prose numbers and
  times ("6:00") never trip it.
*/

const BOOKS =
  "Genesis|Gen?|Gn|Exodus|Exod?|Ex|Leviticus|Le?v|Numbers|Nu?m|Nu|Deuteronomy|Deut?|Dt|Josh?ua|Josh?|Jsh|Judges|Ju?dg|Jg|Ru(?:th)?|Ru?t|(?:1|i|2|ii) ?Samuel|(?:1|i|2|ii) ?Sam|(?:1|i|2|ii) ?Kin(?:gs?)?|(?:1|i|2|ii) ?Kgs|(?:1|i|2|ii) ?Chronicles|(?:1|i|2|ii) ?Chr(?:o?n)?|Ezra?|Nehemiah|Neh?|Esther|Esth?|Jo?b|Psalms?|Psa?|Proverbs|Pro?v?|Ecclesiastes|Ec(?:cl?)?|Song of Solomon|Song of Songs?|Son(?:gs?)?|Isaiah?|Isa?|Jeremiah|Je?r|Lamentations|La(?:me?)?|Ezekiel|Eze?k?|Daniel|Da?n|Hosea|Hos?|Joel?|Am(?:os)?|Obadiah|Ob(?:ad)?|Jon(?:ah)?|Mic(?:ah)?|Nah?um|Nah?|Habakkuk|Hab|Zephaniah|Ze?ph?|Haggai|Hagg?|Zechariah|Ze?ch?|Malachi|Ma?l|Matthew|Matt?|Mark|Luke?|Lk|John|Jn|Ac(?:ts)?|Romans|Ro?m|(?:1|i|2|ii) ?Corinthians|(?:1|i|2|ii) ?Cor?|Galatians|Gal?|Ephesians|Eph?|Philippians|Phil|Colossians|Co?l|(?:1|i|2|ii) ?Thessalonians|(?:1|i|2|ii) ?Th(?:e(?:ss?)?)?|(?:1|i|2|ii) ?Timothy|(?:1|i|2|ii) ?Tim|Ti(?:tus)?|Philemon|Phl?m|Hebrews|Heb?|Jam(?:es)?|Jas|(?:1|i|2|ii) ?Peter|(?:1|i|2|ii) ?Pe?t|(?:1|i|2|ii|3|iii) ?John|(?:1|i|2|ii|3|iii) ?Jn|Jude|Revelations?|Rev";

// A book, then chapter:verse, optionally a range and a short list (";" / ",").
export const REFERENCE_RE = new RegExp(
  `\\b(?:${BOOKS})\\.?\\s?\\d+:\\d+(?:[-–—]\\d+)?(?:[,;]\\s?\\d+(?:[-–—]\\d+)?)*`,
  "gi",
);

const SKIP = /^(A|BUTTON|H1|H2|H3|H4|H5|H6|CODE|PRE|SCRIPT|STYLE|SVG)$/;

/**
 * Walk a container's text nodes and wrap Scripture references in
 * `<button class="verse-ref" data-ref="...">`. Idempotent per element. Runs
 * client-side after hydration, over static server-rendered article text that
 * React does not re-render, so mutating the DOM here is safe.
 */
export function linkifyReferences(root: HTMLElement): void {
  if (root.dataset.refsLinked) return;
  root.dataset.refsLinked = "1";

  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let p = node.parentElement;
      while (p && p !== root) {
        if (SKIP.test(p.tagName)) return NodeFilter.FILTER_REJECT;
        p = p.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let current: Node | null;
  while ((current = walker.nextNode())) nodes.push(current as Text);

  for (const node of nodes) {
    const text = node.nodeValue ?? "";
    REFERENCE_RE.lastIndex = 0;
    if (!REFERENCE_RE.test(text)) continue;

    REFERENCE_RE.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = REFERENCE_RE.exec(text))) {
      const start = m.index;
      const end = start + m[0].length;
      if (start > last) frag.appendChild(document.createTextNode(text.slice(last, start)));
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "verse-ref";
      btn.setAttribute("data-ref", m[0].trim());
      btn.setAttribute("aria-label", `Read ${m[0].trim()}`);
      btn.textContent = m[0];
      frag.appendChild(btn);
      last = end;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode?.replaceChild(frag, node);
  }
}
