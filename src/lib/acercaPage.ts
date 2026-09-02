import { sanityClient } from "./sanityClient";
import { urlForSanityImage } from "./sanityImage";

export type AcercaPageContent = {
  paragraphs: string[];
  contactEmail: string;
  instagramHandle: string;
  instagramUrl: string;
  addressLines: string[];
  heroImageSrc: string;
  heroAlt: string;
};

export const ACERCA_PAGE_FALLBACK: AcercaPageContent = {
  paragraphs: [
    "Un espacio de investigación y desarrollo con sede en la Ciudad de México desde 2020, enfocado en la conceptualización de nuevos proyectos con artistas, arquitectxs e investigadores, así como en la preservación del patrimonio mediante la hibridación entre el uso de tecnologías contemporáneas y procesos vernaculares.",
    "En 2024 presentó una iniciativa de ley ante el Senado de la República para la creación del Repositorio de Artefactos Mesoamericanos (RAM), un archivo digital de acceso libre para la preservación y consulta educativa y científica de piezas arqueológicas.",
    "En 2025 inauguró LAAA Biblioteca PRAXIS, un proyecto de investigación orientado a democratizar el acceso a archivos y colecciones, iniciado con la biblioteca del Taller de Arquitectura PRAXIS de Agustín Hernández Navarro. Ese mismo año LAAA fue seleccionado en IN-PULSO CREATIVO, iniciativa del IFAL–Embajada de Francia en México que apoya a las industrias culturales y creativas mexicanas.",
    "Actualmente LAAA colabora con instituciones como el Museo Nacional de Antropología, el Museo del Templo Mayor, la Fundación Cultural Armella Spitalier, y el Archivo Agustín Hernández et al.",
  ],
  contactEmail: "info@laaa.mx",
  instagramHandle: "@laaa_mx",
  instagramUrl: "https://instagram.com/laaa_mx",
  addressLines: [
    "Gob. Rafael Rebollar 93 Col. San Miguel Chapultepec",
    "11580 Ciudad de México, México",
  ],
  heroImageSrc: "/acerca/hero.jpg",
  heroAlt: "Biblioteca LAAA Biblioteca PRAXIS",
};

export const ACERCA_PAGE_QUERY = /* groq */ `
  *[_type == "acercaPage" && _id == "acercaPage"][0]{
    paragraphs,
    contactEmail,
    instagramHandle,
    instagramUrl,
    address,
    heroAlt,
    heroImage{ asset->{ _id, url } }
  }
`;

type AcercaPageRaw = {
  paragraphs?: string[] | null;
  contactEmail?: string | null;
  instagramHandle?: string | null;
  instagramUrl?: string | null;
  address?: string | null;
  heroAlt?: string | null;
  heroImage?: { asset?: { url?: string } | null } | null;
} | null;

function parseAddressLines(address: string | null | undefined): string[] {
  if (!address?.trim()) return [...ACERCA_PAGE_FALLBACK.addressLines];
  const lines = address
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : [...ACERCA_PAGE_FALLBACK.addressLines];
}

function mapAcercaPage(raw: AcercaPageRaw): AcercaPageContent | null {
  if (!raw) return null;

  const paragraphs = (raw.paragraphs ?? [])
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const heroImageSrc =
    urlForSanityImage(raw.heroImage) || raw.heroImage?.asset?.url || "";

  if (paragraphs.length === 0 || !heroImageSrc) return null;

  return {
    paragraphs,
    contactEmail: raw.contactEmail?.trim() || ACERCA_PAGE_FALLBACK.contactEmail,
    instagramHandle:
      raw.instagramHandle?.trim() || ACERCA_PAGE_FALLBACK.instagramHandle,
    instagramUrl: raw.instagramUrl?.trim() || ACERCA_PAGE_FALLBACK.instagramUrl,
    addressLines: parseAddressLines(raw.address),
    heroImageSrc,
    heroAlt: raw.heroAlt?.trim() || ACERCA_PAGE_FALLBACK.heroAlt,
  };
}

export async function fetchAcercaPage(): Promise<AcercaPageContent> {
  try {
    const raw = await sanityClient.fetch<AcercaPageRaw>(ACERCA_PAGE_QUERY);
    return mapAcercaPage(raw) ?? ACERCA_PAGE_FALLBACK;
  } catch {
    return ACERCA_PAGE_FALLBACK;
  }
}
