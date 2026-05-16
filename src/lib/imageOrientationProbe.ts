export type ImageOrientationKind = "landscape" | "portrait" | "square";

export function probeImageOrientation(
  src: string,
): Promise<ImageOrientationKind | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (w > h) resolve("landscape");
      if (h > w) resolve("portrait");
      resolve("square");
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function probeImageOrientations(
  urls: string[],
): Promise<(ImageOrientationKind | null)[]> {
  return Promise.all(urls.map(probeImageOrientation));
}

/** Desktop: landscape + square. Mobile: portrait + square (reads well in vertical / mosaic tiles). */
export function urlMatchesBreakpointOrientation(
  o: ImageOrientationKind | null,
  isMobile: boolean,
): boolean {
  if (!o) return false;
  if (o === "square") return true;
  return isMobile ? o === "portrait" : o === "landscape";
}
