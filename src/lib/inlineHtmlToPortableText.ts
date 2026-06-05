import type { PortableTextBlock } from "./portableText";

type PortableSpan = { _type?: string; text?: string; marks?: string[] };

/** Source txt files often use `<i>Title<i>` instead of `</i>`. Normalize before parsing. */
export function normalizeMalformedInlineHtml(html: string): string {
  let s = html;

  s = s.replace(/<i>([\s\S]*?)<i>/gi, "<i>$1</i>");
  s = s.replace(/<b>([\s\S]*?)<b>/gi, "<b>$1</b>");
  s = s.replace(/<\/,/g, "</i>,");
  s = s.replace(/<\/(\s|$)/g, "</i>$1");
  s = s.replace(/(^|[^<])i>([\s\S]*?)i>/g, "$1<i>$2</i>");
  s = s.replace(/(^|[^<])i>([\s\S]*?)<\/,/g, "$1<i>$2</i>,");

  // Orphan `</i>` without `<i>` — italicize the preceding text run (idempotent)
  s = s.replace(/([^<]+)<\/i>/gi, (match, inner, offset, whole) => {
    const before = whole.slice(0, offset);
    if (/<i[^>]*>[^<]*$/i.test(before + inner)) return match;
    if (before.endsWith("<")) return match;
    return `<i>${inner}</i>`;
  });

  return s;
}

function normalizeHref(href: string): string {
  const h = href.trim().replace(/^["']|["']$/g, "");
  if (!h || h === "catalgo") return "https://laaa.mx";
  if (/^mailto:/i.test(h) || /^https?:\/\//i.test(h)) return h;
  return `https://${h}`;
}

function randomKey(): string {
  return `${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`;
}

function inlineHtmlToSpans(html: string): {
  children: PortableSpan[];
  markDefs: NonNullable<PortableTextBlock["markDefs"]>;
} {
  const normalized = normalizeMalformedInlineHtml(html);
  const children: PortableSpan[] = [];
  const markDefs: NonNullable<PortableTextBlock["markDefs"]> = [];
  let i = 0;

  function pushText(text: string, marks: string[] = []) {
    if (!text) return;
    children.push({ _type: "span", text, marks: [...marks] });
  }

  while (i < normalized.length) {
    const rest = normalized.slice(i);
    const tag = rest.match(/^<(i|b|a)(?:\s+href=([^>]*))?>([\s\S]*?)<\/\1>/i);
    if (tag) {
      const [, kind, href, inner] = tag;
      if (kind === "i") {
        const innerSpans = inlineHtmlToSpans(inner);
        for (const c of innerSpans.children) {
          children.push({ ...c, marks: [...(c.marks ?? []), "em"] });
        }
        markDefs.push(...innerSpans.markDefs);
      } else if (kind === "b") {
        const innerSpans = inlineHtmlToSpans(inner);
        for (const c of innerSpans.children) {
          children.push({ ...c, marks: [...(c.marks ?? []), "strong"] });
        }
        markDefs.push(...innerSpans.markDefs);
      } else if (kind === "a") {
        const key = randomKey();
        markDefs.push({ _type: "link", _key: key, href: normalizeHref(href ?? "") });
        const innerSpans = inlineHtmlToSpans(inner);
        for (const c of innerSpans.children) {
          children.push({ ...c, marks: [...(c.marks ?? []), key] });
        }
      }
      i += tag[0].length;
      continue;
    }

    const nextTag = rest.search(/<(i|b|a)\b/i);
    if (nextTag === -1) {
      pushText(rest);
      break;
    }
    if (nextTag > 0) {
      pushText(rest.slice(0, nextTag));
      i += nextTag;
      continue;
    }

    pushText("<");
    i += 1;
  }

  if (children.length === 0) children.push({ _type: "span", text: "", marks: [] });
  return { children, markDefs };
}

function dedupeLinkMarkDefs(
  markDefs: NonNullable<PortableTextBlock["markDefs"]>,
): NonNullable<PortableTextBlock["markDefs"]> {
  const unique: NonNullable<PortableTextBlock["markDefs"]> = [];
  const seen = new Set<string>();
  for (const def of markDefs) {
    if (def._type === "link" && def._key && !seen.has(def._key)) {
      seen.add(def._key);
      unique.push(def);
    }
  }
  return unique;
}

function blockNeedsItalicRepair(plain: string): boolean {
  return (
    /\bi>/.test(plain) ||
    /<\/,/.test(plain) ||
    /<\/i>/i.test(plain) ||
    /<i>[\s\S]*?<i>/i.test(plain)
  );
}

/** Parse inline HTML / broken italic markers into Portable Text spans. */
export function parseInlineHtmlToSpans(html: string): {
  children: PortableSpan[];
  markDefs: NonNullable<PortableTextBlock["markDefs"]>;
} {
  return inlineHtmlToSpans(html);
}

/** Re-parse blocks that contain broken `i>` italic markers from earlier imports. */
export function repairPortableTextBlocks(
  blocks: PortableTextBlock[] | null | undefined,
): PortableTextBlock[] | undefined {
  if (!blocks?.length) return blocks ?? undefined;

  return blocks.map((block) => {
    if (block._type && block._type !== "block") return block;
    const plain = (block.children ?? []).map((c) => c.text ?? "").join("");
    if (!blockNeedsItalicRepair(plain)) return block;

    const { children, markDefs } = inlineHtmlToSpans(plain);
    return {
      ...block,
      children,
      markDefs: dedupeLinkMarkDefs([...(block.markDefs ?? []), ...markDefs]),
    };
  });
}
