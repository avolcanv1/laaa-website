import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { sanityClient } from "./sanityClient";

const builder = imageUrlBuilder(sanityClient);

/** URL optimizada para la web a partir de un campo `image` de Sanity. */
export function urlForSanityImage(source: SanityImageSource | undefined | null): string {
  if (!source) return "";
  return builder.image(source).auto("format").url();
}
