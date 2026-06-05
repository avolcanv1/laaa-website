/**
 * Crea documentos translation.metadata para proyectos que aún no tienen uno.
 * Sin metadatos, el CMS no muestra los campos de galería (subida de imágenes), slug ni fecha.
 */
import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

const PROJECT_ID = "xz3cmhei";
const DATASET = "production";
const API_VERSION = "2026-05-01";
const CONTENT_TYPES = ["exhibition", "investigacion", "taller"];

const token = process.env.SANITY_API_TOKEN;
if (!token) {
  console.error("Define SANITY_API_TOKEN con permiso de escritura.");
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token,
  useCdn: false,
});

function createTranslationRef(language, documentId, schemaType) {
  return {
    _key: randomUUID().replace(/-/g, "").slice(0, 12),
    _type: "internationalizedArrayReferenceValue",
    language,
    value: {
      _type: "reference",
      _ref: documentId,
      _weak: true,
      _strengthenOnPublish: { type: schemaType },
    },
  };
}

for (const schemaType of CONTENT_TYPES) {
  const docs = await client.fetch(
    `*[_type == $schemaType && defined(language)]{_id, language}`,
    { schemaType },
  );

  for (const doc of docs) {
    const existing = await client.fetch(
      `*[_type == "translation.metadata" && references($id)][0]._id`,
      { id: doc._id },
    );

    if (existing) {
      console.log(`✓ ${schemaType} ${doc._id}: ya tiene metadatos (${existing})`);
      continue;
    }

    const metadataId = randomUUID().replace(/-/g, "");
    await client.create({
      _id: metadataId,
      _type: "translation.metadata",
      schemaTypes: [schemaType],
      translations: [createTranslationRef(doc.language, doc._id, schemaType)],
    });

    console.log(`+ ${schemaType} ${doc._id}: metadatos creados (${metadataId})`);
  }
}

console.log("Listo. Abre cada proyecto → Translations → Manage Translations para subir imágenes.");
