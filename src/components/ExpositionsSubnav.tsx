import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useExpoSubHover } from "../context/ExpoSubHoverContext";
import { useMobileNav } from "../context/MobileNavContext";
import { useSanityProjectList } from "../hooks/useSanityProjects";
import {
  entryIsSoonForType,
  orderProjectSlugs,
  projectBySlug,
  type ProjectWithSlug,
} from "../lib/sanityProject";
import { SanityQueryState } from "./SanityQueryState";

type Row =
  | { kind: "soon"; left: string; title: string; slug?: string }
  | { kind: "item"; left: string; title: string; slug: string };

export function ExpositionsSubnav() {
  const fetchState = useSanityProjectList("exhibition");
  const { setHoveredSlug } = useExpoSubHover();
  const { close: closeMobileNav } = useMobileNav();
  const { pathname } = useLocation();
  const detailOpen = /^\/exposiciones\/[^/]+$/.test(pathname);

  return (
    <SanityQueryState
      state={fetchState}
      loadingMessage="Cargando exposiciones…"
      errorMessage="No se pudo cargar el listado."
    >
      {(projects) => (
        <ExpositionsSubnavList
          projects={projects}
          detailOpen={detailOpen}
          setHoveredSlug={setHoveredSlug}
          closeMobileNav={closeMobileNav}
        />
      )}
    </SanityQueryState>
  );
}

function ExpositionsSubnavList({
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
  const rows: Row[] = useMemo(() => {
    return orderProjectSlugs("exhibition", projects).map((slug) => {
      const item = projectBySlug(projects, slug);
      if (!item) {
        return {
          kind: "item" as const,
          left: "",
          title: slug,
          slug,
        };
      }
      if (entryIsSoonForType("exhibition", item)) {
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
  }, [projects]);

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
