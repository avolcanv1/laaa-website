import { createClient } from "@sanity/client";

/** Para consultas desde la app Vite (GROQ, fetch de documentos). */
export const sanityClient = createClient({
  projectId: "xz3cmhei",
  dataset: "production",
  apiVersion: "2026-05-01",
  // Sin CDN para que los cambios del CMS se reflejen de inmediato en el sitio.
  useCdn: false,
});
