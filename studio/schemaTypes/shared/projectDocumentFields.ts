import { defineField } from "sanity";

/** Campos por idioma en cada documento localizado (slug/fecha/galería están en metadatos de traducción). */
export const projectDocumentFields = [
  defineField({
    name: "language",
    title: "Idioma",
    type: "string",
    readOnly: true,
    hidden: true,
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "title",
    title: "Título",
    type: "string",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "body",
    title: "Texto de ficha",
    description: "Cuerpo del proyecto (Portable Text).",
    type: "blockContent",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "galleryCaptions",
    title: "Pies de foto y textos alt",
    description:
      "Un elemento por cada imagen de la galería compartida del mismo grupo de traducción (mismo orden).",
    type: "array",
    of: [{ type: "galleryCaptionRow" }],
  }),
];
