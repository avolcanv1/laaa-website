#!/usr/bin/env node
/**
 * Fetch Cargo originals referenced in src/data/*.ts into public/cargo-media/
 * as flat files: `{assetId}__{filename}` (no per-id subfolders).
 *
 * Usage: npm run download-media
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_FILES = [
  join(ROOT, "src/data/exhibitionContent.ts"),
  join(ROOT, "src/data/talleresContent.ts"),
  join(ROOT, "src/data/investigacionContent.ts"),
];
const OUT = join(ROOT, "public/cargo-media");

/** Matches cargo("hex_id", "filename.ext"), including trailing commas before `)`. */
const CARGO_RE =
  /cargo\s*\(\s*"([a-fA-F0-9]+)"\s*,\s*"([^"]+)"\s*,?\s*\)/gs;

/** Keep aligned with {@link src/lib/cargoImage.ts} cargoMediaFlatFilename */
function cargoMediaFlatFilename(assetId, filename) {
  const safe = filename.replace(/\//g, "_").replace(/__/g, "_");
  return `${assetId}__${safe}`;
}

/** Remove older nested `public/cargo-media/<64-char-hex>/…` trees */
function cleanupLegacyCargoSubdirs(mediaRoot) {
  if (!existsSync(mediaRoot)) return;
  for (const ent of readdirSync(mediaRoot)) {
    const p = join(mediaRoot, ent);
    try {
      if (/^[a-fA-F0-9]{64}$/.test(ent) && statSync(p).isDirectory()) {
        rmSync(p, { recursive: true, force: true });
      }
    } catch {
      /* ignore race */
    }
  }
}

function freightOriginalUrl(id, file) {
  const encodedFile = file
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `https://freight.cargo.site/t/original/i/${id}/${encodedFile}`;
}

function extractPairs(text) {
  const pairs = [];
  let m;
  while ((m = CARGO_RE.exec(text))) {
    pairs.push({ id: m[1], file: m[2] });
  }
  return pairs;
}

async function mapPool(items, limit, fn) {
  let ix = 0;
  const workers = Array.from(
    { length: Math.min(limit, Math.max(items.length, 1)) },
    async () => {
      while (true) {
        const i = ix++;
        if (i >= items.length) break;
        await fn(items[i], i);
      }
    },
  );
  await Promise.all(workers);
}

async function main() {
  const seen = new Map();
  for (const path of DATA_FILES) {
    const src = readFileSync(path, "utf8");
    for (const p of extractPairs(src)) {
      seen.set(`${p.id}/${p.file}`, p);
    }
  }
  const pairs = [...seen.values()];
  console.log(`Unique Cargo assets: ${pairs.length}`);

  mkdirSync(OUT, { recursive: true });
  cleanupLegacyCargoSubdirs(OUT);

  let fetched = 0;
  let skipped = 0;
  const failures = [];

  await mapPool(pairs, 6, async ({ id, file }) => {
    const flatName = cargoMediaFlatFilename(id, file);
    const destPath = join(OUT, flatName);
    if (existsSync(destPath) && statSync(destPath).size > 0) {
      skipped++;
      return;
    }
    const url = freightOriginalUrl(id, file);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        failures.push({ url, status: res.status });
        return;
      }
      writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
      fetched++;
    } catch (e) {
      failures.push({ url, error: String(e) });
    }
  });

  console.log(`Fetched: ${fetched}, skipped (already on disk): ${skipped}`);
  if (failures.length) {
    console.error(`${failures.length} failure(s):`);
    for (const f of failures.slice(0, 25)) {
      console.error(f);
    }
    if (failures.length > 25) console.error(`…and ${failures.length - 25} more`);
    process.exitCode = 1;
  }
}

main();
