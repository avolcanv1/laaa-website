import { useRef } from "react";
import { useLocation } from "react-router-dom";

import { useHoverFade } from "../hooks/useHoverFade";
import { useMobileLayoutMax1200 } from "../hooks/useMobileLayoutMax1200";
import { useSanityProjectBySlug } from "../hooks/useSanityProjects";
import type { ProjectDocumentType } from "../lib/queries";
import { ArchivalMedia } from "./ArchivalMedia";
import { ExhibitionHeroSlotShell } from "./ExhibitionHeroSlotShell";
import { SanityQueryState } from "./SanityQueryState";

type SubnavHoverPreviewProps = {
  documentType: ProjectDocumentType;
  pathPrefix: "/exposiciones" | "/investigacion" | "/talleres";
  hoveredSlug: string | null;
};

function activeSlugFromPath(pathname: string, pathPrefix: string): string | null {
  const m = pathname.match(new RegExp(`^${pathPrefix}/([^/]+)$`));
  return m ? m[1]! : null;
}

function SubnavHoverPreviewContent({
  hoveredSlug,
  documentType,
}: {
  hoveredSlug: string;
  documentType: ProjectDocumentType;
}) {
  const fetchState = useSanityProjectBySlug(documentType, hoveredSlug);

  return (
    <SanityQueryState
      state={fetchState}
      errorMessage="No se pudo cargar la vista previa."
    >
      {(content) => {
        const hero = content?.slideshow[0];
        if (!content || content.slug !== hoveredSlug || !hero) return null;

        return (
          <div key={hoveredSlug} className="expoSubHover__inner">
            <ExhibitionHeroSlotShell heroUrl={hero}>
              <div className="exhibitionSlideshow__heroBtn">
                <ArchivalMedia
                  src={hero}
                  alt=""
                  treatment="archival"
                  className="exhibitionHeroSlot__media"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </ExhibitionHeroSlotShell>
          </div>
        );
      }}
    </SanityQueryState>
  );
}

export function SubnavHoverPreview({
  documentType,
  pathPrefix,
  hoveredSlug,
}: SubnavHoverPreviewProps) {
  const isMobileLayout = useMobileLayoutMax1200();
  const { pathname } = useLocation();
  const activeSlug = activeSlugFromPath(pathname, pathPrefix);
  const shouldShow = Boolean(
    hoveredSlug && !(activeSlug !== null && hoveredSlug === activeSlug),
  );

  const lastSlugRef = useRef<string | null>(null);
  if (hoveredSlug) lastSlugRef.current = hoveredSlug;
  const displaySlug = hoveredSlug ?? lastSlugRef.current;

  const { mounted, visible } = useHoverFade(shouldShow);

  if (isMobileLayout || !mounted || !displaySlug) return null;

  return (
    <div
      className={[
        "expoSubHover",
        "expoSubHover--imageOnly",
        "hoverFade",
        visible ? "hoverFade--visible" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <SubnavHoverPreviewContent
        hoveredSlug={displaySlug}
        documentType={documentType}
      />
    </div>
  );
}
