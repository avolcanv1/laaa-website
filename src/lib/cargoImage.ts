/**
 * Exhibition/project photos live as flat files under `public/cargo-media/`
 * (`{assetId}__{filename}`). Run `npm run download-media` to populate them.
 */

/** Mirrors naming in scripts/download-cargo-media.mjs — keep both in sync */
function cargoMediaFlatFilename(assetId: string, filename: string): string {
  const safe = filename.replace(/\//g, "_").replace(/__/g, "_");
  return `${assetId}__${safe}`;
}

function cargoMediaPublicUrl(assetId: string, filename: string): string {
  const flat = cargoMediaFlatFilename(assetId, filename);
  return `/cargo-media/${encodeURIComponent(flat)}`;
}

/**
 * Legacy helper name — previously pointed at Cargo’s JPEG-quality CDN path.
 * Quality is ignored for local assets (original files on disk).
 */
export function cargoImageForWeb(
  id: string,
  file: string,
  _quality: number = 78,
): string {
  void _quality;
  return cargoMediaPublicUrl(id, file);
}

export function cargoImageOriginal(id: string, file: string): string {
  return cargoMediaPublicUrl(id, file);
}

/** Lightbox uses originals; local `/cargo-media/` URLs are already full files. */
export function cargoFreightUrlToOriginal(url: string): string {
  if (!url.includes("freight.cargo.site")) return url;
  if (url.includes("/t/original/i/")) return url;
  if (/\/t\/q\/\d+\/i\//.test(url)) {
    return url.replace(/\/t\/q\/\d+\/i\//, "/t/original/i/");
  }
  return url;
}
