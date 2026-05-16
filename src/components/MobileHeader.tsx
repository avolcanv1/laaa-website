import { useMobileNav } from "../context/MobileNavContext";
import { Logo } from "./Logo";

export function MobileHeader() {
  const { isOpen, toggle, close } = useMobileNav();

  return (
    <header className="mobileHeader">
      <div className="mobileHeader__brand">
        <Logo markOnly onNavigate={close} />
      </div>
      <button
        type="button"
        className={[
          "mobileHeader__toggle",
          isOpen ? "mobileHeader__toggle--open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-expanded={isOpen}
        aria-controls="app-sidebar"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        id="mobile-nav-toggle"
        onClick={toggle}
      >
        <span className="mobileHeader__toggleLines" aria-hidden>
          <span className="mobileHeader__toggleBar mobileHeader__toggleBar--a" />
          <span className="mobileHeader__toggleBar mobileHeader__toggleBar--b" />
        </span>
      </button>
    </header>
  );
}
