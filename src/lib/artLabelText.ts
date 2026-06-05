import type { PortableTextBlock } from "./portableText";

const DIMENSION_LINE =
  /^[\d.]+(?:\s*(?:×|x)\s*(?:[\d.]+|⌀[\d.]+))+(?:\s*(?:×|x)\s*(?:[\d.]+|⌀[\d.]+))*\s*cm\s*$/i;

const LABEL_CONTEXT =
  /^(Parte de|Desarrollado|Desarrollado|Métodos|Acto |En colaboración|Collective|Rice |UJAT|Escuela|Fabricación digital|Fabricación|Impresión 3d|Impresión 3D)/i;

function blockPlainText(block: PortableTextBlock): string {
  return (block.children ?? []).map((c) => c.text ?? "").join("");
}

function isArtLabelLine(line: string, index: number): boolean {
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

function isArtLabelGroup(lines: string[]): boolean {
  if (lines.length === 0 || lines.length > 8) return false;
  if (!lines.every((line, i) => isArtLabelLine(line, i))) return false;
  return lines.some((line) => DIMENSION_LINE.test(line) || /,\s*\d{4}\s*$/.test(line));
}

function spansForArtLabelLine(line: string, isFirst: boolean): PortableTextBlock["children"] {
  const text = line.trim();
  if (isFirst) {
    const titled = text.match(/^(.+?),\s*(\d{4})\s*$/);
    if (titled) {
      return [
        { _type: "span", text: titled[1]!, marks: ["em"] },
        { _type: "span", text: `, ${titled[2]}`, marks: [] },
      ];
    }
  }
  return [{ _type: "span", text, marks: [] }];
}

function artLabelBlock(
  line: string,
  index: number,
  source: PortableTextBlock,
): PortableTextBlock {
  return {
    ...source,
    _type: "block",
    style: "artLabel",
    markDefs: [],
    children: spansForArtLabelLine(line, index === 0),
  };
}

/** Split newline-joined label blocks into one Panama art-label line per block. */
export function structureArtLabelsInBlocks(
  blocks: PortableTextBlock[] | null | undefined,
): PortableTextBlock[] | undefined {
  if (!blocks?.length) return blocks ?? undefined;

  const out: PortableTextBlock[] = [];

  for (const block of blocks) {
    if (block._type && block._type !== "block") {
      out.push(block);
      continue;
    }
    if (block.style === "artLabel") {
      out.push(block);
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
