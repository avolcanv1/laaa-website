/** Fragmento GROQ: metadatos de traducción que referencian el documento actual. */
const translationMetadataProjection = `
  "slug": *[_type == "translation.metadata" && references(^._id)][0].slug.current,
  "listDate": *[_type == "translation.metadata" && references(^._id)][0].listDate,
  "gallery": *[_type == "translation.metadata" && references(^._id)][0].gallery[]{
    _key,
    image{
      asset->{
        _id,
        url
      }
    }
  }
`;

const projectFields = `
  _id,
  title,
  language,
  body,
  galleryCaptions[]{
    caption,
    alt
  },
  ${translationMetadataProjection}
`;

export const DEFAULT_LANGUAGE = "es";

export const exhibitionsQuery = /* groq */ `
  *[_type == "exhibition" && language == $language]{
    ${projectFields}
  }
`;

export const exhibitionBySlugQuery = /* groq */ `
  *[_type == "exhibition"
    && language == $language
    && *[_type == "translation.metadata" && references(^._id)][0].slug.current == $slug
  ][0]{
    ${projectFields}
  }
`;

export const investigacionQuery = /* groq */ `
  *[_type == "investigacion" && language == $language]{
    ${projectFields}
  }
`;

export const investigacionBySlugQuery = /* groq */ `
  *[_type == "investigacion"
    && language == $language
    && *[_type == "translation.metadata" && references(^._id)][0].slug.current == $slug
  ][0]{
    ${projectFields}
  }
`;

export const talleresQuery = /* groq */ `
  *[_type == "taller" && language == $language]{
    ${projectFields}
  }
`;

export const tallerBySlugQuery = /* groq */ `
  *[_type == "taller"
    && language == $language
    && *[_type == "translation.metadata" && references(^._id)][0].slug.current == $slug
  ][0]{
    ${projectFields}
  }
`;

export type ProjectDocumentType = "exhibition" | "investigacion" | "taller";
