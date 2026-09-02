import { defineField, defineType } from "sanity";

export const ACERCA_PAGE_DOCUMENT_ID = "acercaPage";

export default defineType({
  name: "acercaPage",
  title: "Acerca",
  type: "document",
  fields: [
    defineField({
      name: "paragraphs",
      title: "Párrafos",
      type: "array",
      of: [{ type: "text", rows: 4 }],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "contactEmail",
      title: "Correo",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "instagramHandle",
      title: "Instagram (texto visible)",
      description: "Ej. @laaa_mx",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "instagramUrl",
      title: "URL de Instagram",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "address",
      title: "Dirección",
      description: "Una línea por renglón visible en el sitio.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Imagen principal",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroAlt",
      title: "Texto alternativo (imagen)",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Acerca" };
    },
  },
});
