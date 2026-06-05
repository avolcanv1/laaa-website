export type PortableTextSpan = { _type?: string; text?: string };

export type PortableTextBlock = {
  _type?: string;
  style?: string;
  listItem?: string;
  children?: PortableTextSpan[];
  markDefs?: { _key?: string; _type?: string; href?: string }[];
};

/** Convierte Portable Text a texto plano (párrafos separados por doble salto). */
export function portableTextToPlain(
  blocks: PortableTextBlock[] | null | undefined,
): string {
  if (!blocks?.length) return "";
  return blocks
    .filter((b) => b._type === "block" || !b._type)
    .map((b) =>
      (b.children ?? [])
        .map((c) => c.text ?? "")
        .join(""),
    )
    .filter((p) => p.length > 0)
    .join("\n\n");
}
