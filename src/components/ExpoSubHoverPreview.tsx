import { useExpoSubHover } from "../context/ExpoSubHoverContext";
import { SubnavHoverPreview } from "./SubnavHoverPreview";
import { SECTION_PATHS } from "../nav/sectionLabels";

export function ExpoSubHoverPreview() {
  const { hoveredSlug } = useExpoSubHover();
  return (
    <SubnavHoverPreview
      documentType="exhibition"
      pathPrefix={SECTION_PATHS.exposiciones}
      hoveredSlug={hoveredSlug}
    />
  );
}
