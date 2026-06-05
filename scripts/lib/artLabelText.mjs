/** @typedef {{ _type?: string; style?: string; children?: { text?: string; marks?: string[] }[]; markDefs?: object[]; _key?: string }} PortableBlock */

import {
  inlineHtmlToSpans,
  normalizeMalformedInlineHtml,
} from "./inlineHtmlToPortableText.mjs";

const DIMENSION_LINE =
  /^[\d.]+(?:\s*(?:×|x)\s*(?:[\d.]+|⌀[\d.]+))+(?:\s*(?:×|x)\s*(?:[\d.]+|⌀[\d.]+))*\s*cm\s*$/i;

const LABEL_CONTEXT =
  /^(Parte de|Desarrollado|Desarrollado|Métodos|Acto |En colaboración|Collective|Rice |UJAT|Escuela|Fabricación digital|Fabricación|Impresión 3d|Impresión 3D)/i;

function blockPlainText(block) {
  return (block.children ?? []).map((c) => c.text ?? "").join("");
}

export function isArtLabelLine(line, index) {
  const t = line.trim();
  if (!t) return false;
  if (/^Para /i.test(t)) return false;
  if (/^En [A-ZÁÉÍÓÚÑ]/i.test(t) && t.length > 80) return false;
  if (t.length > 200 && (t.match(/\. /g)?.length ?? 0) >= 2) return false;
  if (DIMENSION_LINE.test(t)) return true;
  if (LABEL_CONTEXT.test(t)) return true;
  if (index === 0 && /,\s*\d{4}\s*$/.test(t)) return true;
  if (index > 0 && index <= 3 && t.length <= 120) return true;
  return false;
}

function isArtLabelGroup(lines) {
  if (lines.length === 0 || lines.length > 8) return false;
  if (!lines.every((line, i) => isArtLabelLine(line, i))) return false;
  return lines.some((line) => DIMENSION_LINE.test(line) || /,\s*\d{4}\s*$/.test(line));
}

function artLabelRandomKey() {
  return `art_${Math.random().toString(36).slice(2, 9)}`;
}

function spansForArtLabelLine(line, options = {}) {
  const { italicTitle = false } = options;
  let normalized = normalizeMalformedInlineHtml(line.trim());

  if (
    italicTitle &&
    !/<\/?i\b/i.test(normalized) &&
    !/\bi>/i.test(normalized)
  ) {
    const titled = normalized.match(/^(.+?),\s*(\d{4})\s*$/);
    if (titled) {
      normalized = `<i>${titled[1]}</i>, ${titled[2]}`;
    }
  }

  const { children } = inlineHtmlToSpans(normalized, artLabelRandomKey);
  return children;
}

function refreshArtLabelBlock(block) {
  const plain = blockPlainText(block);
  const italicTitle =
    (block.children ?? []).some((child) => child.marks?.includes("em")) ||
    /<\/i>/i.test(plain) ||
    /,\s*\d{4}\s*$/.test(plain);
  return {
    ...block,
    markDefs: [],
    children: spansForArtLabelLine(plain, { italicTitle }),
  };
}

function artLabelBlock(line, index, source) {
  return {
    ...source,
    _type: "block",
    style: "artLabel",
    markDefs: [],
    children: spansForArtLabelLine(line, { italicTitle: index === 0 }),
  };
}

/** Split newline-joined label blocks into one art-label line per block. */
export function structureArtLabelsInBlocks(blocks) {
  if (!blocks?.length) return blocks ?? undefined;

  const out = [];

  for (const block of blocks) {
    if (block._type && block._type !== "block") {
      out.push(block);
      continue;
    }
    if (block.style === "artLabel") {
      out.push(refreshArtLabelBlock(block));
      continue;
    }

    const plain = blockPlainText(block);
    if (!plain.includes("\n")) {
      out.push(block);
      continue;
    }

    const lines = plain
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (!isArtLabelGroup(lines)) {
      out.push(block);
      continue;
    }

    for (let i = 0; i < lines.length; i++) {
      out.push(artLabelBlock(lines[i], i, block));
    }
  }

  return out;
}
