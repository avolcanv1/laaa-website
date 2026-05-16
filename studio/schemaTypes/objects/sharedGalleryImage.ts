import { defineField, defineType } from "sanity";

/** Imagen compartida entre idiomas (metadatos de traducción). Sin caption — los textos van por idioma en `galleryCaptions`. */
export default defineType({
  name: "sharedGalleryImage",
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
  ],
  preview: {
    select: { media: "image" },
    prepare({ media }) {
      return { title: "Imagen", media };
    },
  },
});
