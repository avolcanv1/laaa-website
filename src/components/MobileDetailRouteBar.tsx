import { Link } from "react-router-dom";

type MobileDetailRouteBarProps = {
  /** Index URL for this gallery (e.g. `/exposiciones`). Section label links here on mobile. */
  sectionHref: string;
  sectionLabel: string;
  entryTitle: string;
};

/**
 * Mobile ficha: sticky line “Sección → título del proyecto” (hidden on desktop via CSS).
 */
export function MobileDetailRouteBar({
  sectionHref,
  sectionLabel,
  entryTitle,
}: MobileDetailRouteBarProps) {
  return (
    <nav
      className="mobileDetailRoute"
      aria-label={`${sectionLabel} → ${entryTitle}`}
    >
      <p className="mobileDetailRoute__line">
        <span className="mobileDetailRoute__prefix">
          <Link
            to={sectionHref}
            className="mobileDetailRoute__section mobileDetailRoute__sectionLink"
          >
            {sectionLabel}
          </Link>
          <span className="mobileDetailRoute__arrow" aria-hidden>
            {" → "}
          </span>
        </span>
        <span className="mobileDetailRoute__entry">{entryTitle}</span>
      </p>
    </nav>
  );
}
