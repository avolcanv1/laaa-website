/**
 * Sube exposiciones desde carpetas locales (p. ej. ~/Downloads/01/01-09).
 * Ignora subcarpetas llamadas "unused".
 *
 *   node scripts/upload-exhibitions-from-downloads.mjs [--root PATH] [--only 01-07,01-08] [--dry-run]
 */

import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { homedir } from "node:os";

import { createClient } from "@sanity/client";

import { bodyRawToPortableText } from "./lib/inlineHtmlToPortableText.mjs";

const PROJECT_ID = "xz3cmhei";
const DATASET = "production";
const API_VERSION = "2026-05-01";
const DEFAULT_ROOT = join(homedir(), "Downloads", "01");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

/** Carpeta → slug en Sanity (coherente con documentos ya creados). */
const FOLDER_SLUG = {
  "01-01-próximamente": "ram",
  "01-01-proximamente": "ram",
  "01-02": "orquideario",
  "01-03": "modelos-alternos-de-investigacion-arqueologica",
  "01-04": "lost-city",
  "01-05": "laaa-biblioteca-praxis",
  "01-06": "fosilifera",
  "01-07": "tenis",
  "01-08": "facsimil",
  "01-09": "copias-originales",
};

function randomKey() {
  return `${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`;
}

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseArgs(argv) {
  const out = { root: DEFAULT_ROOT, only: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--root") out.root = argv[++i];
    else if (argv[i] === "--only") out.only = new Set(argv[++i].split(",").map((s) => s.trim()));
    else if (argv[i] === "--dry-run") out.dryRun = true;
  }
  return out;
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

function parseListDate(raw) {
  const s = raw.trim();
  const dmy = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}.${m.padStart(2, "0")}.${d.padStart(2, "0")}`;
  }
  const spanish = s.match(/^(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})$/i);
  if (spanish) {
    const months = {
      enero: "01",
      febrero: "02",
      marzo: "03",
      abril: "04",
      mayo: "05",
      junio: "06",
      julio: "07",
      agosto: "08",
      septiembre: "09",
      setiembre: "09",
      octubre: "10",
      noviembre: "11",
      diciembre: "12",
    };
    const m = months[spanish[2].toLowerCase()];
    if (m) return `${spanish[3]}.${m}.${spanish[1].padStart(2, "0")}`;
  }
  const yearOnly = s.match(/^(\d{4})$/);
  if (yearOnly) return `${yearOnly[1]}.01.01`;
  throw new Error(`Fecha no reconocida: "${raw}"`);
}

function parseMetadataTxt(txtPath) {
  const raw = readFileSync(txtPath, "utf8").replace(/\r\n/g, "\n");
  const lines = raw.split("\n");
  const meta = { fecha: "", titulo: "", textoLines: [] };
  let inTexto = false;

  for (const line of lines) {
    const fecha = line.match(/^fecha:\s*(.+)$/i);
    const titulo = line.match(/^t[ií]tulo:\s*(.+)$/i);
    const textoStart = line.match(/^texto:\s*(.*)$/i);
    if (fecha) {
      meta.fecha = fecha[1].trim();
      continue;
    }
    if (titulo) {
      meta.titulo = titulo[1].trim();
      continue;
    }
    if (textoStart) {
      inTexto = true;
      if (textoStart[1]) meta.textoLines.push(textoStart[1]);
      continue;
    }
    if (inTexto) meta.textoLines.push(line);
  }

  return {
    listDate: parseListDate(meta.fecha),
    title: meta.titulo,
    bodyRaw: meta.textoLines.join("\n").trim(),
  };
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function collectImages(imgDir) {
  const out = [];
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (name === "unused") continue;
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) {
        walk(full);
        continue;
      }
      const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
      if (IMAGE_EXT.has(ext)) out.push(full);
    }
  }
  walk(imgDir);
  out.sort(naturalSort);
  return out;
}

function folderKey(name) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function resolveSlug(folderName) {
  const key = folderKey(folderName);
  for (const [k, slug] of Object.entries(FOLDER_SLUG)) {
    if (folderKey(k) === key) return slug;
  }
  const num = folderName.match(/^(\d{2}-\d{2})/)?.[1];
  return num ? slugify(folderName) : slugify(folderName);
}

function discoverProjects(root) {
  const projects = [];
  for (const name of readdirSync(root)) {
    if (!name.match(/^01-\d{2}/)) continue;
    const dir = join(root, name);
    if (!statSync(dir).isDirectory()) continue;
    const txt = readdirSync(dir).find((f) => f.endsWith(".txt"));
    const imgDir = readdirSync(dir).find((f) => f.endsWith("-img") && statSync(join(dir, f)).isDirectory());
    if (!txt || !imgDir) continue;
    projects.push({
      folderName: name,
      folderPath: dir,
      txtPath: join(dir, txt),
      imgDir: join(dir, imgDir),
      slug: resolveSlug(name),
    });
  }
  projects.sort((a, b) => naturalSort(a.folderName, b.folderName));
  return projects;
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function uploadImage(client, path, cache) {
  if (cache.has(path)) return cache.get(path);
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const stream = createReadStream(path);
      const asset = await client.assets.upload("image", stream, {
        filename: basename(path),
      });
      cache.set(path, asset._id);
      return asset._id;
    } catch (err) {
      const code = err?.statusCode;
      if ([429, 502, 503, 504].includes(code) && attempt < maxAttempts) {
        await sleep(2000 * attempt);
        continue;
      }
      throw err;
    }
  }
}

async function findExistingDoc(client, slug) {
  const res = await client.fetch(
    `*[_type == "exhibition" && slug.current == $slug][0]{ _id }`,
    { slug },
  );
  return res?._id;
}

async function uploadProject(client, project, { dryRun, assetCache, skipSlugs }) {
  const { folderName, txtPath, imgDir, slug } = project;
  const meta = parseMetadataTxt(txtPath);
  const images = collectImages(imgDir);

  if (images.length === 0) {
    console.log(`⊘ ${folderName} (${slug}): sin imágenes, omitido`);
    return;
  }

  if (skipSlugs?.has(slug)) {
    console.log(`⊘ ${folderName} (${slug}): ya completo, omitido`);
    return;
  }

  console.log(`→ ${folderName} → exhibition / ${slug} (${images.length} imgs)`);

  if (dryRun) {
    console.log(`   título: ${meta.title}`);
    console.log(`   fecha:  ${meta.listDate}`);
    return;
  }

  const gallery = [];
  for (const imgPath of images) {
    const assetId = await uploadImage(client, imgPath, assetCache);
    gallery.push({
      _type: "galleryItem",
      _key: randomKey(),
      caption: "",
      alt: "",
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
      },
    });
    process.stdout.write(".");
  }
  process.stdout.write("\n");

  const existingId = await findExistingDoc(client, slug);
  const doc = {
    _id: existingId ?? `exhibition-${slug}`,
    _type: "exhibition",
    title: meta.title,
    listDate: meta.listDate,
    slug: { _type: "slug", current: slug },
    body: bodyRawToPortableText(meta.bodyRaw, randomKey),
    gallery,
  };

  await client.createOrReplace(doc);
  console.log(`   ✓ ${slug} (${existingId ?? doc._id})`);
}

async function main() {
  const { root, only, dryRun } = parseArgs(process.argv);
  if (!existsSync(root)) {
    console.error(`No existe la carpeta: ${root}`);
    process.exit(1);
  }

  const token = readToken();
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    token,
    useCdn: false,
  });

  /** Slugs que ya tienen galería completa (no sobrescribir salvo --force). */
  const complete = new Set([
    "orquideario",
    "modelos-alternos-de-investigacion-arqueologica",
    "fosilifera",
    "laaa-biblioteca-praxis",
  ]);

  const projects = discoverProjects(root).filter((p) => {
    if (!only) return true;
    const num = p.folderName.match(/^(01-\d{2})/)?.[1];
    return only.has(num) || only.has(p.folderName);
  });

  console.info(`Raíz: ${root}`);
  console.info(`Proyectos: ${projects.map((p) => p.folderName).join(", ")}\n`);

  const assetCache = new Map();
  for (const project of projects) {
    await uploadProject(client, project, { dryRun, assetCache, skipSlugs: complete });
  }

  console.info("\nListo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
