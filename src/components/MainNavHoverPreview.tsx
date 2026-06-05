import { useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  resolveNavHoverPreview,
  useHomeNavPreviews,
} from "../hooks/useHomeNavPreviews";
import { useHoverFade } from "../hooks/useHoverFade";
import { useMainNavHover } from "../context/MainNavHoverContext";
import type { NavHoverPreviewData } from "../lib/homeNavPreviews";
import { ArchivalMedia } from "./ArchivalMedia";

export function MainNavHoverPreview() {
  const { pathname } = useLocation();
  const { hovered } = useMainNavHover();
  const previews = useHomeNavPreviews();
  const isTienda = pathname.startsWith("/tienda");
  const preview =
    hovered && !isTienda ? resolveNavHoverPreview(hovered, previews) : null;

  const lastPreviewRef = useRef<NavHoverPreviewData | null>(null);
  if (preview) lastPreviewRef.current = preview;
  const displayPreview = preview ?? lastPreviewRef.current;

  const { mounted, visible } = useHoverFade(Boolean(preview));

  const layoutMod =
    displayPreview?.layout === "vertical"
      ? "mainHoverPreview--vertical"
      : "mainHoverPreview--horizontal";

  if (!mounted || !displayPreview) return null;

  return (
    <div
      className={[
        "mainHoverPreview",
        "hoverFade",
        layoutMod,
        visible ? "hoverFade--visible" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={!displayPreview.caption}
    >
      <div
        key={displayPreview.imageSrc}
        className={["mainHoverPreview__imageWrap", "hoverContentEnter"]
          .filter(Boolean)
          .join(" ")}
      >
        <ArchivalMedia
          src={displayPreview.imageSrc}
          alt=""
          treatment="archival"
          washColor={displayPreview.overlayColor}
          className="mainHoverPreview__media"
          loading="eager"
          fetchPriority="high"
        />
      </div>
      {displayPreview.caption ? (
        <p className="mainHoverPreview__caption">{displayPreview.caption}</p>
      ) : null}
    </div>
  );
}
