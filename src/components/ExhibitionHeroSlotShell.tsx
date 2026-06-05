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

  const oriented = landscapeFirst !== null;

  return (
    <div
      className={[
        "exhibitionSlideshow",
        "exhibitionHeroSlot",
        !oriented ? "exhibitionHeroSlot--orienting" : "",
        landscapeFirst === true ? "exhibitionHeroSlot--landscapeFirst" : "",
        oriented && landscapeFirst === false ? "exhibitionHeroSlot--portrait" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
