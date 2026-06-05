/**
 * Borra todo el contenido editable en Sanity (exposiciones, investigación, talleres
 * y metadatos de traducción). Deja el CMS vacío para que el cliente suba contenido nuevo.
 *
 * Requiere token con permiso de escritura:
 *   export SANITY_API_TOKEN="..."
 *   npm run clear:sanity
 */

import { createClient } from "@sanity/client";

const PROJECT_ID = "xz3cmhei";
const DATASET = "production";
const API_VERSION = "2026-05-01";

/** Metadatos primero: referencian los documentos de contenido. */
const CONTENT_TYPES = [
  "translation.metadata",
  "exhibition",
  "investigacion",
  "taller",
] as const;

async function main(): Promise<void> {
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

  for (const type of CONTENT_TYPES) {
    const ids = await client.fetch<string[]>(`*[_type == $type]._id`, { type });
    if (ids.length === 0) {
      console.log(`— ${type}: ya vacío`);
      continue;
    }

    console.log(`— ${type}: borrando ${ids.length} documento(s)…`);
    const chunkSize = 100;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const tx = client.transaction();
      for (const id of chunk) {
        tx.delete(id);
      }
      await tx.commit();
    }
  }

  console.log("Listo. El CMS quedó vacío.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
