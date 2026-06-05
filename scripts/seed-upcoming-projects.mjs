/**
 * Crea proyectos "Próximamente" en Sanity (listados en gris, sin enlace).
 *
 *   node scripts/seed-upcoming-projects.mjs [--dry-run]
 */

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { createClient } from "@sanity/client";

const PROJECT_ID = "xz3cmhei";
const DATASET = "production";
const API_VERSION = "2026-05-01";

/** Proyectos próximamente — body debe contener "Próximamente" para el listado inactivo. */
const UPCOMING = [
  {
    type: "exhibition",
    slug: "caja-litica-olmeca",
    title: "Caja lítica olmeca",
    listDate: "3000.03.01",
  },
  {
    type: "exhibition",
    slug: "coatlicue",
    title: "Coatlicue",
    listDate: "3000.02.01",
  },
  {
    type: "exhibition",
    slug: "ram",
    title: "RAM. Repositorio de Artefactos Mesoamericanos.",
    listDate: "3000.01.01",
  },
  {
    type: "investigacion",
    slug: "dr-lakra",
    title: "Dr. Lakra",
    listDate: "2099.01.01",
  },
];

function randomKey() {
  return `${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`;
}

function readToken() {
  if (process.env.SANITY_API_TOKEN) return process.env.SANITY_API_TOKEN;
  const cfgPath = join(homedir(), ".config", "sanity", "config.json");
  if (existsSync(cfgPath)) {
    const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
    if (cfg.authToken) return cfg.authToken;
  }
  throw new Error("Define SANITY_API_TOKEN o inicia sesión con Sanity CLI.");
}

function proximamenteBody() {
  return [
    {
      _type: "block",
      _key: randomKey(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", text: "Próximamente.", marks: [] }],
    },
  ];
}

async function findExistingDoc(client, type, slug) {
  return client.fetch(
    `*[_type == $type && slug.current == $slug][0]{ _id }`,
    { type, slug },
  );
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

  for (const item of UPCOMING) {
    const existing = await findExistingDoc(client, item.type, item.slug);
    const doc = {
      _id: existing?._id ?? `${item.type}-${item.slug}`,
      _type: item.type,
      title: item.title,
      listDate: item.listDate,
      slug: { _type: "slug", current: item.slug },
      body: proximamenteBody(),
      gallery: [],
    };

    if (dryRun) {
      console.log(`→ ${item.type} / ${item.slug} (${existing ? "update" : "create"})`);
      continue;
    }

    await client.createOrReplace(doc);
    console.log(`✓ ${item.type} / ${item.slug}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
