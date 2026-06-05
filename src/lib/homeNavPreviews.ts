import type { NavHoverKey } from "../nav/navHoverPreviews";
import { NAV_HOVER_PREVIEWS } from "../nav/navHoverPreviews";
import { sanityClient } from "./sanityClient";
import { urlForSanityImage } from "./sanityImage";

export type NavHoverPreviewData = {
  imageSrc: string;
  caption: string;
  overlayColor: string;
  layout: "vertical" | "horizontal";
};

export const HOME_NAV_PREVIEWS_QUERY = /* groq */ `
  *[_type == "homeNavPreviews" && _id == "homeNavPreviews"][0]{
    exposiciones{
      caption,
      layout,
      overlayColor,
      image{ asset->{ _id, url } }
    },
    investigacion{
      caption,
      layout,
      overlayColor,
      image{ asset->{ _id, url } }
    },
    talleres{
      caption,
      layout,
      overlayColor,
      image{ asset->{ _id, url } }
    },
    acerca{
      caption,
      layout,
      overlayColor,
      image{ asset->{ _id, url } }
    },
    tienda{
      caption,
      layout,
      overlayColor,
      image{ asset->{ _id, url } }
    }
  }
`;

type NavSectionHoverRow = {
  caption?: string | null;
  layout?: "vertical" | "horizontal" | null;
  overlayColor?: string | null;
  image?: { asset?: { url?: string } | null } | null;
};

type HomeNavPreviewsRaw = Partial<Record<NavHoverKey, NavSectionHoverRow>> | null;

function mapSectionRow(
  key: NavHoverKey,
  row: NavSectionHoverRow | undefined,
): NavHoverPreviewData | null {
  const fallback = NAV_HOVER_PREVIEWS[key];
  const imageSrc =
    urlForSanityImage(row?.image) || row?.image?.asset?.url || fallback.imageSrc;

  if (!imageSrc) return null;

  return {
    imageSrc,
    caption: row?.caption?.trim() ?? "",
    overlayColor: row?.overlayColor?.trim() || fallback.overlayColor,
    layout:
      row?.layout === "vertical" || row?.layout === "horizontal"
        ? row.layout
        : fallback.layout,
  };
}

export async function fetchHomeNavPreviews(): Promise<
  Partial<Record<NavHoverKey, NavHoverPreviewData>>
> {
  const raw = await sanityClient.fetch<HomeNavPreviewsRaw>(HOME_NAV_PREVIEWS_QUERY);
  if (!raw) return {};

  const keys: NavHoverKey[] = [
    "exposiciones",
    "investigacion",
    "talleres",
    "acerca",
    "tienda",
  ];

  const out: Partial<Record<NavHoverKey, NavHoverPreviewData>> = {};
  for (const key of keys) {
    const mapped = mapSectionRow(key, raw[key]);
    if (mapped) out[key] = mapped;
  }
  return out;
}
