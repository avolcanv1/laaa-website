import { defineField } from "sanity";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Campos de cada proyecto en un único formulario (sin metadatos de traducción). */
export const projectDocumentFields = [
  defineField({
    name: "title",
    title: "Título",
    type: "string",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "listDate",
    title: "Fecha",
    description: "Obligatorio. Formato 2026.12.31",
    type: "listDate",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "slug",
    title: "Slug",
    description: "URL del proyecto (ej. /exposiciones/mi-exposicion).",
    type: "slug",
    options: {
      source: "title",
      maxLength: 96,
      slugify,
    },
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "body",
    title: "Descripción",
    description:
      "Cuerpo del proyecto. Pulsa Enter para un párrafo nuevo; Shift+Enter para salto de línea dentro del mismo párrafo.",
    type: "blockContent",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "gallery",
    title: "Galería",
    description:
      "Imágenes del proyecto con pie de foto. Orden editable arrastrando filas. La primera imagen es el hero.",
    type: "array",
    of: [{ type: "galleryItem" }],
    options: {
      layout: "grid",
    },
    validation: (rule) =>
      rule.min(1).error("Añade al menos una imagen antes de publicar."),
  }),
];
