/**
 * Migra exposiciones, investigación y talleres desde `src/data/*.ts` + `public/cargo-media/`
 * hacia Sanity con `@sanity/document-internationalization`:
 * - Documento por idioma (`language: "es"`) con título, cuerpo y `galleryCaptions`.
 * - `translation.metadata` con `slug`, `listDate`, `gallery` compartidos y referencia al doc ES.
 *
 * Requiere token con permiso de escritura:
 *   export SANITY_API_TOKEN="..."
 *
 * Ejecutar:
 *   SANITY_API_TOKEN=… TS_NODE_PROJECT=tsconfig.scripts.json npx ts-node --esm scripts/migrate-to-sanity.ts
 *
 * Atajo:
 *   npm run migrate:sanity
 */

import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";

import { createClient, type SanityClient } from "@sanity/client";

import { EXHIBITION_BY_SLUG, type ExhibitionContent } from "../src/data/exhibitionContent.ts";
import { INVESTIGACION_BY_SLUG } from "../src/data/investigacionContent.ts";
import { TALLERES_BY_SLUG } from "../src/data/talleresContent.ts";

const PROJECT_ID = "xz3cmhei";
const DATASET = "production";
const API_VERSION = "2026-05-01";

const DEFAULT_LANGUAGE = "es";

/** Tipo de ítem dentro de `translations` en `translation.metadata` (sanity-plugin-internationalized-array). */
const INTERNATIONALIZED_REFERENCE_ROW_TYPE = "internationalizedArrayReferenceValue";

/** Coherente con `cargoMediaFlatFilename` en `src/lib/cargoImage.ts`. */
function cargoMediaFlatFilename(assetId: string, filename: string): string {
  const safe = filename.replace(/\//g, "_").replace(/__/g, "_");
  return `${assetId}__${safe}`;
}

function cargoMediaPathFromPublicUrl(url: string): string | null {
  if (!url.startsWith("/cargo-media/")) return null;
  const encoded = url.slice("/cargo-media/".length);
  let flat: string;
  try {
    flat = decodeURIComponent(encoded);
  } catch {
    flat = encoded;
  }
  const dangerous = flat.includes("..") || flat.startsWith("/");
  if (dangerous) return null;
  return join(process.cwd(), "public", "cargo-media", flat);
}

/** Logo LAAA del repo — fallback cuando no hay imágenes en la ficha (cumple gallery min 1). */
function logoCargoFlatName(): string {
  return cargoMediaFlatFilename(
    "586a7fc796bb7149470627405211dbe84266b92fe6e3f7760bd338efd30f3708",
    "logo_LAAA_v2_page-0001.png",
  );
}

const URL_RE =
  /https?:\/\/[^\s<>"{}|\\^`[\]]+|mailto:[^\s<>"{}|\\^`[\]]+/gi;

function randomKey(): string {
  return `${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`;
}

function paragraphToBlock(paragraph: string): Record<string, unknown> {
  const children: Array<Record<string, unknown>> = [];
  const markDefs: Array<Record<string, unknown>> = [];
  let lastIndex = 0;
  const re = new RegExp(URL_RE.source, URL_RE.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(paragraph)) !== null) {
    const url = m[0];
    const start = m.index;
    if (start > lastIndex) {
      children.push({
        _type: "span",
        text: paragraph.slice(lastIndex, start),
        marks: [],
      });
    }
    const linkKey = randomKey();
    markDefs.push({
      _type: "link",
      _key: linkKey,
      href: url,
    });
    children.push({
      _type: "span",
      text: url,
      marks: [linkKey],
    });
    lastIndex = start + url.length;
  }
  if (lastIndex < paragraph.length) {
    children.push({
      _type: "span",
      text: paragraph.slice(lastIndex),
      marks: [],
    });
  }
  if (children.length === 0) {
    children.push({ _type: "span", text: "", marks: [] });
  }
  return {
    _type: "block",
    _key: randomKey(),
    style: "normal",
    children,
    markDefs,
  };
}

function bodyToPortableText(body: string): Record<string, unknown>[] {
  const trimmed = body.trim();
  if (!trimmed) {
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
  const paragraphs = trimmed.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.map(paragraphToBlock);
}

function isTransientUploadFailure(err: unknown): boolean {
  const code =
    typeof err === "object" && err !== null && "statusCode" in err
      ? (err as { statusCode?: number }).statusCode
      : undefined;
  return code === 429 || code === 502 || code === 503 || code === 504;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

const assetCache = new Map<string, string>();

function logoAbsolutePath(): string {
  return join(process.cwd(), "public", "cargo-media", logoCargoFlatName());
}

/** Sanity rechaza algunos PNG locales que libspng no puede leer (p. ej. PNG “raros” exportados desde herramientas). */
function isSanityUnprocessableImageError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const status = "statusCode" in err ? (err as { statusCode?: number }).statusCode : undefined;
  const msg =
    "message" in err ? String((err as { message?: string }).message) : "";
  const body =
    "responseBody" in err ? String((err as { responseBody?: string }).responseBody) : "";
  return (
    status === 422 &&
    (msg.includes("Invalid image") ||
      body.includes("Invalid image") ||
      body.includes("could not process"))
  );
}

async function uploadImageFromPath(
  client: SanityClient,
  absolutePath: string,
  allowLogoFallback = true,
): Promise<string> {
  const cached = assetCache.get(absolutePath);
  if (cached) return cached;
  if (!existsSync(absolutePath)) {
    throw new Error(`No existe el archivo de imagen: ${absolutePath}`);
  }
  const logoPath = logoAbsolutePath();

  async function uploadWithRetries(path: string): Promise<string> {
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const stream = createReadStream(path);
        const asset = await client.assets.upload("image", stream, {
          filename: basename(path),
        });
        return asset._id;
      } catch (err: unknown) {
        if (isTransientUploadFailure(err) && attempt < maxAttempts) {
          const waitMs = Math.min(2000 * attempt, 12000);
          console.warn(
            `Subida fallida (${basename(path)}); reintento ${attempt}/${maxAttempts} tras ${waitMs}ms…`,
          );
          await sleep(waitMs);
          continue;
        }
        throw err;
      }
    }
    throw new Error("uploadWithRetries: agotados los reintentos");
  }

  try {
    const assetId = await uploadWithRetries(absolutePath);
    assetCache.set(absolutePath, assetId);
    return assetId;
  } catch (err: unknown) {
    if (allowLogoFallback && absolutePath !== logoPath && isSanityUnprocessableImageError(err)) {
      console.warn(
        `Aviso: Sanity no pudo procesar "${basename(absolutePath)}"; se sustituye por el logo LAAA.`,
      );
      return uploadImageFromPath(client, logoPath, false);
    }
    throw err;
  }
}

async function resolvePlaceholderAssetId(client: SanityClient): Promise<string> {
  return uploadImageFromPath(client, logoAbsolutePath(), false);
}

async function buildSharedGallery(
  client: SanityClient,
  slideshow: string[],
): Promise<Record<string, unknown>[]> {
  const urls =
    slideshow.length > 0
      ? slideshow
      : ["/cargo-media/" + encodeURIComponent(logoCargoFlatName())];

  const out: Record<string, unknown>[] = [];
  for (const url of urls) {
    const fsPath = cargoMediaPathFromPublicUrl(url);
    if (!fsPath) {
      throw new Error(`URL de imagen no reconocida (se esperaba /cargo-media/…): ${url}`);
    }
    const assetId = await uploadImageFromPath(client, fsPath);
    out.push({
      _type: "sharedGalleryImage",
      _key: randomKey(),
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
      },
    });
  }

  return out;
}

function buildGalleryCaptionRows(count: number): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      _type: "galleryCaptionRow",
      _key: randomKey(),
      caption: "",
      alt: "",
    });
  }
  return rows;
}

function sanityDocId(type: "exhibition" | "investigacion" | "taller", slug: string): string {
  return `${type}-${slug}`;
}

function translationMetadataDocId(type: "exhibition" | "investigacion" | "taller", slug: string): string {
  return `translation-metadata-${type}-${slug}`;
}

async function migrateDocuments(
  client: SanityClient,
  type: "exhibition" | "investigacion" | "taller",
  bySlug: Record<string, ExhibitionContent>,
): Promise<void> {
  const entries = Object.entries(bySlug);
  console.info(`→ ${type}: ${entries.length} documentos`);
  for (const [slug, content] of entries) {
    const body = bodyToPortableText(content.body);
    const galleryShared = await buildSharedGallery(client, content.slideshow);
    const galleryCaptions = buildGalleryCaptionRows(galleryShared.length);

    const docId = sanityDocId(type, slug);
    const localeDoc = {
      _id: docId,
      _type: type,
      language: DEFAULT_LANGUAGE,
      title: content.title,
      body,
      galleryCaptions,
    };

    const metaDoc = {
      _id: translationMetadataDocId(type, slug),
      _type: "translation.metadata",
      schemaTypes: [type],
      translations: [
        {
          _type: INTERNATIONALIZED_REFERENCE_ROW_TYPE,
          _key: randomKey(),
          language: DEFAULT_LANGUAGE,
          value: {
            _type: "reference",
            _ref: docId,
          },
        },
      ],
      slug: { _type: "slug", current: slug },
      listDate: content.listDate,
      gallery: galleryShared,
    };

    await client.createOrReplace(localeDoc as Record<string, unknown>);
    await client.createOrReplace(metaDoc as Record<string, unknown>);
    console.info(`   ✓ ${slug}`);
  }
}

async function main(): Promise<void> {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    console.error("Define SANITY_API_TOKEN con permiso de escritura en el dataset.");
    process.exit(1);
  }

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    token,
    useCdn: false,
  });

  await resolvePlaceholderAssetId(client);

  await migrateDocuments(client, "exhibition", EXHIBITION_BY_SLUG);
  await migrateDocuments(client, "investigacion", INVESTIGACION_BY_SLUG);
  await migrateDocuments(client, "taller", TALLERES_BY_SLUG);

  console.info("Migración terminada.");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
