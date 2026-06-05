import { defineField, defineType } from "sanity";

/** Imagen + pie de foto para el hover de una sección en la portada. */
export default defineType({
  name: "navSectionHoverItem",
  title: "Hover de sección",
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
      description: "Texto que aparece debajo de la imagen al pasar el cursor sobre la sección.",
      type: "string",
    }),
    defineField({
      name: "layout",
      title: "Proporción",
      type: "string",
      options: {
        list: [
          { title: "Vertical (35%)", value: "vertical" },
          { title: "Horizontal (50%)", value: "horizontal" },
        ],
        layout: "radio",
      },
      initialValue: "horizontal",
    }),
    defineField({
      name: "overlayColor",
      title: "Color de tinte",
      description: "Hex, ej. #82781b (oliva) o #1836e3 (tienda).",
      type: "string",
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true;
          return /^#[0-9a-fA-F]{6}$/.test(String(value))
            ? true
            : "Usa un color hex, ej. #82781b";
        }),
    }),
  ],
  preview: {
    select: { caption: "caption", media: "image" },
    prepare({ caption, media }) {
      return { title: caption || "Hover de sección", media };
    },
  },
});
