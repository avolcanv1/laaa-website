type PortableTextSpan = { _type?: string; text?: string };

type PortableTextBlock = {
  _type?: string;
  children?: PortableTextSpan[];
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
