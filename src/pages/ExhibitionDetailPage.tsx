import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ExhibitionCascade } from "../components/ExhibitionCascade";
import { GalleryLightbox } from "../components/GalleryLightbox";
import { MobileDetailRouteBar } from "../components/MobileDetailRouteBar";
import { ProjectBody } from "../components/ProjectBody";
import { ProjectDetailEnter } from "../components/ProjectDetailEnter";
import { ProjectDetailGallery } from "../components/ProjectDetailGallery";
import { SanityQueryState } from "../components/SanityQueryState";
import { useExpoSubHover } from "../context/ExpoSubHoverContext";
import { useProjectDetailNavigation } from "../hooks/useProjectDetailNavigation";
import { useSanityProjectBySlug } from "../hooks/useSanityProjects";

export function ExhibitionDetailPage() {
  const { slug = "" } = useParams();
  const { hoveredSlug } = useExpoSubHover();
  const fetchState = useSanityProjectBySlug("exhibition", slug || undefined);
  const { skipEnter } = useProjectDetailNavigation(slug, hoveredSlug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const hideActiveExhibitionContent = Boolean(
    hoveredSlug && slug && hoveredSlug !== slug,
  );

  const openAt = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLb = useCallback(() => setLightboxIndex(null), []);

  useEffect(() => {
    setLightboxIndex(null);
  }, [slug]);

  return (
    <SanityQueryState
      state={fetchState}
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

        if (content.slug !== slug) {
          return null;
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
                images={content.slideshowLightbox}
                index={lightboxIndex}
                onClose={closeLb}
                onGoTo={setLightboxIndex}
              />
            ) : null}
            {content.slideshow.length > 0 ? (
              <ProjectDetailEnter key={slug} slugKey={slug} skipEnter={skipEnter}>
                <ProjectDetailGallery
                  slugKey={slug}
                  title={content.title}
                  slideshow={content.slideshow}
                  cascade={content.cascade}
                  onOpenLightbox={openAt}
                  betweenHeroAndCascade={
                    <ProjectBody body={content.body} bodyBlocks={content.bodyBlocks} />
                  }
                />
              </ProjectDetailEnter>
            ) : (
              <ProjectDetailEnter key={slug} slugKey={slug} skipEnter={skipEnter}>
                <ProjectBody body={content.body} bodyBlocks={content.bodyBlocks} />
                <ExhibitionCascade
                  blocks={content.cascade}
                  slideshow={content.slideshow}
                  onOpenLightbox={openAt}
                />
              </ProjectDetailEnter>
            )}
          </div>
        );
      }}
    </SanityQueryState>
  );
}
