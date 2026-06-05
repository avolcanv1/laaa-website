import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  resolveNavHoverPreview,
  useHomeNavPreviews,
} from "../hooks/useHomeNavPreviews";
import { useMainNavHover } from "../context/MainNavHoverContext";

export function MainNavHoverPreview() {
  const { pathname } = useLocation();
  const { hovered } = useMainNavHover();
  const previews = useHomeNavPreviews();
  const isTienda = pathname.startsWith("/tienda");
  if (!hovered) return null;
  if (isTienda) return null;

  const preview = resolveNavHoverPreview(hovered, previews);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageReady, setImageReady] = useState(false);
  const layoutMod =
    preview.layout === "vertical"
      ? "mainHoverPreview--vertical"
      : "mainHoverPreview--horizontal";

  useEffect(() => {
    setImageReady(false);
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setImageReady(true);
  }, [preview.imageSrc]);

  return (
    <div
      className={`mainHoverPreview ${layoutMod}`.trim()}
      aria-hidden={!preview.caption}
    >
      <div
        className={`mainHoverPreview__imageWrap${
          imageReady ? " mainHoverPreview__imageWrap--ready" : ""
        }`.trim()}
      >
        <img
          ref={imgRef}
          src={preview.imageSrc}
          alt=""
          className="mainHoverPreview__img"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setImageReady(true)}
        />
        <div
          className="mainHoverPreview__tint"
          style={{ backgroundColor: preview.overlayColor }}
        />
      </div>
      {preview.caption ? (
        <p className="mainHoverPreview__caption">{preview.caption}</p>
      ) : null}
    </div>
  );
}
