import { useLocation } from "react-router-dom";
import { NAV_HOVER_PREVIEWS } from "../nav/navHoverPreviews";
import { useMainNavHover } from "../context/MainNavHoverContext";

export function MainNavHoverPreview() {
  const { pathname } = useLocation();
  const { hovered } = useMainNavHover();
  const isTienda = pathname.startsWith("/tienda");
  if (!hovered) return null;
  if (isTienda) return null;

  const preview = NAV_HOVER_PREVIEWS[hovered];
  const layoutMod =
    preview.layout === "vertical"
      ? "mainHoverPreview--vertical"
      : "mainHoverPreview--horizontal";

  return (
    <div
      className={`mainHoverPreview ${layoutMod}`.trim()}
      aria-hidden
    >
      <div className="mainHoverPreview__imageWrap">
        <img src={preview.imageSrc} alt="" className="mainHoverPreview__img" />
        <div
          className="mainHoverPreview__tint"
          style={{ backgroundColor: preview.overlayColor }}
        />
      </div>
    </div>
  );
}
