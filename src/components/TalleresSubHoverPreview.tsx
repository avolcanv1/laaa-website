import { useLocation } from "react-router-dom";
import { useTalleresSubHover } from "../context/TalleresSubHoverContext";
import { useMobileLayoutMax1200 } from "../hooks/useMobileLayoutMax1200";
import { getTalleresContent } from "../data/talleresContent";
import { ArchivalMedia } from "./ArchivalMedia";
import { ExhibitionHeroSlotShell } from "./ExhibitionHeroSlotShell";

function talleresSlugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/talleres\/([^/]+)$/);
  return m ? m[1] : null;
}

export function TalleresSubHoverPreview() {
  const isMobileLayout = useMobileLayoutMax1200();
  const { hoveredSlug } = useTalleresSubHover();
  const { pathname } = useLocation();
  const activeSlug = talleresSlugFromPath(pathname);

  if (isMobileLayout) return null;

  const skipPreview =
    !hoveredSlug || (activeSlug !== null && hoveredSlug === activeSlug);
  const content =
    !skipPreview && hoveredSlug ? getTalleresContent(hoveredSlug) : undefined;
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
