import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useInvestigacionSubHover } from "../context/InvestigacionSubHoverContext";
import { useMobileNav } from "../context/MobileNavContext";
import { useSanityProjectList } from "../hooks/useSanityProjects";
import {
  entryIsSoonForType,
  orderProjectSlugs,
  preloadProjectHero,
  projectBySlug,
  type ProjectWithSlug,
} from "../lib/sanityProject";
import { SanityQueryState } from "./SanityQueryState";

export function InvestigacionSubnav() {
  const fetchState = useSanityProjectList("investigacion");
  const { setHoveredSlug } = useInvestigacionSubHover();
  const { close: closeMobileNav } = useMobileNav();
  const { pathname } = useLocation();
  const detailOpen = /^\/investigacion\/[^/]+$/.test(pathname);

  return (
    <SanityQueryState
      state={fetchState}
      errorMessage="No se pudo cargar el listado."
    >
      {(projects) => (
        <InvestigacionSubnavList
          projects={projects}
          detailOpen={detailOpen}
          setHoveredSlug={setHoveredSlug}
          closeMobileNav={closeMobileNav}
        />
      )}
    </SanityQueryState>
  );
}

function InvestigacionSubnavList({
  projects,
  detailOpen,
  setHoveredSlug,
  closeMobileNav,
}: {
  projects: ProjectWithSlug[];
  detailOpen: boolean;
  setHoveredSlug: (slug: string | null) => void;
  closeMobileNav: () => void;
}) {
  const orderedSlugs = useMemo(
    () => orderProjectSlugs("investigacion", projects),
    [projects],
  );

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
        {orderedSlugs.map((slug) => {
          const item = projectBySlug(projects, slug);
          if (!item) return null;

          if (entryIsSoonForType("investigacion", item)) {
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
                onMouseEnter={() => {
                  preloadProjectHero(projects, slug);
                  setHoveredSlug(slug);
                }}
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
