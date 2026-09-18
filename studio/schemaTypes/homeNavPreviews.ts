import { defineField, defineType } from "sanity";

export const HOME_NAV_PREVIEWS_DOCUMENT_ID = "homeNavPreviews";

export default defineType({
  name: "homeNavPreviews",
  title: "Inicio — hovers del menú",
  type: "document",
  fields: [
    defineField({
      name: "exposiciones",
      title: "Investigación",
      type: "navSectionHoverItem",
    }),
    defineField({
      name: "investigacion",
      title: "Colaboraciones",
      type: "navSectionHoverItem",
    }),
    defineField({
      name: "talleres",
      title: "Talleres",
      type: "navSectionHoverItem",
    }),
    defineField({
      name: "acerca",
      title: "Info",
      type: "navSectionHoverItem",
    }),
    defineField({
      name: "tienda",
      title: "Laaa tienda",
      type: "navSectionHoverItem",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Inicio — hovers del menú" };
    },
  },
});
