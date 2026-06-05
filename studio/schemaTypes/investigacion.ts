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
      listDate: "listDate",
      slug: "slug.current",
    },
    prepare({ title, listDate, slug }) {
      const parts = [listDate, slug].filter(Boolean);
      return {
        title: title ?? "Sin título",
        subtitle: parts.length > 0 ? parts.join(" · ") : undefined,
      };
    },
  },
});
