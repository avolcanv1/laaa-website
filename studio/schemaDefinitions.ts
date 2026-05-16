import exhibition from "./schemaTypes/exhibition";
import investigacion from "./schemaTypes/investigacion";
import blockContent from "./schemaTypes/objects/blockContent";
import galleryCaptionRow from "./schemaTypes/objects/galleryCaptionRow";
import sharedGalleryImage from "./schemaTypes/objects/sharedGalleryImage";
import taller from "./schemaTypes/taller";

/** Fuente única de tipos para `sanity.config` y barrels (`schemaTypes/index`). */
export const schemaTypes = [
  blockContent,
  galleryCaptionRow,
  sharedGalleryImage,
  exhibition,
  investigacion,
  taller,
];
