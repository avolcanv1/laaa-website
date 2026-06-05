/**
 * Upload products to Shopify via Admin API (productCreate + publish to storefront).
 *
 * Requires in .env.local (scripts only — not VITE_):
 *   SHOPIFY_STORE_DOMAIN
 *   SHOPIFY_ADMIN_ACCESS_TOKEN
 *
 * Catalog: data/shop-products.json
 *
 * Example entry:
 * [
 *   {
 *     "title": "Example Print",
 *     "descriptionHtml": "<p>Short description.</p>",
 *     "vendor": "LAAA",
 *     "productType": "Print",
 *     "tags": ["art"],
 *     "status": "ACTIVE",
 *     "variants": [{ "price": "25.00", "sku": "PRINT-001" }],
 *     "images": [{ "src": "https://example.com/photo.jpg", "altText": "Cover" }]
 *     // Local paths (relative to repo root or absolute) are staged-uploaded automatically:
 *     "images": [{ "src": "data/shop-product-images/05-01/item.jpeg", "altText": "Cover" }]
 *   }
 * ]
 *
 * Usage:
 *   node scripts/upload-shopify-products.mjs [--dry-run] [--file path/to/catalog.json]
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
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
  }
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data;
}

const PRODUCTS_COUNT_QUERY = `
  query ProductsCount {
    productsCount {
      count
    }
  }
`;

const PUBLICATIONS_QUERY = `
  query Publications {
    publications(first: 20) {
      edges {
        node {
          id
          name
          catalog {
            title
          }
        }
      }
    }
  }
`;

const PRODUCT_CREATE = `
  mutation ProductCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
    productCreate(product: $product, media: $media) {
      product {
        id
        title
        handle
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PRODUCT_VARIANTS_BULK_CREATE = `
  mutation ProductVariantsBulkCreate(
    $productId: ID!
    $strategy: ProductVariantsBulkCreateStrategy
    $variants: [ProductVariantsBulkInput!]!
  ) {
    productVariantsBulkCreate(
      productId: $productId
      strategy: $strategy
      variants: $variants
    ) {
      productVariants {
        id
        price
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PUBLISHABLE_PUBLISH = `
  mutation PublishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        availablePublicationsCount {
          count
        }
      }
      userErrors {
        field
        message
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
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
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
    throw new Error(
      `stagedUploadsCreate (${fileName}): ${result.userErrors.map((e) => e.message).join("; ")}`,
    );
  }

  const target = result.stagedTargets?.[0];
  if (!target?.url || !target.resourceUrl) {
    throw new Error(`stagedUploadsCreate returned no target for ${fileName}`);
  }

  const formData = new FormData();
  for (const { name, value } of target.parameters ?? []) {
    formData.append(name, value);
  }
  formData.append("file", new Blob([readFileSync(resolved)], { type: mimeType }), fileName);

  const uploadRes = await fetch(target.url, { method: "POST", body: formData });
  if (!uploadRes.ok) {
    const body = await uploadRes.text().catch(() => "");
    throw new Error(`Staged upload failed for ${fileName}: HTTP ${uploadRes.status} ${body}`);
  }

  return target.resourceUrl;
}

function parseArgs(argv) {
  const opts = { dryRun: false, file: DEFAULT_CATALOG };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--file" && argv[i + 1]) opts.file = resolve(argv[++i]);
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: node scripts/upload-shopify-products.mjs [--dry-run] [--file catalog.json]`);
      process.exit(0);
    }
  }
  return opts;
}

function buildProductInput(entry) {
  return {
    title: entry.title,
    descriptionHtml: entry.descriptionHtml ?? "",
    vendor: entry.vendor ?? undefined,
    productType: entry.productType ?? undefined,
    tags: entry.tags ?? [],
    status: entry.status ?? "ACTIVE",
  };
}

function buildVariantInputs(entry) {
  return (entry.variants ?? []).map((v) => ({
    price: String(v.price),
    inventoryPolicy: "CONTINUE",
    inventoryItem: v.sku ? { sku: v.sku } : undefined,
  }));
}

function buildMediaInput(entry, stagedSources) {
  return (entry.images ?? []).map((img, index) => ({
    originalSource: stagedSources[index],
    alt: img.altText ?? entry.title,
    mediaContentType: "IMAGE",
  }));
}

async function resolveImageSources(entry, dryRun) {
  const images = entry.images ?? [];
  const sources = [];

  for (const img of images) {
    if (!img?.src) continue;
    if (isRemoteUrl(img.src)) {
      sources.push(img.src);
      continue;
    }
    if (dryRun) {
      sources.push(`[local:${resolveLocalImagePath(img.src)}]`);
      continue;
    }
    sources.push(await stageLocalImage(img.src));
  }

  return sources;
}

async function resolvePublicationIds() {
  const data = await adminGraphql(PUBLICATIONS_QUERY);
  const pubs = data.publications?.edges?.map(({ node }) => node) ?? [];
  if (pubs.length === 0) {
    throw new Error("No publications found — enable a sales channel in Shopify Admin.");
  }

  const preferred = pubs.filter((p) =>
    /headless|online store|tienda|storefront/i.test(
      `${p.name ?? ""} ${p.catalog?.title ?? ""}`,
    ),
  );
  const chosen = preferred.length > 0 ? preferred : pubs;
  return chosen.map((p) => ({ publicationId: p.id }));
}

async function createAndPublishProduct(entry, publicationInputs, dryRun) {
  const product = buildProductInput(entry);
  const stagedSources = await resolveImageSources(entry, dryRun);
  const media = buildMediaInput(entry, stagedSources);

  if (dryRun) {
    const imageNote =
      stagedSources.length > 0
        ? ` (${stagedSources.length} image(s): ${stagedSources.map((s) => (s.startsWith("[local:") ? "local file" : "url")).join(", ")})`
        : "";
    console.log(`[dry-run] Would create: ${entry.title}${imageNote}`);
    return { id: null, title: entry.title, dryRun: true };
  }

  const data = await adminGraphql(PRODUCT_CREATE, { product, media });
  const result = data.productCreate;
  if (result.userErrors?.length) {
    throw new Error(
      `productCreate (${entry.title}): ${result.userErrors.map((e) => e.message).join("; ")}`,
    );
  }

  const created = result.product;
  if (!created?.id) {
    throw new Error(`productCreate returned no product for "${entry.title}"`);
  }

  const variants = buildVariantInputs(entry);
  if (variants.length > 0) {
    const variantData = await adminGraphql(PRODUCT_VARIANTS_BULK_CREATE, {
      productId: created.id,
      strategy: "REMOVE_STANDALONE_VARIANT",
      variants,
    });
    const variantResult = variantData.productVariantsBulkCreate;
    if (variantResult.userErrors?.length) {
      throw new Error(
        `productVariantsBulkCreate (${entry.title}): ${variantResult.userErrors.map((e) => e.message).join("; ")}`,
      );
    }
  }

  const pubData = await adminGraphql(PUBLISHABLE_PUBLISH, {
    id: created.id,
    input: publicationInputs,
  });
  const pubResult = pubData.publishablePublish;
  if (pubResult.userErrors?.length) {
    throw new Error(
      `publishablePublish (${entry.title}): ${pubResult.userErrors.map((e) => e.message).join("; ")}`,
    );
  }

  console.log(`✓ ${created.title} (${created.handle}) → ${created.id}`);
  return created;
}

async function main() {
  const { dryRun, file } = parseArgs(process.argv.slice(2));

  if (!existsSync(file)) {
    console.error(`Catalog not found: ${file}`);
    process.exit(1);
  }

  const catalog = JSON.parse(readFileSync(file, "utf8"));
  if (!Array.isArray(catalog)) {
    console.error("Catalog must be a JSON array of product objects.");
    process.exit(1);
  }

  const countData = await adminGraphql(PRODUCTS_COUNT_QUERY);
  const existingCount = countData.productsCount?.count ?? 0;
  console.log(`Store has ${existingCount} product(s) before upload.`);

  if (catalog.length === 0) {
    console.log("Catalog is empty — add products to data/shop-products.json and re-run.");
    return;
  }

  for (const entry of catalog) {
    if (!entry?.title) {
      console.warn("Skipping entry without title:", entry);
      continue;
    }
  }

  const valid = catalog.filter((e) => e?.title);
  const publicationInputs = dryRun ? [] : await resolvePublicationIds();

  if (!dryRun && publicationInputs.length > 0) {
    console.log(`Publishing to ${publicationInputs.length} channel(s).`);
  }

  let created = 0;
  for (const entry of valid) {
    await createAndPublishProduct(entry, publicationInputs, dryRun);
    created++;
  }

  console.log(
    dryRun
      ? `[dry-run] Would upload ${created} product(s).`
      : `Done — created ${created} product(s).`,
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
