/**
 * Exposiciones — copy from https://laaa.mx/; images resolved via `/cargo-media/` (see npm run download-media).
 */

import { cargoImageForWeb } from "../lib/cargoImage.ts";

const cargo = cargoImageForWeb;

export type GalleryCascadeBlock =
  | { type: "pair"; left: string; right: string }
  | { type: "full"; src: string };

export type ExhibitionContent = {
  title: string;
  /** Subnav left column, `YYYY.MM.DD` (lexicographic sort = chronological). */
  listDate: string;
  body: string;
  /** Order matches slideshow / visual narrative */
  slideshow: string[];
  cascade: GalleryCascadeBlock[];
};

/** Newest first for subnav ordering. */
export function compareListDateDesc(a: string, b: string): number {
  const pa = a.split(".").map((x) => parseInt(x, 10) || 0);
  const pb = b.split(".").map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pb[i] - pa[i];
  }
  return 0;
}

/** Build pair / full rows from an ordered URL list (used by ficha cascade). */
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

/** Cascade below the hero: skip `slideshow[0]` so images are not shown twice. */
function cascadeAfterHero(urls: string[]): GalleryCascadeBlock[] {
  return galleryCascadeFromUrls(urls.slice(1));
}

const logoLaaa = cargo(
  "586a7fc796bb7149470627405211dbe84266b92fe6e3f7760bd338efd30f3708",
  "logo_LAAA_v2_page-0001.png",
);

const copiasPhotos = [
  cargo(
    "d37758e2065f23f1a6ce6922a201b8f16701e8117d101103ac12c27697cee704",
    "EC013_ORI_Foto_Zaickz-Moz_HR_01.jpg",
  ),
  cargo(
    "ea7098aa25ac3e62f41b2b907a2a267e8b9a83b22d042a651e6c7e44dccf73a8",
    "EC013_ORI_Foto_Zaickz-Moz_HR_03.jpg",
  ),
  cargo(
    "1e8aea4e086440f1b51ee950d4eebf7e2ff53e373b7ce726dc247b0c124c1170",
    "EC013_ORI_Foto_Zaickz-Moz_HR_08.jpg",
  ),
  cargo(
    "6e42f95dbaf1dff073ca3f5d717a7da632afa7f50aee95a02515dbed5dade4da",
    "EC013_ORI_Foto_Zaickz-Moz_HR_14.jpg",
  ),
  cargo(
    "888eb111731953712950a3990e7bf77340d4629a8a995c00dece2d25c5bb2f45",
    "EC013_ORI_Foto_Zaickz-Moz_HR_13.jpg",
  ),
];

const facsimilPhotos = [
  cargo("d04d2468b744fabdd3be84cd5c2449c0179654bc16e7e36dadb391cfb3a032c6", "facsimil-de-un-momento_laaa-8.jpg"),
  cargo("54a7a24b88d118abc3ba41a496d2bfe0ba918db95d1c9f27d6203b7a81931ba6", "facsimil-de-un-momento_laaa-1.jpg"),
  cargo("7912cdd5361d8fa6bbc79ed460394e26fa06578f67381e5a81847e6827f1c382", "facsimil-de-un-momento_laaa-2.jpg"),
  cargo("47d31f5000a29a1e04155b7b855cdbda269f508b78b739908656e02431d95d5e", "facsimil-de-un-momento_laaa-4.jpg"),
  cargo("8afc01af8010cec8230f1fb60eff3f412a77b43bc2bdc2640ffc8f62275477e9", "facsimil-de-un-momento_laaa-5.jpg"),
  cargo("201dc6194a5afc80ef91572327f97ac9df78d43a11871413685d4dee96712bed", "facsimil-de-un-momento_laaa-6.jpg"),
  cargo("4f850dfd30ada1c71df4b7c635f0cba3df471499e92dd04ead5c8a0dec008175", "facsimil-de-un-momento_laaa-3.jpg"),
  cargo("0e650fea49700a9af351e3d9d82af05e646219e4dcc62fdca318fdb44f44393f", "facsimil-de-un-momento_laaa-7.jpg"),
  cargo("db1ce5467b1e9c53d208218ea71d50c40cf64643c36322aad10d83fd6212219b", "facsimil-de-un-momento_laaa-9.jpg"),
  cargo("56351c0b398909e12890953da9fa4651c9867cd361a7c136e07aed76d0012570", "facsimil-de-un-momento_laaa-11.jpg"),
];

const tenisPhotos = [
  cargo("1e7bbc1d61e58a59d103fc1d52a5a8282b745ad06082445d5b8e77acdde4716f", "Artboard-1300x.png"),
  cargo("c31e0d8620ab0239ca9608bb02a1b9a6222e613ffd6523008d6f4266536af7fd", "Artboard-3300x.png"),
  cargo("f70b9caaa9958bd3b175b69ad07a2c5f3954bc289c84ad429a39ac28029b54eb", "Artboard-2300x.png"),
  cargo("1a88f59656a160c14107a6c27c3e995ea4d4ad139f2a5affd9327ea20a3b84a4", "Artboard-6300x.png"),
  cargo("e0b7f90a22156c7399c6fa2e2a2f2bd9473fa13bae4882c572d06731b228482a", "Artboard-7300x.png"),
];

const fosiliferaPhotos = [
  cargo("2449c7c22bfc23947eb3928e6e598186db8f33aad199f5620dcdccbfe61a5807", "fossil-c.jpg"),
  cargo("f2e8368bdbbe5dff3186d9afd1953d2a661c670de21e4afcdabe6fce420e6bbe", "fossil.jpg"),
  cargo("d84e960170186e821da527606de3cd43978272f0bcfef2cb209182e8687f289f", "IMG_6055.JPG"),
  cargo("0f5ffb6973d3cd70d94c25bfa6d5bd1255c840fab2b969bf0558bdb09b14f9f1", "IMG_3515.JPG"),
];

const praxisCatalogoPhotos = [
  cargo("34880f532a5bfcba50acf0b20cb041de540e480c492589da826cdddc04d0dcd4", "DSC02262.jpg"),
  cargo("1accb08d54181ec46ba8680e63190961849408b3eb2276f74fcabd96d0d4ce0b", "DSC02273.jpg"),
  cargo("8558bbac02fdfdc80601e869dd04f0fd62d6d8e282deafbbdfb4faf6e20fb2ab", "DSC02147.jpg"),
  cargo("ee66a4118037c06f23723eb0cc9e0dd19df10e47917cf9535f15aac729325f80", "DSC02233.jpg"),
  cargo("a2465d813c442e83afb7f97651a544e47ac6a9bedb0e6b46d600def80f8fdd43", "DSC02307.jpg"),
];

const praxis175Photos = [
  cargo("12d3a97c493d147c597e49d381ca9649ec2720598f28cdd4261593b305dfb1be", "laaa_PRAXIS_detalle_1-75.jpg"),
  cargo("6e9070d6a028fcf52769e19004c144c7ac7215a86224cada9d2186346c77a52b", "laaa_PRAXIS_isometrico_1-75.jpg"),
  cargo("372f3a98915dfc852a4d4ca4b052ce6dcaf74af20115a72ba1064c99a3e70c92", "laaa_PRAXIS_alzado_1-75.jpg"),
];

const lostCityPhotos = [
  cargo("8dc99866d07d9b5851750cd18fb5fcb94513cb36b2f58fe3a3ca0c48c5f97655", "DSC01336.jpg"),
  cargo("c694a9dfd8b3d96c19ef57a201d3dd1b935b58b36504fe9f2ea1280205288517", "DSC01339.jpg"),
  cargo("c63cfe0c747cf2a17a1c20158da884278a6bac0773324e6f114b2a7ac287f61a", "DSC01356.jpg"),
  cargo("5e96c57ca076694e3d62661da70c35418e640493eb2710d612bb1c08c255ffc1", "lost-city-ai.jpg"),
];

const modelosPhotos = [
  cargo(
    "db369a9a2428f9253b008e8b4ca7b07b9345542c610d01f9304565be599acc5a",
    "FRANCISCO-REGALADO_25-11-21_0052.jpg",
  ),
];

const orquidearioPhotos = [
  cargo("a5249e38c7c01157d0c454c4105cf77ff8c81a82d82dbb2734ab1cca71cc30eb", "Image60.png"),
  cargo("a21af1207b2165341d8d3128423f7fb583cb544b10b0dbe2746185a036f3c536", "Image34.png"),
  cargo("90bb9cc774091c08cf636fdbf7fa491f3e82d23ece68929f6ce8df5ffc068ba1", "Image41.png"),
];

const copiasBody =
  "Copias originales, 2025. El interés internacional por la cultura mesoamericana ha sido constante desde la colonia, periodo en el que exploradores, diplomáticos e instituciones reunieron numerosas piezas prehispánicas que hoy forman parte de colecciones en Europa, estados unidos y Asia. Paralelamente, la demanda de gobiernos, museos, investigadores y coleccionistas impulsó la producción de réplicas y reconstrucciones, transformando la manera en que estos objetos se entienden y circulan.";

const facsimilBody =
  "Facsímil de un momento, 2026.\n\nHace ochenta años se registró un acontecimiento que transformó de manera decisiva la historia de Mesoamérica: el hallazgo de San Lorenzo Tenochtitlán, considerado uno de los centros más tempranos y complejos de la civilización olmeca. A partir de la evidencia generada en este sitio, en los debates académicos de mediados del siglo XX se formuló la noción de los olmecas como «cultura madre», reconociendo más de tres mil años de continuidad en las prácticas culturales, escultóricas y ritualísticas en la región. Mesoamérica se reveló así como un territorio de producción artística constante y sostenida en el tiempo. La recreación de objetos ha sido una labor fundamental tanto en la arqueología como en el arte.\n\nLa recreación de momentos, en cambio, ha pertenecido históricamente a otros campos, como el teatro o la pintura. Facsímil de un momento propone desplazar esa frontera hacia la escultura, entendiendo el hallazgo no como un instante heroico, sino como un proceso colectivo, material y situado.\n\nEsta instalación, desarrollada por LAAA en colaboración con el archivo Elementos arquitectónicos (Mario Cirett Ávila y Silvia Sáenz de Sicilia), como resultado de la investigación de Francisco Regalado y Alberto Vivar, plantea la reconstrucción de un instante histórico específico: el momento del hallazgo de la Cabeza Colosal Número 1, conocida como El Rey. La escultura, un monolito tallado en piedra de aproximadamente 2.6 metros de altura, fue localizada en 1945 en San Lorenzo Tenochtitlán por Marion Stirling y Matthew Stirling, y publicada por primera vez en 1946, cuando ingresó al circuito académico y museográfico.\n\nSi bien muchas personas participaron y presenciaron este hallazgo, sus nombres y experiencias no quedaron registrados en la historia oficial. La instalación se sitúa en ese vacío: entre el trabajo de campo y el archivo, entre la presencia y la narración.";

const bibliotecaPraxisBody =
  "Catálogo: https://laaa.mx/laaa-biblioteca\n\n50 años de praxis, 2024. Biblioteca personal del taller de arquitectura de Agustín Hernández Navarro.\n\nPraxis 1:75, 2025. X, y, z. Impresión 3D (FDM), acrílico y concreto.";

export const EXHIBITION_BY_SLUG: Record<string, ExhibitionContent> = {
  "caja-litica-olmeca": {
    title: "Caja lítica olmeca",
    listDate: "3000.03.01",
    body: "Próximamente.",
    slideshow: [logoLaaa],
    cascade: [],
  },
  coatlicue: {
    title: "Coatlicue",
    listDate: "3000.02.01",
    body: "Próximamente.",
    slideshow: [logoLaaa],
    cascade: [],
  },
  ram: {
    title: "RAM",
    listDate: "3000.01.01",
    body: "Próximamente.",
    slideshow: [logoLaaa],
    cascade: [],
  },
  "copias-originales": {
    title: "Copias originales",
    listDate: "2025.12.07",
    body: copiasBody,
    slideshow: copiasPhotos,
    cascade: cascadeAfterHero(copiasPhotos),
  },
  facsimil: {
    title: "Facsímil de un momento",
    listDate: "2026.01.01",
    body: facsimilBody,
    slideshow: facsimilPhotos,
    cascade: cascadeAfterHero(facsimilPhotos),
  },
  tenis: {
    title: "Tenis de mesa",
    listDate: "2025.12.06",
    body: "Juego de pelota . . . y raquetas (wt), 2025. Tezontle, acero inoxidable y algodón trenzado. 76 × 274 × 91 cm.",
    slideshow: tenisPhotos,
    cascade: cascadeAfterHero(tenisPhotos),
  },
  "biblioteca-praxis": {
    title: "LAAA Biblioteca Praxis",
    listDate: "2025.08.01",
    body: bibliotecaPraxisBody,
    slideshow: [...praxisCatalogoPhotos, ...praxis175Photos],
    cascade: cascadeAfterHero([...praxisCatalogoPhotos, ...praxis175Photos]),
  },
  fosilifera: {
    title: "Fosilífera",
    listDate: "2024.12.01",
    body: "Fosilífera, 2024. www.fosilifera.xyz\n\nRepositorio que tiene como objetivo compartir los modelos 3D de fósiles que forman parte de la colección del Instituto de Geología de la UNAM y del Museo Regional Mixteco Tlayua. Estos fósiles fueron extraídos de la región fosilífera en Tepexi de Rodríguez, Puebla.\n\nEste proyecto surge a partir de la investigación realizada en colaboración con Lorena Mal. Producción nacional de artes visuales realizada con el estímulo fiscal del artículo 190 de la LISR (EFIARTES), 2023.",
    slideshow: fosiliferaPhotos,
    cascade: cascadeAfterHero(fosiliferaPhotos),
  },
  "lost-city": {
    title: "Lost City",
    listDate: "2023.12.01",
    body: "Lost City, 2023 — presente. En colaboración con Sangree.",
    slideshow: lostCityPhotos,
    cascade: cascadeAfterHero(lostCityPhotos),
  },
  modelos: {
    title: "Modelos alternos de investigación arqueológica",
    listDate: "2021.06.01",
    body: "Modelos alternos de investigación arqueológica, 2021.",
    slideshow: modelosPhotos,
    cascade: cascadeAfterHero(modelosPhotos),
  },
  orquideario: {
    title: "Orquideario",
    listDate: "2021.08.01",
    body: "Orquideario, 2021.",
    slideshow: orquidearioPhotos,
    cascade: cascadeAfterHero(orquidearioPhotos),
  },
};

/** Subnav “Próximamente” row (inactive), same pattern as investigación. */
export function exhibitionEntryIsSoon(
  item: Pick<ExhibitionContent, "body">,
): boolean {
  return /\bpróximamente\b/i.test(item.body);
}

/** All “Próximamente” slugs first (newest `listDate` within that group), then dated newest first. */
export function getExhibitionNavSlugsOrdered(): string[] {
  const slugs = Object.keys(EXHIBITION_BY_SLUG) as string[];
  const soon = slugs.filter((s) => {
    const c = EXHIBITION_BY_SLUG[s];
    return c && exhibitionEntryIsSoon(c);
  });
  const rest = slugs.filter((s) => {
    const c = EXHIBITION_BY_SLUG[s];
    return c && !exhibitionEntryIsSoon(c);
  });
  const sortByListDate = (slugA: string, slugB: string) => {
    const ca = EXHIBITION_BY_SLUG[slugA];
    const cb = EXHIBITION_BY_SLUG[slugB];
    if (!ca || !cb) return 0;
    return compareListDateDesc(ca.listDate, cb.listDate);
  };
  soon.sort(sortByListDate);
  rest.sort(sortByListDate);
  return [...soon, ...rest];
}

export function getExhibitionContent(slug: string): ExhibitionContent | undefined {
  return EXHIBITION_BY_SLUG[slug];
}
