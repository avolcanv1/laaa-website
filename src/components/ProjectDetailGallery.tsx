import type { ReactNode } from "react";
import type { GalleryCascadeBlock } from "../data/exhibitionContent";
import { ExhibitionCascade } from "./ExhibitionCascade";
import { ExhibitionSlideshow } from "./ExhibitionSlideshow";

type ProjectDetailGalleryProps = {
  slugKey: string;
  title: string;
  slideshow: string[];
  cascade: GalleryCascadeBlock[];
  onOpenLightbox: (index: number) => void;
  /** Rendered between the hero and the cascade (e.g. ficha body copy). */
  betweenHeroAndCascade?: ReactNode;
};

/**
 * Hero uses the first slide; cascade shows every image from content (portrait frames
 * use 3∶4 in {@link CascadeArchivalMedia}).
 */
export function ProjectDetailGallery({
  slugKey,
  title,
  slideshow,
  cascade,
  onOpenLightbox,
  betweenHeroAndCascade,
}: ProjectDetailGalleryProps) {
  const heroUrl = slideshow[0] ?? "";

  if (slideshow.length === 0) {
    return null;
  }

  return (
    <>
      <ExhibitionSlideshow
        key={slugKey}
        heroUrl={heroUrl}
        heroSlideIndex={0}
        label={title}
        onOpenLightbox={onOpenLightbox}
      />
      {betweenHeroAndCascade}
      <ExhibitionCascade
        blocks={cascade}
        slideshow={slideshow}
        onOpenLightbox={onOpenLightbox}
      />
    </>
  );
}
