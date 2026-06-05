/**
 * Actualiza guiones en cuerpos Sanity: `-` / `—` → `–` (excepto en nombres compuestos).
 *
 *   node scripts/fix-sanity-body-en-dashes.mjs [--dry-run]
 */

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { createClient } from "@sanity/client";

import {
  formatEnDashes,
  formatEnDashesInBlocks,
} from "./lib/inlineHtmlToPortableText.mjs";

const PROJECT_ID = "xz3cmhei";
const DATASET = "production";
const API_VERSION = "2026-05-01";

function readToken() {
  if (process.env.SANITY_API_TOKEN) return process.env.SANITY_API_TOKEN;
  const cfgPath = join(homedir(), ".config", "sanity", "config.json");
  if (existsSync(cfgPath)) {
    const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
    if (cfg.authToken) return cfg.authToken;
  }
  throw new Error("Define SANITY_API_TOKEN o inicia sesión con Sanity CLI.");
}

function blocksChanged(before, after) {
  return JSON.stringify(before) !== JSON.stringify(after);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    token: readToken(),
    useCdn: false,
  });

  const rows = await client.fetch(
    `*[_type in ["exhibition","investigacion","taller"]]{ _id, _type, title, "slug": slug.current, body }`,
  );

  let fixed = 0;
  for (const row of rows) {
    const nextTitle = formatEnDashes(row.title ?? "");
    const nextBody = row.body?.length ? formatEnDashesInBlocks(row.body) : row.body;
    const titleChanged = nextTitle !== (row.title ?? "");
    const bodyChanged =
      row.body?.length && nextBody && blocksChanged(row.body, nextBody);

    if (!titleChanged && !bodyChanged) continue;

    console.log(`→ ${row._type} / ${row.slug}`);
    if (!dryRun) {
      const patch = client.patch(row._id);
      if (titleChanged) patch.set({ title: nextTitle });
      if (bodyChanged) patch.set({ body: nextBody });
      await patch.commit();
      console.log("  ✓ actualizado");
    }
    fixed += 1;
  }

  console.log(
    dryRun
      ? `Se actualizarían ${fixed} documento(s).`
      : `Actualizados ${fixed} documento(s).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
