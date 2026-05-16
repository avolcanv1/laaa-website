import { NavLink, useLocation } from "react-router-dom";
import { useInvestigacionSubHover } from "../context/InvestigacionSubHoverContext";
import { useMobileNav } from "../context/MobileNavContext";
import {
  INVESTIGACION_ORDER,
  getInvestigacionContent,
  investigacionEntryIsSoon,
} from "../data/investigacionContent";

export function InvestigacionSubnav() {
  const { setHoveredSlug } = useInvestigacionSubHover();
  const { close: closeMobileNav } = useMobileNav();
  const { pathname } = useLocation();
  const detailOpen = /^\/investigacion\/[^/]+$/.test(pathname);

  return (
    <aside className="expoSub" aria-label="Investigación y desarrollo">
      <ul
        className={[
          "expoSub__list",
          detailOpen ? "expoSub__list--detailOpen" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseLeave={() => setHoveredSlug(null)}
      >
        {INVESTIGACION_ORDER.map((slug) => {
          const item = getInvestigacionContent(slug);
          if (!item) return null;

          if (investigacionEntryIsSoon(item)) {
            return (
              <li key={slug} className="expoSub__item">
                <div
                  className="expoSub__row expoSub__row--soon"
                  onMouseEnter={() => setHoveredSlug(null)}
                >
                  <span className="expoSub__meta">Próximamente</span>
                  <span className="expoSub__title expoSub__title--muted">
                    {item.title}
                  </span>
                </div>
              </li>
            );
          }

          return (
            <li key={slug} className="expoSub__item">
              <NavLink
                to={`/investigacion/${slug}`}
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
                onMouseEnter={() => setHoveredSlug(slug)}
              >
                <span className="expoSub__meta">{item.listDate}</span>
                <span className="expoSub__title">{item.title}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
