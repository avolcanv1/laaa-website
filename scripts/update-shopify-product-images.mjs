/**
 * Replace product images on existing Shopify products (no duplicates).
 *
 * Reads data/shop-products.json and matches products by variant SKU (LAAA-05-01-NN).
 * Deletes current media, then uploads images from catalog paths.
 *
 * Usage:
 *   node scripts/update-shopify-product-images.mjs [--dry-run] [--file catalog.json]
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ADMIN_API_VERSION = "2024-10";
const DEFAULT_CATALOG = join(ROOT, "data", "shop-products.json");

function loadEnvLocal() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvLocal();

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();

if (!storeDomain || !accessToken) {
  console.error(
    "Define SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN in .env.local",
  );
  process.exit(1);
}

const host = storeDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
const adminEndpoint = `https://${host}/admin/api/${ADMIN_API_VERSION}/graphql.json`;

async function adminGraphql(query, variables = {}) {
  const res = await fetch(adminEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data;
}

const PRODUCTS_QUERY = `
  query Products($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        handle
        variants(first: 5) {
          nodes {
            sku
          }
        }
        media(first: 20) {
          nodes {
            id
          }
        }
      }
    }
  }
`;

const STAGED_UPLOADS_CREATE = `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters { name value }
      }
      userErrors { field message }
    }
  }
`;

const PRODUCT_DELETE_MEDIA = `
  mutation productDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
    productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
      deletedMediaIds
      userErrors { field message }
    }
  }
`;

const PRODUCT_CREATE_MEDIA = `
  mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media { id }
      userErrors { field message }
    }
  }
`;

function isRemoteUrl(src) {
  return /^https?:\/\//i.test(src);
}

function resolveLocalImagePath(src) {
  return resolve(src.startsWith("/") ? src : join(ROOT, src));
}

function mimeFromExt(ext) {
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}

async function stageLocalImage(filePath) {
  const resolved = resolveLocalImagePath(filePath);
  if (!existsSync(resolved)) {
    throw new Error(`Image not found: ${resolved}`);
  }

  const fileName = basename(resolved);
  const mimeType = mimeFromExt(extname(resolved));
  const fileSize = statSync(resolved).size;

  const data = await adminGraphql(STAGED_UPLOADS_CREATE, {
    input: [
      {
        filename: fileName,
        mimeType,
        resource: "IMAGE",
        httpMethod: "POST",
        fileSize: String(fileSize),
      },
    ],
  });

  const result = data.stagedUploadsCreate;
  if (result.userErrors?.length) {
    throw new Error(result.userErrors.map((e) => e.message).join("; "));
  }

  const target = result.stagedTargets?.[0];
  if (!target?.url || !target.resourceUrl) {
    throw new Error(`No staged target for ${fileName}`);
  }

  const formData = new FormData();
  for (const { name, value } of target.parameters ?? []) {
    formData.append(name, value);
  }
  formData.append(
    "file",
    new Blob([readFileSync(resolved)], { type: mimeType }),
    fileName,
  );

  const uploadRes = await fetch(target.url, { method: "POST", body: formData });
  if (!uploadRes.ok) {
    throw new Error(`Upload failed for ${fileName}: HTTP ${uploadRes.status}`);
  }

  return target.resourceUrl;
}

async function resolveImageSources(entry, dryRun) {
  const sources = [];
  for (const img of entry.images ?? []) {
    if (!img?.src) continue;
    if (isRemoteUrl(img.src)) {
      sources.push({ url: img.src, alt: img.altText ?? entry.title });
      continue;
    }
    if (dryRun) {
      sources.push({
        url: `[local:${resolveLocalImagePath(img.src)}]`,
        alt: img.altText ?? entry.title,
      });
      continue;
    }
    sources.push({
      url: await stageLocalImage(img.src),
      alt: img.altText ?? entry.title,
    });
  }
  return sources;
}

function parseArgs(argv) {
  const opts = { dryRun: false, file: DEFAULT_CATALOG };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--file" && argv[i + 1]) opts.file = resolve(argv[++i]);
  }
  return opts;
}

async function main() {
  const { dryRun, file } = parseArgs(process.argv.slice(2));
  if (!existsSync(file)) {
    console.error(`Catalog not found: ${file}`);
    process.exit(1);
  }

  const catalog = JSON.parse(readFileSync(file, "utf8"));
  const { products } = await adminGraphql(PRODUCTS_QUERY, { first: 50 });

  const bySku = new Map();
  const byTitle = new Map();
  for (const p of products.nodes) {
    byTitle.set(p.title.toLowerCase(), p);
    for (const v of p.variants.nodes) {
      if (v.sku) bySku.set(v.sku, p);
    }
  }

  let updated = 0;
  for (const entry of catalog) {
    const sku = entry.variants?.[0]?.sku;
    const product =
      (sku && bySku.get(sku)) ||
      byTitle.get(entry.title?.toLowerCase() ?? "");

    if (!product) {
      console.warn(`⚠ No match for "${entry.title}" — skip`);
      continue;
    }

    const mediaSources = await resolveImageSources(entry, dryRun);
    if (mediaSources.length === 0) {
      console.warn(`⚠ No images for "${entry.title}" — skip`);
      continue;
    }

    if (dryRun) {
      console.log(
        `[dry-run] ${product.title}: replace ${product.media.nodes.length} media with ${mediaSources.length} image(s)`,
      );
      updated++;
      continue;
    }

    const mediaIds = product.media.nodes.map((m) => m.id);
    if (mediaIds.length > 0) {
      const del = await adminGraphql(PRODUCT_DELETE_MEDIA, {
        productId: product.id,
        mediaIds,
      });
      if (del.productDeleteMedia.userErrors?.length) {
        throw new Error(
          del.productDeleteMedia.userErrors.map((e) => e.message).join("; "),
        );
      }
    }

    const create = await adminGraphql(PRODUCT_CREATE_MEDIA, {
      productId: product.id,
      media: mediaSources.map((s) => ({
        originalSource: s.url,
        alt: s.alt,
        mediaContentType: "IMAGE",
      })),
    });
    if (create.productCreateMedia.userErrors?.length) {
      throw new Error(
        create.productCreateMedia.userErrors.map((e) => e.message).join("; "),
      );
    }

    console.log(`✓ ${product.title}: ${mediaSources.length} image(s) updated`);
    updated++;
  }

  console.log(
    dryRun
      ? `[dry-run] Would update ${updated} product(s).`
      : `Done — updated ${updated} product(s).`,
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
