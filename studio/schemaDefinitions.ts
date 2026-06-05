import exhibition from "./schemaTypes/exhibition";
import homeNavPreviews from "./schemaTypes/homeNavPreviews";
import investigacion from "./schemaTypes/investigacion";
import blockContent from "./schemaTypes/objects/blockContent";
import galleryItem from "./schemaTypes/objects/galleryItem";
import listDate from "./schemaTypes/objects/listDate";
import navSectionHoverItem from "./schemaTypes/objects/navSectionHoverItem";
import taller from "./schemaTypes/taller";

/** Fuente única de tipos para `sanity.config` y barrels (`schemaTypes/index`). */
export const schemaTypes = [
  blockContent,
  galleryItem,
  listDate,
  navSectionHoverItem,
  homeNavPreviews,
  exhibition,
  investigacion,
  taller,
];
