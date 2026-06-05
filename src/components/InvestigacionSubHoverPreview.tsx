import { useInvestigacionSubHover } from "../context/InvestigacionSubHoverContext";
import { SubnavHoverPreview } from "./SubnavHoverPreview";

export function InvestigacionSubHoverPreview() {
  const { hoveredSlug } = useInvestigacionSubHover();
  return (
    <SubnavHoverPreview
      documentType="investigacion"
      pathPrefix="/investigacion"
      hoveredSlug={hoveredSlug}
    />
  );
}
