/** User-facing section titles (routes keep legacy path segments). */
export const SECTION_LABELS = {
  exposiciones: "Investigación",
  investigacion: "Colaboraciones",
  talleres: "Talleres",
  acerca: "Info",
  tienda: "Laaa tienda",
} as const;

export type SectionLabelKey = keyof typeof SECTION_LABELS;
