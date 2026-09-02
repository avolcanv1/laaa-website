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
    "Un espacio de investigación y desarrollo con sede en la Ciudad de México desde 2020, enfocado en la conceptualización de nuevos proyectos con artistas, arquitectxs e investigadores, así como en la preservación del patrimonio mediante la hibridación entre el uso de tecnologías contemporáneas y procesos vernaculares.",
    "En 2024 presentó una iniciativa de ley ante el Senado de la República para la creación del Repositorio de Artefactos Mesoamericanos (RAM), un archivo digital de acceso libre para la preservación y consulta educativa y científica de piezas arqueológicas.",
    "En 2025 inauguró LAAA Biblioteca PRAXIS, un proyecto de investigación orientado a democratizar el acceso a archivos y colecciones, iniciado con la biblioteca del Taller de Arquitectura PRAXIS de Agustín Hernández Navarro. Ese mismo año LAAA fue seleccionado en IN-PULSO CREATIVO, iniciativa del IFAL–Embajada de Francia en México que apoya a las industrias culturales y creativas mexicanas.",
    "Actualmente LAAA colabora con instituciones como el Museo Nacional de Antropología, el Museo del Templo Mayor, la Fundación Cultural Armella Spitalier, y el Archivo Agustín Hernández et al.",
  ],
  contactEmail: "info@laaa.mx",
  instagramHandle: "@laaa_mx",
  instagramUrl: "https://instagram.com/laaa_mx",
  address:
    "Gob. Rafael Rebollar 93 Col. San Miguel Chapultepec\n11580 Ciudad de México, México",
  heroAlt: "Biblioteca LAAA Biblioteca PRAXIS",
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
  const token = readToken();
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    token,
    useCdn: false,
  });

  console.log("Subiendo imagen hero…");
  const heroImage = dryRun ? { _type: "image", asset: { _ref: "dry-run" } } : await uploadHeroImage(client);

  const doc = {
    _id: DOCUMENT_ID,
    _type: "acercaPage",
    ...CONTENT,
    heroImage,
  };

  if (dryRun) {
    console.log("[dry-run] Documento Acerca:", JSON.stringify(doc, null, 2));
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
