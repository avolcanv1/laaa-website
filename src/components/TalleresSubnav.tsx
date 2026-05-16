import { NavLink, useLocation } from "react-router-dom";
import { useTalleresSubHover } from "../context/TalleresSubHoverContext";
import {
  getTalleresContent,
  getTalleresNavSlugsOrdered,
} from "../data/talleresContent";

export function TalleresSubnav() {
  const { setHoveredSlug } = useTalleresSubHover();
  const { pathname } = useLocation();
  const detailOpen = /^\/talleres\/[^/]+$/.test(pathname);

  return (
    <aside className="expoSub" aria-label="Listado de talleres">
      <ul
        className={[
          "expoSub__list",
          detailOpen ? "expoSub__list--detailOpen" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseLeave={() => setHoveredSlug(null)}
      >
        {getTalleresNavSlugsOrdered().map((slug) => {
          const item = getTalleresContent(slug);
          if (!item) return null;
          return (
            <li key={slug} className="expoSub__item">
              <NavLink
                to={`/talleres/${slug}`}
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
