import { defineType } from "sanity";

import { projectDocumentFields } from "./shared/projectDocumentFields";

export default defineType({
  name: "investigacion",
  title: "Investigación y desarrollo",
  type: "document",
  fields: [...projectDocumentFields],
  preview: {
    select: {
      title: "title",
      language: "language",
    },
    prepare({ title, language }) {
      return {
        title: title ?? "Sin título",
        subtitle: language ? String(language).toUpperCase() : undefined,
      };
    },
  },
});
