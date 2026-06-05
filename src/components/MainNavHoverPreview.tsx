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
  const layoutMod =
    preview.layout === "vertical"
      ? "mainHoverPreview--vertical"
      : "mainHoverPreview--horizontal";

  return (
    <div
      className={`mainHoverPreview ${layoutMod}`.trim()}
      aria-hidden={!preview.caption}
    >
      <div className="mainHoverPreview__imageWrap">
        <img src={preview.imageSrc} alt="" className="mainHoverPreview__img" />
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
