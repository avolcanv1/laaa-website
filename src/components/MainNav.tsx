import { NavLink, useLocation } from "react-router-dom";
import { useMobileNav } from "../context/MobileNavContext";
import { useTiendaCart } from "../context/TiendaCartContext";
import { useMainNavHover } from "../context/MainNavHoverContext";
import type { NavHoverKey } from "../nav/navHoverPreviews";
import { Logo } from "./Logo";
import { NavGlyph } from "./NavGlyph";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    "mainNav__row",
    isActive ? "mainNav__row--active" : "mainNav__row--idle",
  ].join(" ");

function routeActive(key: NavHoverKey, pathname: string): boolean {
  switch (key) {
    case "exposiciones":
      return pathname.startsWith("/exposiciones");
    case "investigacion":
      return pathname.startsWith("/investigacion");
    case "talleres":
      return pathname.startsWith("/talleres");
    case "acerca":
      return pathname.startsWith("/acerca");
    case "tienda":
      return pathname.startsWith("/tienda");
    default:
      return false;
  }
}

export function MainNav() {
  const { pathname } = useLocation();
  const { itemCount, openDrawer } = useTiendaCart();
  const { setHovered } = useMainNavHover();
  const { close: closeMobileNav } = useMobileNav();
  const home = pathname === "/";
  /** Off home, one section is active — dim the other primary links (screenshot reference). */
  const dimInactive = !home;

  const ex = routeActive("exposiciones", pathname);
  const inv = routeActive("investigacion", pathname);
  const tal = routeActive("talleres", pathname);
  const ac = routeActive("acerca", pathname);
  const tie = routeActive("tienda", pathname);

  const navHoverDisabled = tie || ac;

  const onRowEnter = (key: NavHoverKey) => () => {
    if (navHoverDisabled) return;
    setHovered(key);
  };
  const onNavLeave = () => setHovered(null);

  return (
    <aside className="mainNav" aria-label="Navegación principal">
      <Logo onNavigate={closeMobileNav} />
      <nav className="mainNav__list" onMouseLeave={onNavLeave}>
        <NavLink
          to="/exposiciones"
          onClick={closeMobileNav}
          onMouseEnter={onRowEnter("exposiciones")}
          className={() =>
            [
              "mainNav__row",
              ex ? "mainNav__row--active" : home ? "mainNav__row--home" : "",
            ]
              .filter(Boolean)
              .join(" ")
          }
        >
          <span
            className={
              dimInactive && !ex
                ? "mainNav__label mainNav__label--muted"
                : "mainNav__label"
            }
          >
            Exposiciones
          </span>
          <NavGlyph
            kind={ex ? "minus" : dimInactive && !ex ? "plusMuted" : "plus"}
            label={ex ? "Contraer" : "Expandir"}
            className="mainNav__glyphWrap"
          />
        </NavLink>

        <NavLink
          to="/investigacion"
          onClick={closeMobileNav}
          onMouseEnter={onRowEnter("investigacion")}
          className={navItemClass}
        >
          <span
            className={
              dimInactive && !inv
                ? "mainNav__label mainNav__label--muted"
                : "mainNav__label"
            }
          >
            Investigación y desarrollo
          </span>
          <NavGlyph
            kind={
              inv ? "minus" : dimInactive && !inv ? "plusMuted" : "plus"
            }
            label={inv ? "Contraer" : "Expandir"}
            className="mainNav__glyphWrap"
          />
        </NavLink>

        <NavLink
          to="/talleres"
          onClick={closeMobileNav}
          onMouseEnter={onRowEnter("talleres")}
          className={navItemClass}
        >
          <span
            className={
              dimInactive && !tal
                ? "mainNav__label mainNav__label--muted"
                : "mainNav__label"
            }
          >
            Talleres
          </span>
          <NavGlyph
            kind={
              tal ? "minus" : dimInactive && !tal ? "plusMuted" : "plus"
            }
            label={tal ? "Contraer" : "Expandir"}
            className="mainNav__glyphWrap"
          />
        </NavLink>

        <NavLink
          to="/acerca"
          onClick={closeMobileNav}
          onMouseEnter={onRowEnter("acerca")}
          className={navItemClass}
        >
          <span
            className={
              dimInactive && !ac
                ? "mainNav__label mainNav__label--muted"
                : "mainNav__label"
            }
          >
            Acerca
          </span>
          <NavGlyph
            kind={ac ? "minus" : dimInactive && !ac ? "plusMuted" : "plus"}
            label={ac ? "Contraer" : "Expandir"}
            className="mainNav__glyphWrap"
          />
        </NavLink>

        <NavLink
          to="/tienda"
          onClick={closeMobileNav}
          onMouseEnter={onRowEnter("tienda")}
          className={({ isActive }) =>
            [
              "mainNav__row",
              "mainNav__row--tienda",
              dimInactive && !tie ? "mainNav__row--tiendaMuted" : "",
              isActive ? "mainNav__row--active" : "",
            ]
              .filter(Boolean)
              .join(" ")
          }
        >
          <span
            className={
              dimInactive && !tie
                ? "mainNav__label mainNav__label--tiendaMuted"
                : "mainNav__label mainNav__label--tienda"
            }
          >
            Laaa Tienda
            {itemCount > 0 ? (
              <span className="visuallyHidden">
                {`, ${itemCount} artículo${itemCount === 1 ? "" : "s"} en el carrito`}
              </span>
            ) : null}
          </span>
          <NavGlyph
            kind={dimInactive && !tie ? "tiendaMuted" : "tienda"}
            label="Carrito"
            className="mainNav__glyphWrap"
            tiendaCartCount={itemCount}
            onTiendaClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openDrawer();
            }}
          />
        </NavLink>
      </nav>
    </aside>
  );
}
