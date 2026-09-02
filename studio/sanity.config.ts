import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./schemaDefinitions";
import { ACERCA_PAGE_DOCUMENT_ID } from "./schemaTypes/acercaPage";
import { HOME_NAV_PREVIEWS_DOCUMENT_ID } from "./schemaTypes/homeNavPreviews";

export default defineConfig({
  title: "LAAA CMS",
  projectId: "xz3cmhei",
  dataset: "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Contenido")
          .items([
            S.listItem()
              .title("Inicio — hovers del menú")
              .id(HOME_NAV_PREVIEWS_DOCUMENT_ID)
              .child(
                S.document()
                  .schemaType("homeNavPreviews")
                  .documentId(HOME_NAV_PREVIEWS_DOCUMENT_ID),
              ),
            S.listItem()
              .title("Acerca")
              .id(ACERCA_PAGE_DOCUMENT_ID)
              .child(
                S.document()
                  .schemaType("acercaPage")
                  .documentId(ACERCA_PAGE_DOCUMENT_ID),
              ),
            S.divider(),
            S.documentTypeListItem("exhibition").title("Exposiciones"),
            S.documentTypeListItem("investigacion").title("Investigación"),
            S.documentTypeListItem("taller").title("Talleres"),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
