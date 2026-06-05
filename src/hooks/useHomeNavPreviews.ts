import { useEffect, useState } from "react";

import {
  fetchHomeNavPreviews,
  type NavHoverPreviewData,
} from "../lib/homeNavPreviews";
import type { NavHoverKey } from "../nav/navHoverPreviews";
import { NAV_HOVER_PREVIEWS } from "../nav/navHoverPreviews";

export function useHomeNavPreviews(): Partial<
  Record<NavHoverKey, NavHoverPreviewData>
> {
  const [previews, setPreviews] = useState<
    Partial<Record<NavHoverKey, NavHoverPreviewData>>
  >({});

  useEffect(() => {
    let cancelled = false;

    for (const preview of Object.values(NAV_HOVER_PREVIEWS)) {
      const img = new Image();
      img.src = preview.imageSrc;
    }

    fetchHomeNavPreviews()
      .then((data) => {
        if (cancelled) return;
        setPreviews(data);
        for (const preview of Object.values(data)) {
          if (!preview?.imageSrc) continue;
          const img = new Image();
          img.src = preview.imageSrc;
        }
      })
      .catch(() => {
        if (!cancelled) setPreviews({});
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return previews;
}

export function resolveNavHoverPreview(
  key: NavHoverKey,
  fromSanity: Partial<Record<NavHoverKey, NavHoverPreviewData>>,
): NavHoverPreviewData {
  const cms = fromSanity[key];
  const fallback = NAV_HOVER_PREVIEWS[key];
  return {
    imageSrc: cms?.imageSrc || fallback.imageSrc,
    caption: cms?.caption ?? "",
    overlayColor: cms?.overlayColor || fallback.overlayColor,
    layout: cms?.layout || fallback.layout,
  };
}
