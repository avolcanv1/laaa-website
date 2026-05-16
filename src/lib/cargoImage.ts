/**
 * Cargo freight CDN supports JPEG recompression via `/t/q/{quality}/i/…`
 * (much smaller than `/t/original/i/…` for large exhibition photos).
 * Other hosts / already-original URLs are left unchanged by {@link cargoFreightUrlToOriginal}.
 */

const FREIGHT = "https://freight.cargo.site";

/** Default JPEG quality for in-page display (hero, grid, hover previews). */
const DEFAULT_WEB_QUALITY = 78;

export function cargoImageForWeb(
  id: string,
  file: string,
  quality: number = DEFAULT_WEB_QUALITY,
): string {
  return `${FREIGHT}/t/q/${quality}/i/${id}/${file}`;
}

export function cargoImageOriginal(id: string, file: string): string {
  return `${FREIGHT}/t/original/i/${id}/${file}`;
}

/**
 * Use full-resolution Cargo assets in the lightbox while the page uses compressed URLs.
 */
export function cargoFreightUrlToOriginal(url: string): string {
  if (!url.includes("freight.cargo.site")) return url;
  if (url.includes("/t/original/i/")) return url;
  if (/\/t\/q\/\d+\/i\//.test(url)) {
    return url.replace(/\/t\/q\/\d+\/i\//, "/t/original/i/");
  }
  return url;
}
