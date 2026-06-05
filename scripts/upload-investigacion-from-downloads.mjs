/**
 * Sube proyectos de Investigación desde carpetas locales (p. ej. ~/Downloads/02).
 * Ignora subcarpetas llamadas "unused".
 *
 *   node scripts/upload-investigacion-from-downloads.mjs [--root PATH] [--only 02-07] [--dry-run]
 */

import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { homedir, tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

import { createClient } from "@sanity/client";

const PROJECT_ID = "xz3cmhei";
const DATASET = "production";
const API_VERSION = "2026-05-01";
const DOC_TYPE = "investigacion";
const DEFAULT_ROOT = join(homedir(), "Downloads", "02");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

/** Carpeta → slug en Sanity (coherente con investigacionContent.ts). */
const FOLDER_SLUG = {
  "02-01": "cristobal-gracia",
  "02-02": "andrea-ferrero",
  "02-03": "mario-garcia-torres",
  "02-04": "bea-bonafini",
  "02-05": "abraham-cruzvillegas",
  "02-06": "superflex",
  "02-07": "avantgardo",
  "02-08": "elsa-louise-manceaux",
  "02-09": "sangree",
  "02-10": "roger-munoz",
  "02-11": "urmeer",
  "02-12": "nicole-chaput",
  "02-13": "lorena-mal",
  "02-14": "barbara-sanchez-kane",
  "02-15": "minerva-cuevas",
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
  const my = s.match(/^(\d{1,2})\.(\d{4})$/);
  if (my) {
    const [, m, y] = my;
    return `${y}.${m.padStart(2, "0")}.01`;
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

  let bodyRaw = meta.textoLines.join("\n").trim();
  let title = meta.titulo;

  if (!title && bodyRaw) {
    const firstLine = bodyRaw.split("\n")[0]?.trim() ?? "";
    const plainTitle =
      firstLine.length > 0 &&
      firstLine.length < 80 &&
      !/[<>]/.test(firstLine) &&
      !/^Texto:/i.test(firstLine);
    if (plainTitle) {
      title = firstLine;
      bodyRaw = bodyRaw.split("\n").slice(1).join("\n").trim();
    }
  }

  return {
    listDate: parseListDate(meta.fecha),
    title,
    bodyRaw,
  };
}

function normalizeHref(href) {
  const h = href.trim().replace(/^["']|["']$/g, "");
  if (!h || h === "catalgo") return "https://laaa.mx";
  if (/^mailto:/i.test(h) || /^https?:\/\//i.test(h)) return h;
  return `https://${h}`;
}

function inlineHtmlToSpans(html) {
  const children = [];
  const markDefs = [];
  let i = 0;

  function pushText(text, marks = []) {
    if (!text) return;
    children.push({ _type: "span", text, marks: [...marks] });
  }

  while (i < html.length) {
    const rest = html.slice(i);
    const tag = rest.match(/^<(i|b|a)(?:\s+href=([^>]*))?>([\s\S]*?)<\/\1>/i);
    if (tag) {
      const [, kind, href, inner] = tag;
      if (kind === "i") {
        const innerSpans = inlineHtmlToSpans(inner);
        for (const c of innerSpans.children) {
          children.push({ ...c, marks: [...(c.marks || []), "em"] });
        }
        markDefs.push(...innerSpans.markDefs);
      } else if (kind === "b") {
        const innerSpans = inlineHtmlToSpans(inner);
        for (const c of innerSpans.children) {
          children.push({ ...c, marks: [...(c.marks || []), "strong"] });
        }
        markDefs.push(...innerSpans.markDefs);
      } else if (kind === "a") {
        const key = randomKey();
        markDefs.push({
          _type: "link",
          _key: key,
          href: normalizeHref(href || ""),
        });
        const innerSpans = inlineHtmlToSpans(inner);
        for (const c of innerSpans.children) {
          children.push({ ...c, marks: [...(c.marks || []), key] });
        }
        markDefs.push(...innerSpans.markDefs.filter((d) => d._type === "link"));
      }
      i += tag[0].length;
      continue;
    }
    const nextTag = rest.search(/<(i|b|a)\b/i);
    const chunk = nextTag === -1 ? rest : rest.slice(0, nextTag);
    pushText(chunk);
    i += chunk.length || 1;
  }

  if (children.length === 0) children.push({ _type: "span", text: "", marks: [] });
  return { children, markDefs };
}

function bodyToPortableText(bodyRaw) {
  if (!bodyRaw.trim()) {
    return [
      {
        _type: "block",
        _key: randomKey(),
        style: "normal",
        children: [{ _type: "span", text: "", marks: [] }],
        markDefs: [],
      },
    ];
  }

  const paragraphs = bodyRaw
    .split(/\n\s*--\s*\n/)
    .flatMap((chunk) => chunk.split(/\n{2,}/))
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph) => {
    const { children, markDefs } = inlineHtmlToSpans(paragraph);
    const uniqueMarkDefs = [];
    const seen = new Set();
    for (const def of markDefs) {
      if (def._type === "link" && !seen.has(def._key)) {
        seen.add(def._key);
        uniqueMarkDefs.push(def);
      }
    }
    return {
      _type: "block",
      _key: randomKey(),
      style: "normal",
      children,
      markDefs: uniqueMarkDefs,
    };
  });
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function collectImages(imgDir, { includeUnused = false } = {}) {
  if (!imgDir) return [];
  const out = [];
  function walk(dir, { skipUnused = true } = {}) {
    for (const name of readdirSync(dir)) {
      if (skipUnused && name === "unused") continue;
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) {
        walk(full, { skipUnused: name !== "unused" || !skipUnused });
        continue;
      }
      const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
      if (IMAGE_EXT.has(ext)) out.push(full);
    }
  }
  walk(imgDir);
  if (out.length === 0 && !includeUnused) {
    const unusedDir = join(imgDir, "unused");
    if (existsSync(unusedDir) && statSync(unusedDir).isDirectory()) {
      walk(unusedDir, { skipUnused: false });
    }
  }
  out.sort(naturalSort);
  return out;
}

function folderKey(name) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function resolveSlug(folderName) {
  const num = folderName.match(/^(02-\d{2})/)?.[1];
  if (num && FOLDER_SLUG[num]) return FOLDER_SLUG[num];
  const key = folderKey(folderName);
  for (const [k, slug] of Object.entries(FOLDER_SLUG)) {
    if (folderKey(k) === key) return slug;
  }
  return slugify(folderName);
}

function discoverProjects(root) {
  const projects = [];
  for (const name of readdirSync(root)) {
    if (!name.match(/^02-\d{2}/)) continue;
    const dir = join(root, name);
    if (!statSync(dir).isDirectory()) continue;
    const txt = readdirSync(dir).find((f) => f.endsWith(".txt"));
    if (!txt) continue;
    const imgDirName = readdirSync(dir).find(
      (f) => f.endsWith("-img") && statSync(join(dir, f)).isDirectory(),
    );
    projects.push({
      folderName: name,
      folderPath: dir,
      txtPath: join(dir, txt),
      imgDir: imgDirName ? join(dir, imgDirName) : null,
      slug: resolveSlug(name),
    });
  }
  projects.sort((a, b) => naturalSort(a.folderName, b.folderName));
  return projects;
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

function convertToJpeg(path) {
  const out = join(tmpdir(), `sanity-upload-${randomKey()}.jpg`);
  execFileSync("sips", ["-s", "format", "jpeg", path, "--out", out], {
    stdio: "ignore",
  });
  return out;
}

async function uploadImage(client, path, cache) {
  if (cache.has(path)) return cache.get(path);
  const maxAttempts = 5;
  let uploadPath = path;
  let converted = false;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const stream = createReadStream(uploadPath);
      const asset = await client.assets.upload("image", stream, {
        filename: basename(uploadPath),
      });
      cache.set(path, asset._id);
      return asset._id;
    } catch (err) {
      const code = err?.statusCode;
      if (code === 422 && !converted) {
        console.warn(`\nPNG no válido (${basename(path)}); convirtiendo a JPEG…`);
        uploadPath = convertToJpeg(path);
        converted = true;
        continue;
      }
      if ([429, 500, 502, 503, 504].includes(code) && attempt < maxAttempts) {
        const waitMs = Math.min(2000 * attempt, 12000);
        console.warn(
          `\nSubida fallida (${basename(path)}); reintento ${attempt}/${maxAttempts} tras ${waitMs}ms…`,
        );
        await sleep(waitMs);
        continue;
      }
      throw err;
    }
  }
}

async function findExistingDoc(client, slug) {
  const res = await client.fetch(
    `*[_type == $type && slug.current == $slug][0]{ _id }`,
    { type: DOC_TYPE, slug },
  );
  return res?._id;
}

async function uploadProject(client, project, { dryRun, assetCache }) {
  const { folderName, txtPath, imgDir, slug } = project;
  const meta = parseMetadataTxt(txtPath);
  const images = collectImages(imgDir);
  const title = meta.title || slug;

  if (images.length === 0) {
    console.log(`→ ${folderName} → ${DOC_TYPE} / ${slug} (sin imágenes, solo texto)`);
  } else {
    console.log(`→ ${folderName} → ${DOC_TYPE} / ${slug} (${images.length} imgs)`);
  }

  if (dryRun) {
    console.log(`   título: ${title}`);
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
    _id: existingId ?? `${DOC_TYPE}-${slug}`,
    _type: DOC_TYPE,
    title,
    listDate: meta.listDate,
    slug: { _type: "slug", current: slug },
    body: bodyToPortableText(meta.bodyRaw),
    ...(gallery.length > 0 ? { gallery } : {}),
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

  const projects = discoverProjects(root).filter((p) => {
    if (!only) return true;
    const num = p.folderName.match(/^(02-\d{2})/)?.[1];
    return only.has(num) || only.has(p.folderName);
  });

  console.info(`Raíz: ${root}`);
  console.info(`Proyectos: ${projects.map((p) => p.folderName).join(", ")}\n`);

  const assetCache = new Map();
  for (const project of projects) {
    await uploadProject(client, project, { dryRun, assetCache });
  }

  console.info("\nListo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
