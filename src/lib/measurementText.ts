import type { PortableTextBlock } from "./portableText";

const MULTIPLICATION = " × ";

/** Replace dimension separators like `15 x 10 cm` with `15 × 10 cm`. */
export function formatMeasurementMultiplication(text: string): string {
  return text.replace(
    /(?<=[\d.)])(?: x | X )(?=[\d.(⌀])/g,
    MULTIPLICATION,
  );
}

export function formatMeasurementInBlocks(
  blocks: PortableTextBlock[] | null | undefined,
): PortableTextBlock[] | undefined {
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
