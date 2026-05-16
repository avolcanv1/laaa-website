import type { ReactNode } from "react";
import { useImageIsLandscape } from "../hooks/useImageIsLandscape";

type ExhibitionHeroSlotShellProps = {
  heroUrl: string;
  children: ReactNode;
};

/**
 * Shared width ladder for ficha hero + subnav hover (`exhibitionHeroSlot--landscapeFirst`).
 * Children should be a `.exhibitionSlideshow__heroBtn` wrapping `ArchivalMedia`.
 */
export function ExhibitionHeroSlotShell({
  heroUrl,
  children,
}: ExhibitionHeroSlotShellProps) {
  const landscapeFirst = useImageIsLandscape(heroUrl);

  return (
    <div
      className={[
        "exhibitionSlideshow",
        "exhibitionHeroSlot",
        landscapeFirst === true ? "exhibitionHeroSlot--landscapeFirst" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
