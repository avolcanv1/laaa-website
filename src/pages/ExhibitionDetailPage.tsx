import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { ExhibitionCascade } from "../components/ExhibitionCascade";
import { GalleryLightbox } from "../components/GalleryLightbox";
import { MobileDetailRouteBar } from "../components/MobileDetailRouteBar";
import { ProjectDetailGallery } from "../components/ProjectDetailGallery";
import { SanityQueryState } from "../components/SanityQueryState";
import { useExpoSubHover } from "../context/ExpoSubHoverContext";
import { useSanityProjectBySlug } from "../hooks/useSanityProjects";
import { cargoFreightUrlToOriginal } from "../lib/cargoImage";

export function ExhibitionDetailPage() {
  const { slug = "" } = useParams();
  const { hoveredSlug } = useExpoSubHover();
  const fetchState = useSanityProjectBySlug("exhibition", slug || undefined);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const hideActiveExhibitionContent = Boolean(
    hoveredSlug && slug && hoveredSlug !== slug,
  );

  const openAt = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLb = useCallback(() => setLightboxIndex(null), []);

  return (
    <SanityQueryState
      state={fetchState}
      loadingMessage="Cargando exposición…"
      errorMessage="No se pudo cargar la exposición."
    >
      {(content) => {
        if (!content) {
          return (
            <div className="exhibitionDetail exhibitionDetail--empty">
              <p className="exhibitionDetail__missing">Exposición no encontrada.</p>
            </div>
          );
        }

        return (
          <div
            className={
              hideActiveExhibitionContent
                ? "exhibitionDetail exhibitionDetail--hideActiveForHover"
                : "exhibitionDetail"
            }
          >
            <MobileDetailRouteBar
              sectionHref="/exposiciones"
              sectionLabel="Exposiciones"
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
      }}
    </SanityQueryState>
  );
}
