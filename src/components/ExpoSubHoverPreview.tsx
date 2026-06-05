import { useExpoSubHover } from "../context/ExpoSubHoverContext";
import { SubnavHoverPreview } from "./SubnavHoverPreview";

export function ExpoSubHoverPreview() {
  const { hoveredSlug } = useExpoSubHover();
  return (
    <SubnavHoverPreview
      documentType="exhibition"
      pathPrefix="/exposiciones"
      hoveredSlug={hoveredSlug}
    />
  );
}
