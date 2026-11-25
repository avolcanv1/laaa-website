/** User-facing section titles. */
export const SECTION_LABELS = {
  exposiciones: "Investigación",
  investigacion: "Colaboraciones",
  talleres: "Talleres",
  acerca: "Info",
  tienda: "Laaa tienda",
} as const;

/**
 * URL de cada sección.
 *
 * OJO: las *claves* de este objeto son los identificadores internos
 * heredados ("exposiciones", "investigacion", "acerca"). No se pueden
 * renombrar sin tocar el esquema de Sanity, porque son los nombres de
 * campo del documento `homeNavPreviews`.
 *
 * Los *valores* son las rutas públicas, que ahora sí coinciden con
 * SECTION_LABELS:
 *
 *   clave interna    etiqueta         URL
 *   exposiciones  →  Investigación  → /investigacion
 *   investigacion →  Colaboraciones → /colaboraciones
 *   talleres      →  Talleres       → /talleres
 *   acerca        →  Info           → /info
 *   tienda        →  Laaa tienda    → /tienda
 *
 * Para renombrar una sección basta con cambiar la etiqueta arriba y la
 * ruta aquí. Las rutas viejas siguen funcionando desde App.tsx.
 */
export const SECTION_PATHS = {
  exposiciones: "/investigacion",
  investigacion: "/colaboraciones",
  talleres: "/talleres",
  acerca: "/info",
  tienda: "/tienda",
} as const;

export type SectionLabelKey = keyof typeof SECTION_LABELS;
export type SectionPath = (typeof SECTION_PATHS)[SectionLabelKey];
