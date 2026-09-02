import { useEffect, useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ExpoSubHoverPreview } from "../components/ExpoSubHoverPreview";
import { ExpositionsSubnav } from "../components/ExpositionsSubnav";
import { InvestigacionSubHoverPreview } from "../components/InvestigacionSubHoverPreview";
import { InvestigacionSubnav } from "../components/InvestigacionSubnav";
import { InactivityStickers } from "../components/InactivityStickers";
import { MainNav } from "../components/MainNav";
import { MainNavHoverPreview } from "../components/MainNavHoverPreview";
import { MobileHeader } from "../components/MobileHeader";
import { RouteTransition } from "../components/RouteTransition";
import { TiendaCartDrawer } from "../components/TiendaCartDrawer";
import { TiendaCartConfirmPopup } from "../components/TiendaCartConfirmPopup";
import { TalleresSubHoverPreview } from "../components/TalleresSubHoverPreview";
import { TalleresSubnav } from "../components/TalleresSubnav";
import { ExpoSubHoverProvider } from "../context/ExpoSubHoverContext";
import { InvestigacionSubHoverProvider } from "../context/InvestigacionSubHoverContext";
import { MainNavHoverProvider } from "../context/MainNavHoverContext";
import { MobileNavProvider, useMobileNav } from "../context/MobileNavContext";
import { TalleresSubHoverProvider } from "../context/TalleresSubHoverContext";
import { useMobileLayoutMax1200 } from "../hooks/useMobileLayoutMax1200";
import { getRouteTransitionKey, commitRouteSectionKey } from "../lib/routeTransitionKey";

function AppLayoutChrome() {
  const { pathname } = useLocation();
  const routeTransitionKey = getRouteTransitionKey(pathname);
  const { close, isOpen } = useMobileNav();
  const isMobileLayout = useMobileLayoutMax1200();
  const showExpoSub = pathname.startsWith("/exposiciones");
  const showInvSub = pathname.startsWith("/investigacion");
  const showTalleresSub = pathname.startsWith("/talleres");
  const isTienda = pathname.startsWith("/tienda");
  const isAcerca = pathname.startsWith("/acerca");
  const secondColumnNav = showExpoSub || showInvSub || showTalleresSub;
  const showMainNavHoverPreview =
    !showExpoSub && !showInvSub && !showTalleresSub && !isAcerca && !isTienda;

  useLayoutEffect(() => {
    commitRouteSectionKey(routeTransitionKey);
  }, [routeTransitionKey]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isMobileLayout && isOpen) close();
  }, [isMobileLayout, isOpen, close]);

  return (
    <div
      className={[
        secondColumnNav ? "appShell appShell--expo" : "appShell",
        isOpen ? "appShell--navDrawerOpen" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <MobileHeader />
      <div
        id="app-sidebar"
        className={[
          "appSidebarZone",
          secondColumnNav ? "" : "appSidebarZone--soloMain",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={isMobileLayout && !isOpen}
        inert={isMobileLayout && !isOpen ? true : undefined}
      >
        <MainNav />
        {showExpoSub && !isMobileLayout ? <ExpositionsSubnav /> : null}
        {showInvSub && !isMobileLayout ? <InvestigacionSubnav /> : null}
        {showTalleresSub && !isMobileLayout ? <TalleresSubnav /> : null}
      </div>
      <button
        type="button"
        className="navDrawerScrim"
        aria-label="Cerrar menú"
        tabIndex={isOpen ? 0 : -1}
        onClick={close}
      />
      <main
        className={[
          "appMain",
          isTienda ? "appMain--tienda" : "",
          isAcerca ? "appMain--acerca" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={isMobileLayout && isOpen}
      >
        {showExpoSub ? <ExpoSubHoverPreview /> : null}
        {showInvSub ? <InvestigacionSubHoverPreview /> : null}
        {showTalleresSub ? <TalleresSubHoverPreview /> : null}
        {showMainNavHoverPreview ? <MainNavHoverPreview /> : null}
        <RouteTransition transitionKey={routeTransitionKey}>
          <Outlet />
        </RouteTransition>
        {isTienda ? (
          <>
            <TiendaCartConfirmPopup />
            <TiendaCartDrawer />
          </>
        ) : null}
      </main>
      <InactivityStickers />
    </div>
  );
}

export function AppLayout() {
  return (
    <MainNavHoverProvider>
      <ExpoSubHoverProvider>
        <InvestigacionSubHoverProvider>
          <TalleresSubHoverProvider>
            <MobileNavProvider>
              <AppLayoutChrome />
            </MobileNavProvider>
          </TalleresSubHoverProvider>
        </InvestigacionSubHoverProvider>
      </ExpoSubHoverProvider>
    </MainNavHoverProvider>
  );
}
