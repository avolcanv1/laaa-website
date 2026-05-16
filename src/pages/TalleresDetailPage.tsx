import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { ExhibitionCascade } from "../components/ExhibitionCascade";
import { GalleryLightbox } from "../components/GalleryLightbox";
import { MobileDetailRouteBar } from "../components/MobileDetailRouteBar";
import { ProjectDetailGallery } from "../components/ProjectDetailGallery";
import { useTalleresSubHover } from "../context/TalleresSubHoverContext";
import { getTalleresContent } from "../data/talleresContent";
import { cargoFreightUrlToOriginal } from "../lib/cargoImage";

export function TalleresDetailPage() {
  const { slug = "" } = useParams();
  const { hoveredSlug } = useTalleresSubHover();
  const content = getTalleresContent(slug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const hideActiveContent = Boolean(
    hoveredSlug && slug && hoveredSlug !== slug,
  );

  const openAt = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLb = useCallback(() => setLightboxIndex(null), []);

  if (!content) {
    return (
      <div className="exhibitionDetail exhibitionDetail--empty">
        <p className="exhibitionDetail__missing">Taller no encontrado.</p>
      </div>
    );
  }

  return (
    <div
      className={
        hideActiveContent
          ? "exhibitionDetail exhibitionDetail--hideActiveForHover"
          : "exhibitionDetail"
      }
    >
      <MobileDetailRouteBar
        sectionHref="/talleres"
        sectionLabel="Talleres"
        entryTitle={content.title}
      />
      {lightboxIndex !== null && content.slideshow.length > 0 ? (
        <GalleryLightbox
          images={content.slideshow.map(cargoFreightUrlToOriginal)}
          index={lightboxIndex}
          onClose={closeLb}
          onGoTo={setLightboxIndex}
        />
      ) : null}
      {content.slideshow.length > 0 ? (
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
