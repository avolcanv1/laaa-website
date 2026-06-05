import { defineField, defineType } from "sanity";

/** Imagen de galería con pie de foto en la misma fila. */
export default defineType({
  name: "galleryItem",
  title: "Imagen de galería",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Imagen",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Pie de foto",
      type: "string",
    }),
    defineField({
      name: "alt",
      title: "Texto alternativo",
      type: "string",
    }),
  ],
  preview: {
    select: { caption: "caption", alt: "alt", media: "image" },
    prepare({ caption, alt, media }) {
      return { title: caption || alt || "Imagen", media };
    },
  },
});
