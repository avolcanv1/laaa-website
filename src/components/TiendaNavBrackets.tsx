/**
 * Brackets + cart count for the Laaa Tienda nav row (Figma “Botones” tienda treatment).
 */

type TiendaNavBracketsProps = {
  /** Total items in cart (line quantity); 0 shows empty brackets */
  count: number;
  muted?: boolean;
  /** Shown between the brackets instead of the cart count. */
  label?: string;
};

function BracketLeft({ muted }: { muted: boolean }) {
  const c = muted ? "var(--color-stroke)" : "var(--color-tienda)";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 11 29"
      className="tiendaNavBrackets__bracket"
      aria-hidden
    >
      <path
        d="M10 1H2v27h8"
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

function BracketRight({ muted }: { muted: boolean }) {
  const c = muted ? "var(--color-stroke)" : "var(--color-tienda)";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 11 29"
      className="tiendaNavBrackets__bracket"
      aria-hidden
    >
      <path
        d="M1 1h8v27H1"
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function TiendaNavBrackets({
  count,
  muted,
  label,
}: TiendaNavBracketsProps) {
  const color = muted ? "var(--color-stroke)" : "var(--color-tienda)";
  const showingLabel = Boolean(label);
  const title = showingLabel
    ? label
    : count > 0
      ? `${count} artículo${count === 1 ? "" : "s"} en el carrito`
      : "";

  return (
    <span
      className={
        showingLabel
          ? "tiendaNavBrackets tiendaNavBrackets--label"
          : "tiendaNavBrackets"
      }
      aria-hidden={showingLabel ? undefined : count === 0}
      title={title || undefined}
    >
      <span className="tiendaNavBrackets__inner">
        <BracketLeft muted={!!muted} />
        <span
          className={
            showingLabel
              ? "tiendaNavBrackets__label"
              : "tiendaNavBrackets__count"
          }
          style={{ color }}
        >
          {showingLabel
            ? label
            : count > 0
              ? count > 99
                ? "99+"
                : count
              : ""}
        </span>
        <BracketRight muted={!!muted} />
      </span>
    </span>
  );
}
