import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useMobileNav } from "../context/MobileNavContext";
import { useTalleresSubHover } from "../context/TalleresSubHoverContext";
import { useSanityProjectList } from "../hooks/useSanityProjects";
import {
  entryIsSoonForType,
  orderProjectSlugs,
  projectBySlug,
  type ProjectWithSlug,
} from "../lib/sanityProject";
import { SanityQueryState } from "./SanityQueryState";

export function TalleresSubnav() {
  const fetchState = useSanityProjectList("taller");
  const { setHoveredSlug } = useTalleresSubHover();
  const { close: closeMobileNav } = useMobileNav();
  const { pathname } = useLocation();
  const detailOpen = /^\/talleres\/[^/]+$/.test(pathname);

  return (
    <SanityQueryState
      state={fetchState}
      loadingMessage="Cargando talleres…"
      errorMessage="No se pudo cargar el listado."
    >
      {(projects) => (
        <TalleresSubnavList
          projects={projects}
          detailOpen={detailOpen}
          setHoveredSlug={setHoveredSlug}
          closeMobileNav={closeMobileNav}
        />
      )}
    </SanityQueryState>
  );
}

function TalleresSubnavList({
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
    () => orderProjectSlugs("taller", projects),
    [projects],
  );

  return (
    <aside className="expoSub" aria-label="Talleres">
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

          return (
            <li key={slug} className="expoSub__item">
              <NavLink
                to={`/talleres/${slug}`}
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
                <span className="expoSub__meta">
                  {entryIsSoonForType("taller", item)
                    ? "Próximamente"
                    : item.listDate}
                </span>
                <span
                  className={
                    entryIsSoonForType("taller", item)
                      ? "expoSub__title expoSub__title--muted"
                      : "expoSub__title"
                  }
                >
                  {item.title}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
