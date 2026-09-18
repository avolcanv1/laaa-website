/**
 * Crea o actualiza el documento singleton de Acerca en Sanity.
 *
 *   node scripts/seed-acerca-page.mjs [--dry-run]
 */

import { createReadStream, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { createClient } from "@sanity/client";

const PROJECT_ID = "xz3cmhei";
const DATASET = "production";
const API_VERSION = "2026-05-01";
const DOCUMENT_ID = "acercaPage";

const CONTENT = {
  paragraphs: [
    "LAAA (Laboratorio de Arte, Arquitectura y Arqueología) es un espacio de investigación fundado en 2020 por Francisco Regalado en la Ciudad de México. Desarrolla proyectos que combinan investigación histórica, digitalización, fabricación y archivo, articulando tecnologías contemporáneas y procesos vernaculares.",
    "Colabora tanto con artistas, arquitectxs y arqueologxs contemporáneos como con instituciones e investigadorxs dedicadxs al patrimonio cultural, entendiendo el pasado y el presente como materias igualmente vivas, abiertas a nuevas interpretaciones y formas de circulación. Opera a través de objetos, exposiciones, publicaciones y plataformas digitales.",
  ],
  contactEmail: "info@laaa.mx",
  instagramHandle: "@laaa_mx",
  instagramUrl: "https://instagram.com/laaa_mx",
  address:
    "Gob. Rafael Rebollar 93 Col. San Miguel Chapultepec\n11580 Ciudad de México, México",
  heroAlt: "Estudio LAAA",
};

function readToken() {
  if (process.env.SANITY_API_TOKEN) return process.env.SANITY_API_TOKEN;
  const cfgPath = join(homedir(), ".config", "sanity", "config.json");
  if (existsSync(cfgPath)) {
    const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
    if (cfg.authToken) return cfg.authToken;
  }
  throw new Error("Define SANITY_API_TOKEN o inicia sesión con Sanity CLI.");
}

async function uploadHeroImage(client) {
  const heroPath = join(process.cwd(), "public", "acerca", "hero.jpg");
  if (!existsSync(heroPath)) {
    throw new Error(`No existe la imagen hero: ${heroPath}`);
  }

  const stream = createReadStream(heroPath);
  const asset = await client.assets.upload("image", stream, {
    filename: "acerca-hero.jpg",
  });

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const textOnly = process.argv.includes("--text-only");
  const token = readToken();
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    token,
    useCdn: false,
  });

  if (textOnly) {
    if (dryRun) {
      console.log("[dry-run] Patch texto Info:", CONTENT);
      return;
    }
    await client
      .patch(DOCUMENT_ID)
      .set(CONTENT)
      .commit();
    console.log(`Documento "${DOCUMENT_ID}" actualizado (solo texto).`);
    return;
  }

  console.log("Subiendo imagen hero…");
  const heroImage = dryRun
    ? { _type: "image", asset: { _ref: "dry-run" } }
    : await uploadHeroImage(client);

  const doc = {
    _id: DOCUMENT_ID,
    _type: "acercaPage",
    ...CONTENT,
    heroImage,
  };

  if (dryRun) {
    console.log("[dry-run] Documento Info:", JSON.stringify(doc, null, 2));
    return;
  }

  await client.mutate([
    {
      createOrReplace: doc,
    },
  ]);

  console.log(`Documento "${DOCUMENT_ID}" creado/actualizado en Sanity.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
