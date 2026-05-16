import { defineField, defineType } from "sanity";

/** Una fila de caption/alt alineada por índice con la galería compartida del grupo de traducción. */
export default defineType({
  name: "galleryCaptionRow",
  title: "Pie de foto",
  type: "object",
  fields: [
    defineField({
      name: "caption",
      title: "Pie / caption",
      type: "string",
    }),
    defineField({
      name: "alt",
      title: "Texto alternativo",
      type: "string",
    }),
  ],
  preview: {
    select: { caption: "caption", alt: "alt" },
    prepare({ caption, alt }) {
      return { title: caption || alt || "Sin texto" };
    },
  },
});
