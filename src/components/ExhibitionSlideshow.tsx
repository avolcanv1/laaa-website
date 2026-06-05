import { ArchivalMedia } from "./ArchivalMedia";
import { ExhibitionHeroSlotShell } from "./ExhibitionHeroSlotShell";

type ExhibitionSlideshowProps = {
  /** Hero shown in the slot (may differ from `slideshow[0]` when orientation-filtered). */
  heroUrl: string;
  /** Index in the project’s full `slideshow` for the lightbox. */
  heroSlideIndex: number;
  label: string;
  onOpenLightbox: (index: number) => void;
};

/** Inline hero only (no arrows/dots); opens full [Galería / Copias](https://www.figma.com/design/VYTIexbznmMIeDTVgOgaK3/LAAA-%7C-Web?node-id=40-1468) on click. */
export function ExhibitionSlideshow({
  heroUrl,
  heroSlideIndex,
  label,
  onOpenLightbox,
}: ExhibitionSlideshowProps) {
  if (!heroUrl) return null;

  return (
    <ExhibitionHeroSlotShell key={heroUrl} heroUrl={heroUrl}>
      <button
        type="button"
        className="exhibitionSlideshow__heroBtn"
        onClick={() => onOpenLightbox(heroSlideIndex)}
        aria-label={`${label} — abrir galería`}
      >
        <ArchivalMedia
          src={heroUrl}
          alt=""
          treatment="natural"
          className="exhibitionHeroSlot__media"
          loading="eager"
          fetchPriority="high"
        />
      </button>
    </ExhibitionHeroSlotShell>
  );
}
