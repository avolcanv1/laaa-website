import { useTalleresSubHover } from "../context/TalleresSubHoverContext";
import { SubnavHoverPreview } from "./SubnavHoverPreview";
import { SECTION_PATHS } from "../nav/sectionLabels";

export function TalleresSubHoverPreview() {
  const { hoveredSlug } = useTalleresSubHover();
  return (
    <SubnavHoverPreview
      documentType="taller"
      pathPrefix={SECTION_PATHS.talleres}
      hoveredSlug={hoveredSlug}
    />
  );
}
