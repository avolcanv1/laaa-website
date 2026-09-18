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
    "LAAA (Laboratorio de Arte, Arquitectura y Arqueología) es un espacio de investigación fundado en 2020 por Francisco Regalado en la Ciudad de México. Desarrolla proyectos que combinan investigación histórica, digitalización, fabricación y archivo, articulando tecnologías contemporáneas y procesos vernaculares.",
    "Colabora tanto con artistas, arquitectxs y arqueologxs contemporáneos como con instituciones e investigadorxs dedicadxs al patrimonio cultural, entendiendo el pasado y el presente como materias igualmente vivas, abiertas a nuevas interpretaciones y formas de circulación. Opera a través de objetos, exposiciones, publicaciones y plataformas digitales.",
  ],
  contactEmail: "info@laaa.mx",
  instagramHandle: "@laaa_mx",
  instagramUrl: "https://instagram.com/laaa_mx",
  addressLines: [
    "Gob. Rafael Rebollar 93 Col. San Miguel Chapultepec",
    "11580 Ciudad de México, México",
  ],
  heroImageSrc: "/acerca/hero.jpg",
  heroAlt: "Estudio LAAA",
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
