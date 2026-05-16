/** Image URLs from Figma MCP — replace with local assets for production. */

export type NavHoverKey =
  | "exposiciones"
  | "investigacion"
  | "talleres"
  | "acerca"
  | "tienda";

export type NavHoverPreview = {
  imageSrc: string;
  /** Tint overlay (mix-blend-screen), e.g. archival #82781b */
  overlayColor: string;
  /** Width of preview block as % of main column (portrait vs landscape assets). */
  layout: "vertical" | "horizontal";
};

export const NAV_HOVER_PREVIEWS: Record<NavHoverKey, NavHoverPreview> = {
  exposiciones: {
    imageSrc:
      "https://www.figma.com/api/mcp/asset/c476e294-a6d8-4e99-9835-1e9a204efe21",
    overlayColor: "#82781b",
    layout: "vertical",
  },
  investigacion: {
    imageSrc:
      "https://www.figma.com/api/mcp/asset/5e6063c7-6168-471f-875e-eb2c3cff029a",
    overlayColor: "#82781b",
    layout: "horizontal",
  },
  talleres: {
    imageSrc:
      "https://www.figma.com/api/mcp/asset/c971055f-3128-4d20-8920-c99f08433126",
    overlayColor: "#82781b",
    layout: "horizontal",
  },
  acerca: {
    imageSrc:
      "https://www.figma.com/api/mcp/asset/3f1df528-3b9e-4e0b-8bbb-b512d1099e25",
    overlayColor: "#82781b",
    layout: "horizontal",
  },
  tienda: {
    imageSrc:
      "https://www.figma.com/api/mcp/asset/ccab91d5-0164-48a8-a079-ee7cc91285f9",
    overlayColor: "#1836e3",
    layout: "vertical",
  },
};
