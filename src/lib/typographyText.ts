import type { PortableTextBlock } from "./portableText";
import { formatMeasurementMultiplication } from "./measurementText";

const EN_DASH = "–";
const PLACEHOLDER = "\uE000";

/** Hyphen-minus or em dash used as punctuation → en dash. Keeps name/compound hyphens. */
export function formatEnDashes(text: string): string {
  const protectedSpans: string[] = [];

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

export function formatEnDashesInBlocks(
  blocks: PortableTextBlock[] | null | undefined,
): PortableTextBlock[] | undefined {
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

export function formatBodyTypography(text: string): string {
  return formatEnDashes(formatMeasurementMultiplication(text));
}
