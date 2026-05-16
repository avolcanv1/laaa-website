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

/** Every slideshow image from exposiciones, investigación y talleres (deduped). */
export function getAllProjectImageUrls(): string[] {
  const seen = new Set<string>();

  for (const slug of getExhibitionNavSlugsOrdered()) {
    const item = getExhibitionContent(slug);
    if (!item) continue;
    if (exhibitionEntryIsSoon(item)) continue;
    for (const url of item.slideshow) {
      if (url) seen.add(url);
    }
  }

  for (const slug of INVESTIGACION_ORDER) {
    const item = getInvestigacionContent(slug);
    if (!item) continue;
    if (investigacionEntryIsSoon(item)) continue;
    for (const url of item.slideshow) {
      if (url) seen.add(url);
    }
  }

  for (const slug of getTalleresNavSlugsOrdered()) {
    const item = getTalleresContent(slug);
    if (!item) continue;
    if (exhibitionEntryIsSoon(item)) continue;
    for (const url of item.slideshow) {
      if (url) seen.add(url);
    }
  }

  return [...seen];
}
