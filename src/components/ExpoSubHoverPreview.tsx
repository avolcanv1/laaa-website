import { useLocation } from "react-router-dom";
import { useExpoSubHover } from "../context/ExpoSubHoverContext";
import { useMobileLayoutMax1200 } from "../hooks/useMobileLayoutMax1200";
import { getExhibitionContent } from "../data/exhibitionContent";
import { ArchivalMedia } from "./ArchivalMedia";
import { ExhibitionHeroSlotShell } from "./ExhibitionHeroSlotShell";

function exhibitionSlugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/exposiciones\/([^/]+)$/);
  return m ? m[1] : null;
}

/**
 * Second column hover: same hero proportion ladder as ficha (`ExhibitionHeroSlotShell`);
 * archival (yellow) treatment. On a ficha, skip when hovering the open row.
 */
export function ExpoSubHoverPreview() {
  const isMobileLayout = useMobileLayoutMax1200();
  const { hoveredSlug } = useExpoSubHover();
  const { pathname } = useLocation();
  const activeSlug = exhibitionSlugFromPath(pathname);

  if (isMobileLayout) return null;

  const skipPreview =
    !hoveredSlug || (activeSlug !== null && hoveredSlug === activeSlug);
  const content =
    !skipPreview && hoveredSlug ? getExhibitionContent(hoveredSlug) : undefined;
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
