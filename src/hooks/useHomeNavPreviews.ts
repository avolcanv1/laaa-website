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

    fetchHomeNavPreviews()
      .then((data) => {
        if (!cancelled) setPreviews(data);
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
