import {
  documentInternationalization,
  useDeleteTranslationAction,
  useDuplicateWithTranslationsAction,
} from "@sanity/document-internationalization";
import { defineConfig, defineField } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./schemaDefinitions";

const translatedSchemaTypes = ["exhibition", "investigacion", "taller"] as const;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
            S.documentTypeListItem("exhibition").title("Exposiciones"),
            S.documentTypeListItem("investigacion").title("Investigación"),
            S.documentTypeListItem("taller").title("Talleres"),
          ]),
    }),
    documentInternationalization({
      supportedLanguages: [
        { id: "es", title: "Español" },
        { id: "en", title: "English" },
      ],
      schemaTypes: [...translatedSchemaTypes],
      metadataFields: [
        defineField({
          name: "slug",
          title: "Slug",
          type: "slug",
          options: {
            maxLength: 96,
            slugify,
          },
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "listDate",
          title: "Fecha en listado",
          description:
            "Formato YYYY.MM.DD — misma convención que el sitio actual; define el orden en la subnav.",
          type: "string",
          placeholder: "2026.01.15",
          validation: (rule) =>
            rule.required().regex(/^\d{4}\.\d{2}\.\d{2}$/, {
              name: "YYYY.MM.DD",
              invert: false,
            }),
        }),
        defineField({
          name: "gallery",
          title: "Galería (compartida)",
          description:
            "Orden editable arrastrando filas. La primera imagen es el hero. Los pies de foto por idioma están en cada versión del documento.",
          type: "array",
          of: [{ type: "sharedGalleryImage" }],
          options: {
            layout: "grid",
          },
          validation: (rule) => rule.required().min(1),
        }),
      ],
      apiVersion: "2026-05-01",
    }),
  ],
  document: {
    actions: (prev, context) =>
      (translatedSchemaTypes as readonly string[]).includes(context.schemaType)
        ? [...prev, useDeleteTranslationAction, useDuplicateWithTranslationsAction]
        : prev,
  },
  schema: {
    types: schemaTypes,
  },
});
