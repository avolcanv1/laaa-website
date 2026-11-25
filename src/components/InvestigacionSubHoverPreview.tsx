import { useInvestigacionSubHover } from "../context/InvestigacionSubHoverContext";
import { SubnavHoverPreview } from "./SubnavHoverPreview";
import { SECTION_PATHS } from "../nav/sectionLabels";

export function InvestigacionSubHoverPreview() {
  const { hoveredSlug } = useInvestigacionSubHover();
  return (
    <SubnavHoverPreview
      documentType="investigacion"
      pathPrefix={SECTION_PATHS.investigacion}
      hoveredSlug={hoveredSlug}
    />
  );
}
