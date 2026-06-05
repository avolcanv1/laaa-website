import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  resolveNavHoverPreview,
  useHomeNavPreviews,
} from "../hooks/useHomeNavPreviews";
import { useHoverFade } from "../hooks/useHoverFade";
import { useMainNavHover } from "../context/MainNavHoverContext";
import type { NavHoverPreviewData } from "../lib/homeNavPreviews";

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
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageReady, setImageReady] = useState(false);

  const layoutMod =
    displayPreview?.layout === "vertical"
      ? "mainHoverPreview--vertical"
      : "mainHoverPreview--horizontal";

  useEffect(() => {
    if (!displayPreview) {
      setImageReady(false);
      return;
    }
    setImageReady(false);
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setImageReady(true);
  }, [displayPreview?.imageSrc, displayPreview]);

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
        className={[
          "mainHoverPreview__imageWrap",
          "hoverContentEnter",
          imageReady ? "mainHoverPreview__imageWrap--ready" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <img
          ref={imgRef}
          src={displayPreview.imageSrc}
          alt=""
          className="mainHoverPreview__img"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setImageReady(true)}
        />
        <div
          className="mainHoverPreview__tint"
          style={{ backgroundColor: displayPreview.overlayColor }}
        />
      </div>
      {displayPreview.caption ? (
        <p className="mainHoverPreview__caption">{displayPreview.caption}</p>
      ) : null}
    </div>
  );
}
