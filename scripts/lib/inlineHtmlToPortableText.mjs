/** Replace dimension separators like `15 x 10 cm` with `15 × 10 cm`. */
export function formatMeasurementMultiplication(text) {
  return text.replace(
    /(?<=[\d.)])(?: x | X )(?=[\d.(⌀])/g,
    " × ",
  );
}

/**
 * @param {PortableBlock[] | null | undefined} blocks
 */
export function formatMeasurementInBlocks(blocks) {
  if (!blocks?.length) return blocks ?? undefined;

  return blocks.map((block) => {
    if (block._type && block._type !== "block") return block;
    const children = (block.children ?? []).map((span) => {
      const text = span.text ?? "";
      const next = formatMeasurementMultiplication(text);
      return next === text ? span : { ...span, text: next };
    });
    return { ...block, children };
  });
}

import { isArtLabelLine } from "./artLabelText.mjs";
/** @typedef {{ _type?: string; style?: string; children?: PortableSpan[]; markDefs?: object[]; _key?: string }} PortableBlock */

const EN_DASH = "–";
const PLACEHOLDER = "\uE000";

/** Hyphen-minus or em dash used as punctuation → en dash. Keeps name/compound hyphens. */
export function formatEnDashes(text) {
  const protectedSpans = [];

  let s = text.replace(/\p{L}+-\p{L}+/gu, (match) => {
    const token = `${PLACEHOLDER}${protectedSpans.length}${PLACEHOLDER}`;
    protectedSpans.push(match);
    return token;
  });

  s = s
    .replace(/—/g, EN_DASH)
    .replace(/\s--\s/g, ` ${EN_DASH} `)
    .replace(/\s-\s/g, ` ${EN_DASH} `)
    .replace(/\s-(?=\p{L})/gu, ` ${EN_DASH} `);

  return s.replace(
    new RegExp(`${PLACEHOLDER}(\\d+)${PLACEHOLDER}`, "g"),
    (_, index) => protectedSpans[Number(index)] ?? "",
  );
}

/**
 * @param {PortableBlock[] | null | undefined} blocks
 */
export function formatEnDashesInBlocks(blocks) {
  if (!blocks?.length) return blocks ?? undefined;

  return blocks.map((block) => {
    if (block._type && block._type !== "block") return block;
    const children = (block.children ?? []).map((span) => {
      const text = span.text ?? "";
      const next = formatEnDashes(text);
      return next === text ? span : { ...span, text: next };
    });
    return { ...block, children };
  });
}

export function formatBodyTypography(text) {
  return formatEnDashes(formatMeasurementMultiplication(text));
}

/**
 * Source txt files often use `<i>Title<i>` instead of `</i>`, or the parser strips `<`
 * leaving `i>Titlei>`. Normalize before parsing to Portable Text.
 */
export function normalizeMalformedInlineHtml(html) {
  let s = html;

  // `<i>foo<i>` / `<b>foo<b>` mistaken closing tags in source files
  s = s.replace(/<i>([\s\S]*?)<i>/gi, "<i>$1</i>");
  s = s.replace(/<b>([\s\S]*?)<b>/gi, "<b>$1</b>");

  // Truncated closes: `</,` or `</` at end
  s = s.replace(/<\/,/g, "</i>,");
  s = s.replace(/<\/(\s|$)/g, "</i>$1");

  // Already-ingested broken form (leading `<` was dropped)
  s = s.replace(/(^|[^<])i>([\s\S]*?)i>/g, "$1<i>$2</i>");
  s = s.replace(/(^|[^<])i>([\s\S]*?)<\/,/g, "$1<i>$2</i>,");

  return s;
}

function normalizeHref(href) {
  const h = href.trim().replace(/^["']|["']$/g, "");
  if (!h || h === "catalgo") return "https://laaa.mx";
  if (/^mailto:/i.test(h) || /^https?:\/\//i.test(h)) return h;
  return `https://${h}`;
}

/**
 * @param {string} html
 * @param {() => string} randomKey
 */
export function inlineHtmlToSpans(html, randomKey) {
  const normalized = normalizeMalformedInlineHtml(html);
  /** @type {PortableSpan[]} */
  const children = [];
  /** @type {object[]} */
  const markDefs = [];
  let i = 0;

  function pushText(text, marks = []) {
    if (!text) return;
    children.push({ _type: "span", text, marks: [...marks] });
  }

  while (i < normalized.length) {
    const rest = normalized.slice(i);
    const tag = rest.match(/^<(i|b|a)(?:\s+href=([^>]*))?>([\s\S]*?)<\/\1>/i);
    if (tag) {
      const [, kind, href, inner] = tag;
      if (kind === "i") {
        const innerSpans = inlineHtmlToSpans(inner, randomKey);
        for (const c of innerSpans.children) {
          children.push({ ...c, marks: [...(c.marks || []), "em"] });
        }
        markDefs.push(...innerSpans.markDefs);
      } else if (kind === "b") {
        const innerSpans = inlineHtmlToSpans(inner, randomKey);
        for (const c of innerSpans.children) {
          children.push({ ...c, marks: [...(c.marks || []), "strong"] });
        }
        markDefs.push(...innerSpans.markDefs);
      } else if (kind === "a") {
        const key = randomKey();
        markDefs.push({
          _type: "link",
          _key: key,
          href: normalizeHref(href || ""),
        });
        const innerSpans = inlineHtmlToSpans(inner, randomKey);
        for (const c of innerSpans.children) {
          children.push({ ...c, marks: [...(c.marks || []), key] });
        }
        markDefs.push(...innerSpans.markDefs.filter((d) => d._type === "link"));
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

function dedupeLinkMarkDefs(markDefs) {
  const unique = [];
  const seen = new Set();
  for (const def of markDefs) {
    if (def._type === "link" && !seen.has(def._key)) {
      seen.add(def._key);
      unique.push(def);
    }
  }
  return unique;
}

/**
 * @param {string} bodyRaw
 * @param {() => string} randomKey
 * @returns {PortableBlock[]}
 */
export function bodyRawToPortableText(bodyRaw, randomKey) {
  if (!bodyRaw.trim()) {
    return [
      {
        _type: "block",
        _key: randomKey(),
        style: "normal",
        children: [{ _type: "span", text: "", marks: [] }],
        markDefs: [],
      },
    ];
  }

  const blocks = [];

  for (const section of bodyRaw.split(/\n\s*--\s*\n/)) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    const lines = trimmed
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let i = 0;
    while (i < lines.length && isArtLabelLine(lines[i], i)) {
      const { children, markDefs } = inlineHtmlToSpans(
        formatBodyTypography(lines[i]),
        randomKey,
      );
      blocks.push({
        _type: "block",
        _key: randomKey(),
        style: "artLabel",
        children,
        markDefs: dedupeLinkMarkDefs(markDefs),
      });
      i += 1;
    }

    const prose = lines.slice(i).join("\n\n").trim();
    if (!prose) continue;

    for (const paragraph of prose
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)) {
      const { children, markDefs } = inlineHtmlToSpans(
        formatBodyTypography(paragraph),
        randomKey,
      );
      blocks.push({
        _type: "block",
        _key: randomKey(),
        style: "normal",
        children,
        markDefs: dedupeLinkMarkDefs(markDefs),
      });
    }
  }

  return blocks;
}

function blockNeedsItalicRepair(plain) {
  return (
    /\bi>/.test(plain) ||
    /<\/,/.test(plain) ||
    /<i>[\s\S]*?<i>/i.test(plain)
  );
}

/**
 * @param {PortableBlock[] | null | undefined} blocks
 * @param {() => string} randomKey
 */
export function repairPortableTextBlocks(blocks, randomKey) {
  if (!blocks?.length) return blocks ?? undefined;

  return blocks.map((block) => {
    if (block._type && block._type !== "block") return block;
    const plain = (block.children ?? []).map((c) => c.text ?? "").join("");
    if (!blockNeedsItalicRepair(plain)) return block;

    const { children, markDefs } = inlineHtmlToSpans(plain, randomKey);
    return {
      ...block,
      children,
      markDefs: dedupeLinkMarkDefs([...(block.markDefs ?? []), ...markDefs]),
    };
  });
}
