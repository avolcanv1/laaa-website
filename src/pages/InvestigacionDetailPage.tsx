import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { ExhibitionCascade } from "../components/ExhibitionCascade";
import { GalleryLightbox } from "../components/GalleryLightbox";
import { MobileDetailRouteBar } from "../components/MobileDetailRouteBar";
import { ProjectDetailGallery } from "../components/ProjectDetailGallery";
import { useInvestigacionSubHover } from "../context/InvestigacionSubHoverContext";
import { getInvestigacionContent } from "../data/investigacionContent";
import { cargoFreightUrlToOriginal } from "../lib/cargoImage";

export function InvestigacionDetailPage() {
  const { slug = "" } = useParams();
  const { hoveredSlug } = useInvestigacionSubHover();
  const content = getInvestigacionContent(slug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const hideActiveExhibitionContent = Boolean(
    hoveredSlug && slug && hoveredSlug !== slug,
  );

  const openAt = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLb = useCallback(() => setLightboxIndex(null), []);

  if (!content) {
    return (
      <div className="exhibitionDetail exhibitionDetail--empty">
        <p className="exhibitionDetail__missing">Proyecto no encontrado.</p>
      </div>
    );
  }

  const hasSlides = content.slideshow.length > 0;

  return (
    <div
      className={
        hideActiveExhibitionContent
          ? "exhibitionDetail exhibitionDetail--hideActiveForHover"
          : "exhibitionDetail"
      }
    >
      <MobileDetailRouteBar
        sectionHref="/investigacion"
        sectionLabel="Investigación y desarrollo"
        entryTitle={content.title}
      />
      {lightboxIndex !== null && hasSlides ? (
        <GalleryLightbox
          images={content.slideshow.map(cargoFreightUrlToOriginal)}
          index={lightboxIndex}
          onClose={closeLb}
          onGoTo={setLightboxIndex}
        />
      ) : null}
      {hasSlides ? (
        <ProjectDetailGallery
          slugKey={slug}
          title={content.title}
          slideshow={content.slideshow}
          cascade={content.cascade}
          onOpenLightbox={openAt}
          betweenHeroAndCascade={
            <p className="exhibitionDetail__body">{content.body}</p>
          }
        />
      ) : (
        <>
          <p className="exhibitionDetail__body">{content.body}</p>
          <ExhibitionCascade
            blocks={content.cascade}
            slideshow={content.slideshow}
            onOpenLightbox={openAt}
          />
        </>
      )}
    </div>
  );
}
