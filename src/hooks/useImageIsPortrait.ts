import { useEffect, useState } from "react";

/**
 * `true` when the image is strictly vertical (height > width).
 * `null` until loaded or on error.
 */
export function useImageIsPortrait(src: string | undefined): boolean | null {
  const [portrait, setPortrait] = useState<boolean | null>(null);

  useEffect(() => {
    if (!src) {
      setPortrait(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) {
        setPortrait(img.naturalHeight > img.naturalWidth);
      }
    };
    img.onerror = () => {
      if (!cancelled) setPortrait(null);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return portrait;
}
