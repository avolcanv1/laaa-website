import { TiendaNavBrackets } from "./TiendaNavBrackets";

type Glyph = "plus" | "minus" | "plusMuted" | "tienda" | "tiendaMuted";

function IconPlus({ muted }: { muted: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 35"
      fill="none"
      className="navGlyph__plusSvg"
      aria-hidden
    >
      <path
        d="M35.7918 18.1169L18.597 18.1169L18.597 34.9189H17.121L17.121 18.1169H0L0 16.802H17.121V0L18.597 0V16.802L35.7918 16.802V18.1169Z"
        fill={muted ? "var(--color-stroke)" : "var(--color-black)"}
      />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 41 1"
      fill="none"
      className="navGlyph__minusSvg"
      aria-hidden
    >
      <path
        d="M40.9814 1H0V0H40.9814V1Z"
        fill="var(--color-black)"
      />
    </svg>
  );
}

type NavGlyphProps = {
  kind: Glyph;
  label: string;
  className?: string;
  /** Laaa Tienda: total items; shown between `[` `]` */
  tiendaCartCount?: number;
};

export function NavGlyph({
  kind,
  label,
  className,
  tiendaCartCount = 0,
}: NavGlyphProps) {
  if (kind === "plus" || kind === "plusMuted") {
    return (
      <span className={className} aria-hidden="true" title={label}>
        <span className="navGlyph navGlyph--plusWrap">
          <IconPlus muted={kind === "plusMuted"} />
        </span>
      </span>
    );
  }

  if (kind === "minus") {
    return (
      <span className={className} aria-hidden="true" title={label}>
        <span className="navGlyph navGlyph--minusWrap">
          <IconMinus />
        </span>
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true" title={label}>
      <span className="navGlyph navGlyph--tiendaWrap">
        <TiendaNavBrackets
          count={tiendaCartCount}
          muted={kind === "tiendaMuted"}
        />
      </span>
    </span>
  );
}
