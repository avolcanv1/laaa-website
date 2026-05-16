import { useLocation } from "react-router-dom";
import { useInvestigacionSubHover } from "../context/InvestigacionSubHoverContext";
import { useMobileLayoutMax1200 } from "../hooks/useMobileLayoutMax1200";
import { getInvestigacionContent } from "../data/investigacionContent";
import { ArchivalMedia } from "./ArchivalMedia";
import { ExhibitionHeroSlotShell } from "./ExhibitionHeroSlotShell";

function investigacionSlugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/investigacion\/([^/]+)$/);
  return m ? m[1] : null;
}

export function InvestigacionSubHoverPreview() {
  const isMobileLayout = useMobileLayoutMax1200();
  const { hoveredSlug } = useInvestigacionSubHover();
  const { pathname } = useLocation();
  const activeSlug = investigacionSlugFromPath(pathname);

  if (isMobileLayout) return null;

  const skipPreview =
    !hoveredSlug || (activeSlug !== null && hoveredSlug === activeSlug);
  const content =
    !skipPreview && hoveredSlug
      ? getInvestigacionContent(hoveredSlug)
      : undefined;
  const hero = content?.slideshow[0];

  if (skipPreview) return null;
  if (!content) return null;
  if (!hero) return null;

  return (
    <div className="expoSubHover expoSubHover--imageOnly" aria-hidden>
      <div className="expoSubHover__inner">
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
    </div>
  );
}
