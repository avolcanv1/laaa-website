import { useTalleresSubHover } from "../context/TalleresSubHoverContext";
import { SubnavHoverPreview } from "./SubnavHoverPreview";

export function TalleresSubHoverPreview() {
  const { hoveredSlug } = useTalleresSubHover();
  return (
    <SubnavHoverPreview
      documentType="taller"
      pathPrefix="/talleres"
      hoveredSlug={hoveredSlug}
    />
  );
}
