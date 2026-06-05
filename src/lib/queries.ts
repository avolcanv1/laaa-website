const projectFields = `
  _id,
  title,
  body,
  "slug": slug.current,
  listDate,
  gallery[]{
    _key,
    caption,
    alt,
    image{
      asset->{
        _id,
        url
      }
    }
  }
`;

export const DEFAULT_LANGUAGE = "es";

export const exhibitionsQuery = /* groq */ `
  *[_type == "exhibition"]{
    ${projectFields}
  }
`;

export const exhibitionBySlugQuery = /* groq */ `
  *[_type == "exhibition" && slug.current == $slug][0]{
    ${projectFields}
  }
`;

export const investigacionQuery = /* groq */ `
  *[_type == "investigacion"]{
    ${projectFields}
  }
`;

export const investigacionBySlugQuery = /* groq */ `
  *[_type == "investigacion" && slug.current == $slug][0]{
    ${projectFields}
  }
`;

export const talleresQuery = /* groq */ `
  *[_type == "taller"]{
    ${projectFields}
  }
`;

export const tallerBySlugQuery = /* groq */ `
  *[_type == "taller" && slug.current == $slug][0]{
    ${projectFields}
  }
`;

export type ProjectDocumentType = "exhibition" | "investigacion" | "taller";
