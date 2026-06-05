import { useLayoutEffect, useState } from "react";

/**
 * Loads `src` and returns whether it is strictly horizontal (width > height).
 * `null` until known or on error. Resets synchronously when `src` changes.
 */
export function useImageIsLandscape(src: string | undefined): boolean | null {
  const [resolved, setResolved] = useState<{
    src: string;
    landscape: boolean | null;
  } | null>(null);

  useLayoutEffect(() => {
    if (!src) {
      setResolved(null);
      return;
    }

    setResolved(null);
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) {
        setResolved({
          src,
          landscape: img.naturalWidth > img.naturalHeight,
        });
      }
    };
    img.onerror = () => {
      if (!cancelled) setResolved({ src, landscape: null });
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!src || resolved?.src !== src) return null;
  return resolved.landscape;
}
