import { NavLink, useLocation } from "react-router-dom";
import { useExpoSubHover } from "../context/ExpoSubHoverContext";
import { useMobileNav } from "../context/MobileNavContext";
import {
  exhibitionEntryIsSoon,
  getExhibitionContent,
  getExhibitionNavSlugsOrdered,
} from "../data/exhibitionContent";

type Row =
  | { kind: "soon"; left: string; title: string; slug?: string }
  | { kind: "item"; left: string; title: string; slug: string };

function exhibitionItemRows(): Row[] {
  return getExhibitionNavSlugsOrdered().map((slug) => {
    const item = getExhibitionContent(slug);
    if (!item) {
      return {
        kind: "item" as const,
        left: "",
        title: slug,
        slug,
      };
    }
    if (exhibitionEntryIsSoon(item)) {
      return {
        kind: "soon" as const,
        left: "Próximamente",
        title: item.title,
        slug,
      };
    }
    return {
      kind: "item" as const,
      left: item.listDate,
      title: item.title,
      slug,
    };
  });
}

export function ExpositionsSubnav() {
  const { setHoveredSlug } = useExpoSubHover();
  const { close: closeMobileNav } = useMobileNav();
  const { pathname } = useLocation();
  /** On a ficha, inactive rows turn gray; on `/exposiciones` index everything stays black. */
  const detailOpen = /^\/exposiciones\/[^/]+$/.test(pathname);
  const rows: Row[] = exhibitionItemRows();

  return (
    <aside className="expoSub" aria-label="Listado de exposiciones">
      <ul
        className={[
          "expoSub__list",
          detailOpen ? "expoSub__list--detailOpen" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseLeave={() => setHoveredSlug(null)}
      >
        {rows.map((row, i) => (
          <li
            key={row.kind === "item" ? row.slug : row.slug ?? `soon-static-${i}`}
            className="expoSub__item"
          >
            {row.kind === "soon" ? (
              <div
                className="expoSub__row expoSub__row--soon"
                onMouseEnter={() => setHoveredSlug(null)}
              >
                <span className="expoSub__meta">{row.left}</span>
                <span className="expoSub__title expoSub__title--muted">
                  {row.title}
                </span>
              </div>
            ) : (
              <NavLink
                to={`/exposiciones/${row.slug}`}
                onClick={closeMobileNav}
                className={({ isActive }) =>
                  [
                    "expoSub__row",
                    "expoSub__row--link",
                    isActive ? "expoSub__row--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
                onMouseEnter={() => setHoveredSlug(row.slug)}
              >
                <span className="expoSub__meta">{row.left}</span>
                <span className="expoSub__title">{row.title}</span>
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
