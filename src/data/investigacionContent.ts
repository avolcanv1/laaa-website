/**
 * Investigación y desarrollo — same content shape as exposiciones (`ExhibitionContent`).
 * Images via `/cargo-media/` (npm run download-media); sourced from https://laaa.mx/. Minerva Cuevas, Cristóbal Gracia y Dr. Lakra
 * have no images on the live page.
 */

import {
  compareListDateDesc,
  type ExhibitionContent,
  type GalleryCascadeBlock,
} from "./exhibitionContent";
import { cargoImageForWeb } from "../lib/cargoImage";

const cargo = cargoImageForWeb;

function cascadeFromHeroAndRest(urls: string[]): GalleryCascadeBlock[] {
  if (urls.length <= 1) return [];
  const rest = urls.slice(1);
  const out: GalleryCascadeBlock[] = [];
  let i = 0;
  while (i + 1 < rest.length) {
    out.push({ type: "pair", left: rest[i], right: rest[i + 1] });
    i += 2;
  }
  if (i < rest.length) {
    out.push({ type: "full", src: rest[i] });
  }
  return out;
}

function entry(
  listDate: string,
  body: string,
  urls: string[],
): Pick<ExhibitionContent, "listDate" | "body" | "slideshow" | "cascade"> {
  return {
    listDate,
    body,
    slideshow: urls,
    cascade: cascadeFromHeroAndRest(urls),
  };
}

export const INVESTIGACION_BY_SLUG: Record<string, ExhibitionContent> = {
  avantgardo: {
    title: "Avantgardo",
    ...entry(
      "2022.12.01",
      "La buena vida, 2022. Impresión 3D (FDM) y pintura automotriz.",
      [
        cargo(
          "5f0753e77437d3b795356899bb4281be6ae58ab40a1bbf4e839487cdc5351e64",
          "DSC04409.jpg",
        ),
        cargo(
          "03ce691df0b8c59a9ceb834dba01aa6e26a8cde03608de45e2914d4cda08ecaf",
          "DSC04420.jpg",
        ),
        cargo(
          "7452b8beee992683d5e0f5e0930c166ecddb1311d20a93b3c712e1d594190d53",
          "DSC04439.jpg",
        ),
      ],
    ),
  },
  "bea-bonafini": {
    title: "Bea Bonafini",
    ...entry(
      "2022.11.01",
      "Ghosts for a post-modern tale, 2022.", [
      cargo(
        "6f77f9480c119b2708ab28b7c025f68fda81f6e8103df939ff40dad33f112d7c",
        "0E4A0389.jpg",
      ),
      cargo(
        "dc0d98d3b96005cd54afe399d16acf0eafec2991629fd3c6d02b4319bb45a3c9",
        "0E4A0365.jpg",
      ),
      cargo(
        "41a1ca52950928660d661c8401d8ded80aaec962dc9e0f810da5c5ca30efc5bd",
        "0E4A0345.jpg",
      ),
      cargo(
        "307bc8997eb4b3a3eb7e89c451452e387890f140a2e861f7a6ad2ab1df4b8bb2",
        "0E4A0346.jpg",
      ),
      cargo(
        "9a77e5bcafe6d41594e787bcf3e0c8acc5e687ec041fe77daed31662a2d46073",
        "0E4A0348.jpg",
      ),
      cargo(
        "2fb4caace71d2c7d086b80670c0a416d284c5c1158836462251cc183bfcd9298",
        "0E4A0349.jpg",
      ),
      cargo(
        "b3d547efbac7bd15d14429e7645850747174c8cf75aadf12c6473a700fbe3a1a",
        "0E4A0350.jpg",
      ),
      cargo(
        "b906dcccbd8c9b882a09a7c9245ced2e9848bcb5059124a343680841e1692297",
        "0E4A0352.jpg",
      ),
      cargo(
        "ebbc9b725fa96f6acf99d317e74c233566439c97fe748dba3ab12322c5c55294",
        "0E4A0390.jpg",
      ),
    ]),
  },
  "minerva-cuevas": {
    title: "Minerva Cuevas",
    ...entry("2025.06.01", "Digitalización mural, 2025.", []),
  },
  "nicole-chaput": {
    title: "Nicole Chaput",
    ...entry(
      "2024.12.01",
      "Embalsamada con picante, 2024. Óleo sobre denim; triplay de pino, acero inoxidable y concreto. La maldita belleza se nos pega como placenta, 2023. Óleo sobre denim; madera de encino, acero inoxidable y concreto. Femme fillet formalism, 2023. Óleo sobre denim; madera de encino, acero inoxidable y concreto.",
      [
        cargo(
          "22b659d1a4f298c5b0077800702a6145eb3e4ef43d6649df6c750007c20e3360",
          "DSC00023.jpg",
        ),
        cargo(
          "4f119701aefba798c5a989a6421f04bb0bfc193213b6dee44976a77aa803b12f",
          "DSC07461.JPG",
        ),
        cargo(
          "aa696862b9455ec05c09ece2148825c41f32a65da8bac51f402079c97328835e",
          "DSC07469.JPG",
        ),
        cargo(
          "5cd741d740f67bc7379265cae65806e43ae508be2e1081e498183577b98b63a8",
          "Front_long--sat.jpg",
        ),
        cargo(
          "d359fe6dc5dccd2ce755c62cc90080f53c26e6e764063647fbb089ad67be5fd3",
          "Back_long.jpg",
        ),
        cargo(
          "b17cc2e0c196e9fa850350a32bc96aa2bf4ab47cc6b1a675e9c84720a05da353",
          "b-0.jpg",
        ),
        cargo(
          "9d28e4c58d7dc90627fd3f44ff268d3ae818f18c1e115d5fabaf3c8001c399d6",
          "a-0.JPG",
        ),
        cargo(
          "6bea5cccbf32a8e56ba8bf18a5ae6b56e11f20fef2b1c068c653f37454ac82a5",
          "a-1.JPG",
        ),
        cargo(
          "a25528155561ba79a7a5be76f297f541b6eea6132d958323f674f81730651bb2",
          "0E4A5670.jpg",
        ),
      ],
    ),
  },
  "abraham-cruzvillegas": {
    title: "Abraham Cruzvillegas",
    ...entry(
      "2022.10.01",
      "Plástico, 2022. Escaneo 3D, impresión 3D (SLA) y pintura acrílica, 15 × 10 × 11 cm. Desarrollado para Ediciones Marea.",
      [
        cargo(
          "5c1d6f0139183330d721d79369e35f7c7ec03bcf8a90404c47ca6050ee8ab30f",
          "2_acv_original-ref.jpg",
        ),
        cargo(
          "508f8770baa2bd83058d558fd1a558ae6843de6b8075a1349daa29e785a697ba",
          "3_acv_proceso-ref.jpg",
        ),
        cargo(
          "74e253ad8fdd0946d00197c81cb359bd02feb7b98feefbcc479613ae342a594c",
          "5_acv_terminada-ref.jpg",
        ),
      ],
    ),
  },
  "andrea-ferrero": {
    title: "Andrea Ferrero",
    ...entry(
      "2020.06.01",
      "Volveré y seré millones, 2020. Impresión 3D (FDM), resina y madera, 120 × 150 × 50 cm.",
      [
        cargo(
          "a8539e76605bd9050b2359ad642273068e8b80ca12be178823d2d9df150d6812",
          "LAAA_andreaFerrero.jpg",
        ),
      ],
    ),
  },
  "mario-garcia-torres": {
    title: "Mario García Torres",
    ...entry("2021.12.01", "Drifters, 2021. Instalación de RA (realidad aumentada).", [
      cargo(
        "bc010741a7a1a4dc687b6f9722ee82aca5e66faa5603bffbfafa076611696d12",
        "refDrifters.jpg",
      ),
    ]),
  },
  "cristobal-gracia": {
    title: "Cristóbal Gracia",
    ...entry(
      "2020.12.01",
      "2019 Bikini Art Residency, Como, Italia. 2020 Pequod, Ciudad de México.",
      [],
    ),
  },
  "dr-lakra": {
    title: "Dr. Lakra",
    ...entry("0000.01.01", "Próximamente.", []),
  },
  "lorena-mal": {
    title: "Lorena Mal",
    ...entry(
      "2024.11.01",
      "Troncos (después de Feliciano Peña, 1944), 2024. Escaneo 3D, impresión 3D (FDM) y piedra volcánica. Restregarnos tierra en los ojos, 2024. Tierra y madera.",
      [
        cargo(
          "da47d7df2570307dafb45eb967d38dcd496290183c110f322188c5d22d8cb458",
          "lorenaMal_dinamos.jpg",
        ),
        cargo(
          "f0e22f5c3bae450fb175086baae0d98b73eb631e0016a996fa570882575dbc21",
          "0E4A2956.jpg",
        ),
        cargo(
          "2595ab29dee14b7355f13e872bc8fea384cc3f41f7992500b0df2c19b3cb8db8",
          "0E4A2971.jpg",
        ),
        cargo(
          "0a541823b4b7abf1d82ecb7552a467ddf24c705f0d1cb8e7d54ed026d52b3c12",
          "0E4A2949.jpg",
        ),
        cargo(
          "4dfe6314d8e1db5c950ee6e020b8e003995dd06e0b36ba5c83f5ee3d5df264d3",
          "0E4A2953.jpg",
        ),
        cargo(
          "28232b62dc7895810f78f6125f28d5974e585c509e2a90d72f57448b3f6dee79",
          "0E4A2955.jpg",
        ),
      ],
    ),
  },
  "elsa-louise-manceaux": {
    title: "Elsa-Louise Manceaux",
    ...entry("2022.09.01", "Cromosoma cómic, Bikini Wax, 2022.", [
      cargo(
        "9117a57578f1d5c4497767e4fc697e2cad45f81ae25f1175ce283b2b803eb697",
        "forInstagramPost.jpg",
      ),
    ]),
  },
  "roger-munoz": {
    title: "Roger Muñoz",
    ...entry(
      "2023.12.01",
      "Hydra, 2023. Impresión 3D (FDM), resina, madera y pintura automotriz. Jarrón, 2023. Impresión 3D (FDM), resina, impresión UV, madera y pintura automotriz.",
      [
        cargo(
          "a3576611fc9f094eada7c28f2237698b7c44e4a1236befc9241b5d4884e12006",
          "DSC08387.jpg",
        ),
        cargo(
          "96fd110c93ed2135a9ddbda91fbe1c1ac500db6e44f05b05a5d750057de7bee0",
          "DSC08380.jpg",
        ),
        cargo(
          "574fb0ead1bf84c73c92528aaed7a50de8d33b00a013ec638e75fc851659ce33",
          "DSC08391.jpg",
        ),
        cargo(
          "6bc98fa5f5633b2493095d4811209fd26dfe5d214dd9cf5c12d3dac706b3ebf8",
          "2.jpg",
        ),
        cargo(
          "0c75a307c9338ee3143f6e2f21403843169b67d83903dfe0c6b638059522f4f0",
          "_S0A4733.jpg",
        ),
        cargo(
          "7d057f6ffd9a36bb6911d288340eb3636a2b5038c1d92372dc0f3a87e1aa7f2c",
          "8.jpg",
        ),
        cargo(
          "7507770066d718ba78f66fb626548429e80b86ad6445431d11098223ce0e0140",
          "DSC08372.jpg",
        ),
        cargo(
          "c11e21de9272422096e82b154d0463edc707659727251cb01307f2970766ec04",
          "IMG_4937.jpg",
        ),
        cargo(
          "f95273f1528b316ba909278dcf33aa3ee167a43762ab8b6734b15e515d4bb6b9",
          "1.jpg",
        ),
        cargo(
          "adb0fc7eaaaea9987e80429d703ea613af7c48e7bcb389ae98aa8724abd71b33",
          "_S0A4674.jpg",
        ),
        cargo(
          "d82947a6164e7ecc64b0a106ec7149e35d529dce38f2faa956aded79019e5ba6",
          "_S0A4680.jpg",
        ),
      ],
    ),
  },
  "barbara-sanchez-kane": {
    title: "Bárbara Sánchez-Kane",
    ...entry(
      "2024.10.01",
      "Tank top (wt), 2024. 35 × 28 × 54 cm. Impresión 3D (FDM y SLA).",
      [
        cargo(
          "5a8afe68f75a90c2ddd95b800ffdee3466cb9c801a9ad0e850d6660a6a70c9ce",
          "detalle_1a8-5.jpg",
        ),
        cargo(
          "cfb2a545fcf8b1acab61ef61c92f815ec97fb6b356740376847bbb650356d758",
          "IMG_5656.JPG",
        ),
        cargo(
          "40b7a17f64c21f93bb7689ed085487e10379ee47168a8b6afa9be1b75ee939aa",
          "IMG_5654.JPG",
        ),
        cargo(
          "7e3c925bf92243d7632804236d5b4a75af6261d4da9f4ec413cf28c4c0e5ac05",
          "DSC04773.jpg",
        ),
        cargo(
          "ff0d8605675cf30e644d68f1d6c673d079cace6fc3c46328c76272e858bcc7f9",
          "DSC05214.jpg",
        ),
        cargo(
          "c231bd22fc2ac3900776658128fec06e168584255f935505b4c884dcdb9eceef",
          "DSC05250.jpg",
        ),
      ],
    ),
  },
  sangree: {
    title: "Sangree",
    ...entry("2023.11.01", "Aeon blink, 2023.", [
      cargo(
        "5fbebbfa632ca8a7b925929b74e7d08896d8e00db5c44e9d9407a8a59248046b",
        "Copy-of-DSC01467.jpg",
      ),
      cargo(
        "94ff7a56653e8d3f86046b1c02208bfb6257df57a7538d67193794bc6d26f138",
        "Copy-of-DSC01477.jpg",
      ),
      cargo(
        "2ed3974027aadce01d539aa55fee9a3791ff5ae8ca606e56a9373e128a494ece",
        "Copy-of-DSC01455.jpg",
      ),
    ]),
  },
  superflex: {
    title: "Superflex",
    ...entry(
      "2022.08.01",
      "The carrot, 2022. Concreto y calcita, 60 × 8 × 8.5 cm. Desarrollado para Ediciones Marea.",
      [
        cargo(
          "7a1d99b18cd7860d013cec1de4e628c474add9dd1355c9a48d655903459d17dc",
          "SUPERLFEX_PROCESOS-21.17.32.png",
        ),
        cargo(
          "22c2319fbf471fb5b9fff184c6f9c8ce24ca6f213f5948edc5b82c651c79a82b",
          "SUPERLFEX_PROCESOS-21.17.39.png",
        ),
        cargo(
          "d7ab6cbee385f664d51d35f5607bec3d0dc3e33d76ef8e0747fffc1261c1681c",
          "SUPERLFEX_PROCESOS-21.18.14.png",
        ),
        cargo(
          "286fd31605075bcb38319a7e7dce13c468433d4264c1d273561901e637e39a19",
          "SUPERLFEX_PROCESOS-21.19.12.png",
        ),
        cargo(
          "6d1bcd0a94826ec33d308631c48521a8ead5bae63176e43849a4da5f1b298004",
          "SUPERLFEX_PROCESOS-21.19.51.png",
        ),
        cargo(
          "42b9e23bee41996d824ecfc2f5ff02c08fd687fa4ab341d9918baa9cf3649b28",
          "SUPERLFEX_PROCESOS-21.21.41.png",
        ),
      ],
    ),
  },
  urmeer: {
    title: "Urmeer",
    ...entry(
      "2023.10.01",
      "Fantasías de ayer y hoy, 2023. Impresión 3D, triplay y fomi. Parte de «El fin de lo maravilloso», Museo Universitario El Chopo, 2023.",
      [
        cargo(
          "0775c9e1c7e0603f0ecaa8e94f344f431b1ef1dfb981750b28aa857510c78eea",
          "full01.jpg",
        ),
        cargo(
          "f86315a8838ab7d35adcfdb4854744c2a2291171c8c572dad39a321054dc9e52",
          "camion00.jpg",
        ),
        cargo(
          "3c65dcbf59e3dbb39f6b71f42847e1810c196f87fcbb943c1b559c57d58eda0e",
          "baticoyote00.jpg",
        ),
        cargo(
          "d41e66b6d4726a2ba7addfbee1d6a36f13a16552d3b35d9a97f86e88a28f75ce",
          "tunel00.jpg",
        ),
        cargo(
          "c155bc28d8e9ed36dc1ea3b25b3606bc8762960febae8e6fc20427639cbe2b0e",
          "cactus00.jpg",
        ),
        cargo(
          "6e23ff013e69a5e7f30901f8a55897d23e17d05d6c359a04c32a6f431de1c326",
          "cabina00.jpg",
        ),
      ],
    ),
  },
};

/** Subnav “Próximamente” row (inactive), same pattern as Exposiciones. */
export function investigacionEntryIsSoon(
  item: Pick<ExhibitionContent, "body">,
): boolean {
  return /\bpróximamente\b/i.test(item.body);
}

/** All “Próximamente” entries first, then newest `listDate` first. */
export const INVESTIGACION_ORDER: string[] = (() => {
  const slugs = Object.keys(INVESTIGACION_BY_SLUG) as string[];
  const soon = slugs.filter((s) => {
    const c = INVESTIGACION_BY_SLUG[s];
    return c && investigacionEntryIsSoon(c);
  });
  const rest = slugs.filter((s) => {
    const c = INVESTIGACION_BY_SLUG[s];
    return c && !investigacionEntryIsSoon(c);
  });
  const sortByListDate = (slugA: string, slugB: string) => {
    const ca = INVESTIGACION_BY_SLUG[slugA];
    const cb = INVESTIGACION_BY_SLUG[slugB];
    if (!ca || !cb) return 0;
    return compareListDateDesc(ca.listDate, cb.listDate);
  };
  soon.sort(sortByListDate);
  rest.sort(sortByListDate);
  return [...soon, ...rest];
})();

export function getInvestigacionContent(
  slug: string,
): ExhibitionContent | undefined {
  return INVESTIGACION_BY_SLUG[slug];
}
