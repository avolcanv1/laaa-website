import {
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { NavLink } from "react-router-dom";
import shopCardPlaceholder from "../assets/shop-card-placeholder.png";
import {
  exhibitionEntryIsSoon,
  getExhibitionContent,
  getExhibitionNavSlugsOrdered,
} from "../data/exhibitionContent";
import {
  INVESTIGACION_ORDER,
  getInvestigacionContent,
  investigacionEntryIsSoon,
} from "../data/investigacionContent";
import {
  getTalleresContent,
  getTalleresNavSlugsOrdered,
} from "../data/talleresContent";
import {
  probeImageOrientations,
  urlMatchesBreakpointOrientation,
} from "../lib/imageOrientationProbe";

export type SectionIndexMosaicSection =
  | "exposiciones"
  | "investigacion"
  | "talleres";

type Tile = {
  slug: string;
  title: string;
  meta: string;
  slides: string[];
  soon: boolean;
  href: string | null;
};

function tilesForSection(section: SectionIndexMosaicSection): Tile[] {
  if (section === "exposiciones") {
    return getExhibitionNavSlugsOrdered().map((slug) => {
      const item = getExhibitionContent(slug);
      if (!item) {
        return {
          slug,
          title: slug,
          meta: "",
          slides: [],
          soon: false,
          href: `/exposiciones/${slug}`,
        };
      }
      const soon = exhibitionEntryIsSoon(item);
      return {
        slug,
        title: item.title,
        meta: soon ? "Próximamente" : item.listDate,
        slides: item.slideshow,
        soon,
        href: soon ? null : `/exposiciones/${slug}`,
      };
    });
  }
  if (section === "investigacion") {
    return INVESTIGACION_ORDER.map((slug) => {
      const item = getInvestigacionContent(slug);
      if (!item) {
        return {
          slug,
          title: slug,
          meta: "",
          slides: [],
          soon: false,
          href: `/investigacion/${slug}`,
        };
      }
      const soon = investigacionEntryIsSoon(item);
      return {
        slug,
        title: item.title,
        meta: soon ? "Próximamente" : item.listDate,
        slides: item.slideshow,
        soon,
        href: soon ? null : `/investigacion/${slug}`,
      };
    });
  }
  return getTalleresNavSlugsOrdered().map((slug) => {
    const item = getTalleresContent(slug);
    if (!item) {
      return {
        slug,
        title: slug,
        meta: "",
        slides: [],
        soon: false,
        href: `/talleres/${slug}`,
      };
    }
    const soon = exhibitionEntryIsSoon(item);
    return {
      slug,
      title: item.title,
      meta: soon ? "Próximamente" : item.listDate,
      slides: item.slideshow,
      soon,
      href: soon ? null : `/talleres/${slug}`,
    };
  });
}

/** Section title in the mobile grid — sticky like {@link MobileDetailRouteBar} while scrolling tiles. */
const mosaicSectionHeading: Record<SectionIndexMosaicSection, string> = {
  exposiciones: "Exposiciones",
  investigacion: "Investigación y desarrollo",
  talleres: "Talleres",
};

function tileClassName(soon: boolean): string {
  return ["mobileMosaic__tile", soon ? "mobileMosaic__tile--soon" : ""]
    .filter(Boolean)
    .join(" ");
}

/** Same asset + mask treatment as Laaa tienda cards (no Cargo slide). */
function MosaicSoonPlaceholder() {
  return (
    <div
      className="mobileMosaic__figureInner mobileMosaic__figureInner--tiendaPlaceholder"
      style={
        {
          "--tienda-placeholder-mask": `url(${shopCardPlaceholder})`,
        } as CSSProperties
      }
    >
      <img
        src={shopCardPlaceholder}
        alt=""
        className="mobileMosaic__img mobileMosaic__img--tiendaPlaceholder"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

/** Mosaic is mobile-only; pick the first portrait (or square) slide in narrative order. */
function MosaicSlideCover({
  slides,
  tileIndex,
}: {
  slides: string[];
  tileIndex: number;
}) {
  const slidesKey = useMemo(() => slides.join("\0"), [slides]);
  const [coverSrc, setCoverSrc] = useState<string | null>(
    () => slides[0] ?? null,
  );

  useEffect(() => {
    if (slides.length === 0) {
      setCoverSrc(null);
      return;
    }
    let cancelled = false;
    probeImageOrientations(slides).then((ors) => {
      if (cancelled) return;
      const idx = slides.findIndex((_, i) =>
        urlMatchesBreakpointOrientation(ors[i] ?? null, true),
      );
      setCoverSrc(idx >= 0 ? slides[idx]! : slides[0]!);
    });
    return () => {
      cancelled = true;
    };
  }, [slidesKey]);

  if (!coverSrc) {
    return <div className="mobileMosaic__placeholder" aria-hidden />;
  }

  return (
    <img
      src={coverSrc}
      alt=""
      className="mobileMosaic__img"
      loading={tileIndex < 4 ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

type MosaicTileProps = {
  tile: Tile;
  tileIndex: number;
};

function MosaicTile({ tile, tileIndex }: MosaicTileProps) {
  const label = `${tile.title}${tile.meta ? `, ${tile.meta}` : ""}`;

  const inner = (
    <>
      <div className="mobileMosaic__figure">
        {tile.soon ? (
          <MosaicSoonPlaceholder />
        ) : (
          <MosaicSlideCover slides={tile.slides} tileIndex={tileIndex} />
        )}
      </div>
      <div className="mobileMosaic__text">
        <span className="mobileMosaic__meta">{tile.meta}</span>
        <span className="mobileMosaic__title">{tile.title}</span>
      </div>
    </>
  );

  if (tile.href) {
    return (
      <NavLink
        to={tile.href}
        className={tileClassName(false)}
        aria-label={label}
      >
        {inner}
      </NavLink>
    );
  }

  return (
    <div className={tileClassName(true)} aria-label={label}>
      {inner}
    </div>
  );
}

type SectionIndexMosaicProps = {
  section: SectionIndexMosaicSection;
};

/**
 * Desktop: blank “marco”. ≤1200px: two-column grid — image, then date + title (cf. cancan proyectos).
 */
export function SectionIndexMosaic({ section }: SectionIndexMosaicProps) {
  const tiles = tilesForSection(section);
  const mosaicHeadingId = useId();

  return (
    <section className="sectionIndex">
      <h2 className="mobileMosaic__sectionHeading" id={mosaicHeadingId}>
        {mosaicSectionHeading[section]}
      </h2>
      <nav
        className="sectionIndex__mosaic mobileMosaic"
        aria-labelledby={mosaicHeadingId}
      >
        {tiles.map((tile, index) => (
          <MosaicTile key={tile.slug} tile={tile} tileIndex={index} />
        ))}
      </nav>
      <div className="sectionIndex__blank pageHome" />
    </section>
  );
}
