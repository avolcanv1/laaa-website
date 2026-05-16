import { useLayoutEffect, useState } from "react";

/**
 * Loads `src` and returns whether it is strictly horizontal (width > height).
 * `null` until known or on error.
 */
export function useImageIsLandscape(src: string | undefined): boolean | null {
  const [landscape, setLandscape] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    if (!src) {
      setLandscape(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) {
        setLandscape(img.naturalWidth > img.naturalHeight);
      }
    };
    img.onerror = () => {
      if (!cancelled) setLandscape(null);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return landscape;
}
