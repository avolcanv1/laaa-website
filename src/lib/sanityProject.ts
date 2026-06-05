import type { GalleryCascadeBlock, ExhibitionContent } from "../data/exhibitionContent";
import {
  compareListDateDesc,
  exhibitionEntryIsSoon,
} from "../data/exhibitionContent";
import { investigacionEntryIsSoon } from "../data/investigacionContent";
import { nonBreakingHyphens } from "./nonBreakingHyphens";
import { portableTextToPlain, type PortableTextBlock } from "./portableText";
import { repairPortableTextBlocks } from "./inlineHtmlToPortableText";
import {
  DEFAULT_LANGUAGE,
  exhibitionBySlugQuery,
  exhibitionsQuery,
  investigacionBySlugQuery,
  investigacionQuery,
  type ProjectDocumentType,
  tallerBySlugQuery,
  talleresQuery,
} from "./queries";
import { sanityClient } from "./sanityClient";
import { urlForSanityImage, urlForSanityImageOriginal } from "./sanityImage";

export type { ExhibitionContent as ProjectContent };
export { exhibitionEntryIsSoon, investigacionEntryIsSoon, compareListDateDesc };

export type ProjectWithSlug = ExhibitionContent & {
  slug: string;
  bodyBlocks?: PortableTextBlock[];
  /** Full file URLs for the lightbox (no Sanity crop / hotspot). */
  slideshowLightbox: string[];
};

type SanityGalleryRow = {
  caption?: string | null;
  alt?: string | null;
  image?: {
    asset?: {
      _id?: string;
      url?: string;
    };
  } | null;
};

type SanityProjectRaw = {
  _id: string;
  title?: string;
  body?: Parameters<typeof portableTextToPlain>[0];
  slug?: string | null;
  listDate?: string | null;
  gallery?: SanityGalleryRow[] | null;
};

function galleryRowToUrl(row: SanityGalleryRow): string {
  const image = row.image;
  if (!image) return "";
  const built = urlForSanityImage(image);
  if (built) return built;
  return image.asset?.url ?? "";
}

function galleryRowToLightboxUrl(row: SanityGalleryRow): string {
  const image = row.image;
  if (!image) return "";
  if (image.asset?.url) return image.asset.url;
  return urlForSanityImageOriginal(image);
}

function galleryCascadeFromUrls(urls: string[]): GalleryCascadeBlock[] {
  const out: GalleryCascadeBlock[] = [];
  let i = 0;
  while (i + 1 < urls.length) {
    out.push({ type: "pair", left: urls[i]!, right: urls[i + 1]! });
    i += 2;
  }
  if (i < urls.length) {
    out.push({ type: "full", src: urls[i]! });
  }
  return out;
}

function cascadeAfterHero(urls: string[]): GalleryCascadeBlock[] {
  return galleryCascadeFromUrls(urls.slice(1));
}

function mapSanityProject(raw: SanityProjectRaw): ProjectWithSlug | null {
  const slug = raw.slug?.trim();
  if (!slug) return null;

  const slideshow = (raw.gallery ?? [])
    .map(galleryRowToUrl)
    .filter((url) => url.length > 0);

  const slideshowLightbox = (raw.gallery ?? [])
    .map(galleryRowToLightboxUrl)
    .filter((url) => url.length > 0);

  const title = nonBreakingHyphens(raw.title?.trim() ?? slug);
  const listDate = raw.listDate?.trim() ?? "";
  const bodyBlocks = raw.body?.length
    ? repairPortableTextBlocks(raw.body as PortableTextBlock[])
    : undefined;
  const body = portableTextToPlain(bodyBlocks);

  return {
    slug,
    title,
    listDate,
    body,
    bodyBlocks,
    slideshow,
    slideshowLightbox,
    cascade: cascadeAfterHero(slideshow),
  };
}

function listQueryForType(type: ProjectDocumentType): string {
  switch (type) {
    case "exhibition":
      return exhibitionsQuery;
    case "investigacion":
      return investigacionQuery;
    case "taller":
      return talleresQuery;
  }
}

function bySlugQueryForType(type: ProjectDocumentType): string {
  switch (type) {
    case "exhibition":
      return exhibitionBySlugQuery;
    case "investigacion":
      return investigacionBySlugQuery;
    case "taller":
      return tallerBySlugQuery;
  }
}

export function entryIsSoonForType(
  type: ProjectDocumentType,
  item: Pick<ExhibitionContent, "body">,
): boolean {
  return type === "investigacion"
    ? investigacionEntryIsSoon(item)
    : exhibitionEntryIsSoon(item);
}

/** Mismo criterio que `getExhibitionNavSlugsOrdered` / `INVESTIGACION_ORDER`. */
export function orderProjectSlugs(
  type: ProjectDocumentType,
  projects: ProjectWithSlug[],
): string[] {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const slugs = projects.map((p) => p.slug);

  const soon = slugs.filter((s) => {
    const c = bySlug.get(s);
    return c && entryIsSoonForType(type, c);
  });
  const rest = slugs.filter((s) => {
    const c = bySlug.get(s);
    return c && !entryIsSoonForType(type, c);
  });

  const sortByListDate = (slugA: string, slugB: string) => {
    const ca = bySlug.get(slugA);
    const cb = bySlug.get(slugB);
    if (!ca || !cb) return 0;
    return compareListDateDesc(ca.listDate, cb.listDate);
  };

  soon.sort(sortByListDate);
  rest.sort(sortByListDate);
  return [...soon, ...rest];
}

export async function fetchProjectList(
  type: ProjectDocumentType,
  _language = DEFAULT_LANGUAGE,
): Promise<ProjectWithSlug[]> {
  const rows = await sanityClient.fetch<SanityProjectRaw[]>(listQueryForType(type));
  return rows
    .map(mapSanityProject)
    .filter((p): p is ProjectWithSlug => p !== null);
}

export async function fetchProjectBySlug(
  type: ProjectDocumentType,
  slug: string,
  _language = DEFAULT_LANGUAGE,
): Promise<ProjectWithSlug | null> {
  const row = await sanityClient.fetch<SanityProjectRaw | null>(
    bySlugQueryForType(type),
    { slug },
  );
  if (!row) return null;
  return mapSanityProject(row);
}

export async function fetchAllProjectImageUrls(
  language = DEFAULT_LANGUAGE,
): Promise<string[]> {
  const [exhibitions, investigacion, talleres] = await Promise.all([
    fetchProjectList("exhibition", language),
    fetchProjectList("investigacion", language),
    fetchProjectList("taller", language),
  ]);

  const seen = new Set<string>();

  const addFromList = (type: ProjectDocumentType, list: ProjectWithSlug[]) => {
    for (const item of list) {
      if (entryIsSoonForType(type, item)) continue;
      for (const url of item.slideshow) {
        if (url) seen.add(url);
      }
    }
  };

  addFromList("exhibition", exhibitions);
  addFromList("investigacion", investigacion);
  addFromList("taller", talleres);

  return [...seen];
}

export function projectBySlug(
  projects: ProjectWithSlug[],
  slug: string,
): ProjectWithSlug | undefined {
  return projects.find((p) => p.slug === slug);
}

const preloadedHeroUrls = new Set<string>();

/** Warm the browser cache for a project's hero before navigation. */
export function preloadProjectHeroUrl(url: string | undefined): void {
  if (!url || preloadedHeroUrls.has(url)) return;
  preloadedHeroUrls.add(url);
  const img = new Image();
  img.src = url;
}

export function preloadProjectHero(
  projects: ProjectWithSlug[],
  slug: string,
): void {
  preloadProjectHeroUrl(projectBySlug(projects, slug)?.slideshow[0]);
}
