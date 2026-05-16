/**
 * Talleres — copy and image URLs from https://laaa.mx/ (Cargo / freight.cargo.site).
 */

import {
  compareListDateDesc,
  type ExhibitionContent,
  type GalleryCascadeBlock,
} from "./exhibitionContent";
import { cargoImageForWeb } from "../lib/cargoImage";

const cargo = cargoImageForWeb;

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

const codicePhotos = [
  cargo("856d4f1b196e7de0d850ede3cefd43e6a07183dc3ef3e37970582d8501d0470a", "DSC05116.JPG"),
  cargo("fced7d8a88daf5bed05cf8ec46999cedb546ce670c6337f317b6c70c8c6e99f4", "DSC05149.JPG"),
  cargo("e9710cbdef12eb1efc393df97e55f0915b4c841c293a84c93344528db1ff7e14", "DSC05146.JPG"),
];

const digitalizacionPhotos = [
  cargo("84b64cad32c4f68e2abd6b2e2288efa212769c77d721155f5ab2419d654445ef", "7.jpg"),
  cargo("6a20955e90ae09db7da3f134dc93c46792e5e3daf23e026f67a6d007da48702f", "3.jpg"),
  cargo("fcb26d4cb2dda32f94ff5d1d43837335c5af33130d81aeab75af8d607dc0f627", "1.jpg"),
  cargo("38b8c4756e0b32fa7039ec4148ac41820720405174c45c1c98f57d830340a8a4", "5.jpg"),
  cargo("0a287fe77f11b6a92a5aa012034843cc53266b458baf489ed4183704aae5c1f7", "4.jpg"),
  cargo("9518ce379b6f274f3bce7da88c5d059e91c9564dfe61a8765485a968b494b035", "6.jpg"),
  cargo("d0ec356b0659a9af60e2440e7770dce1a1a1fe526e2f58f99b5558e44a806574", "9.jpg"),
  cargo("11aad625f7c8adb8b890c2142cb42eca0fdad6f68638776f9ad6d55d2016ca81", "10.jpg"),
  cargo("52aad63a7a390ce803c21ed34ca1f94a5cb6379a3302e329257171fa45d58838", "8.jpg"),
];

const noTocarPhotos = [
  cargo("8188996c4aec59faa7d6b6dc7226935d2234603fa04c7ca9c13585cae27fab6b", "DSC06072.JPG"),
  cargo("0bd2f786cfa8da09649f84424345395479c1381f2167688b7f3cf2c2bb86f52a", "DSC06094.JPG"),
  cargo("bafc8384991113c20683fed23b4088bc3a18f85e3832ed7b508ee7eb9b5c0417", "DSC06097.JPG"),
  cargo("98401d20bfd3fcfc46fc7a5c3df7f4ad30bc7e1c167520694f7ad28abeaa99f0", "juchiman_a.jpg"),
  cargo("108bdcdf93093e8f969c7198fb9a5f0b2e9684a3740884ccb165a053b96ebebb", "DSC06075.JPG"),
  cargo("089e9369b69c9e3635f4063902175af6363b81ae7f5205f754678323af65029c", "DSC06111.JPG"),
  cargo("744f9619dcb0e24a1ab42515d5d66da5419956fa1c976fafc50da894fdaabbcd", "UJAT_cd.jpg"),
];

const thinkingPhotos = [
  cargo("576a1d3d7413661a35e81d2079e1ad95e625e7e1bb9cb6ef67888092248f2a92", "geometriaGlobal.JPEG"),
  cargo("db780d25cd30655ad6044b339e5e1718cf334fb02734f5acde7ead73c2c26bfa", "geometriaLocal.JPEG"),
  cargo("5ba0ba1ac515eddf03cc88f23732a399856b1006122d2af73241d5f1d6e2500a", "todas-v2-web.jpg"),
  cargo("4db7455933a1b249100304b8faddf29c3c5299235fcce67760375b29563be6d7", "a2.JPEG"),
  cargo("e090d80d2c2bb7e35dd6fc86cfa5e27189e90aba48d12025ab128f658d001c24", "a1.JPEG"),
  cargo("1ff6c58ab809abf4ea63370adfcb5195955f081048a1540d6e89fc778e5aa2c8", "a0.JPEG"),
];

const pensandoPhotos = [
  cargo("622b8dcc5832816f900725f36613ec55e95e2bfb6bf774a624d62addf410b20b", "IMG_1268.jpg"),
  cargo("9611f35838ab281706d26cc6ed6f5ff363770cbb2965afd8fa40d8430d9d0a7c", "IMG_1253.jpg"),
  cargo("6098f8b3b6f2fb9eeb0dc4e5c43eba58dc7b27b8c1fa6e8efa0d9a8693c98617", "IMG_0207.jpg"),
];

export const TALLERES_BY_SLUG: Record<string, ExhibitionContent> = {
  "codice-colectivo": {
    title: "Códice colectivo",
    listDate: "2025.09.01",
    body: "Códice colectivo, 2025. Escuela primaria pública, Ciudad de México. Desarrollamos un programa para alumnxs de primaria que utiliza herramientas digitales como la impresión 3D y medios tradicionales como la acuarela para entregarles sets de sellos basados en los glifos del códice Mictlán. Con ellos, lxs niñxs pueden apropiarse de este lenguaje y usarlo para contarnos sobre sus propias vidas.",
    slideshow: codicePhotos,
    cascade: cascadeAfterHero(codicePhotos),
  },
  "digitalizacion-colectiva": {
    title: "Digitalización colectiva",
    listDate: "2024.12.01",
    body: "Collective digitization, 2024. Rice University, Houston. Métodos colaborativos para el escaneo 3D de objetos, con el fin de democratizar el acceso a la información que contienen.",
    slideshow: digitalizacionPhotos,
    cascade: cascadeAfterHero(digitalizacionPhotos),
  },
  "no-tocar-es-preservar": {
    title: "No tocar es preservar",
    listDate: "2024.11.01",
    body: "No tocar es preservar, 2024. UJAT, Villahermosa. Métodos colaborativos para el escaneo 3D de objetos, con el fin de democratizar el acceso a la información que contienen.",
    slideshow: noTocarPhotos,
    cascade: cascadeAfterHero(noTocarPhotos),
  },
  "thinking-by-modelling": {
    title: "Thinking by Modelling",
    listDate: "2023.10.01",
    body: "Thinking by modelling, 2023. Acto arquitectura, Ciudad de México. Fabricación digital: modelado algorítmico, impresión 3D y carpintería.",
    slideshow: thinkingPhotos,
    cascade: cascadeAfterHero(thinkingPhotos),
  },
  "pensando-en-vacio": {
    title: "Pensando en vacío",
    listDate: "2023.09.01",
    body: "Pensando en vacío, 2023. LAAA, Ciudad de México. Fabricación digital: modelado algorítmico, CNC robótico y cerámica. En colaboración con Manufactura.",
    slideshow: pensandoPhotos,
    cascade: cascadeAfterHero(pensandoPhotos),
  },
};

export function getTalleresNavSlugsOrdered(): string[] {
  return (Object.keys(TALLERES_BY_SLUG) as string[]).sort((slugA, slugB) => {
    const ca = TALLERES_BY_SLUG[slugA];
    const cb = TALLERES_BY_SLUG[slugB];
    if (!ca || !cb) return 0;
    return compareListDateDesc(ca.listDate, cb.listDate);
  });
}

export function getTalleresContent(slug: string): ExhibitionContent | undefined {
  return TALLERES_BY_SLUG[slug];
}
