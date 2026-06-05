/**
 * Groups routes that share the same main-column "slot" so slug changes within a
 * section (index ↔ ficha) do not re-trigger the page-level transition.
 */
export function getRouteTransitionKey(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/exposiciones")) return "exposiciones";
  if (pathname.startsWith("/investigacion")) return "investigacion";
  if (pathname.startsWith("/talleres")) return "talleres";
  if (pathname.startsWith("/tienda")) return "tienda";
  if (pathname.startsWith("/acerca")) return "acerca";
  return pathname;
}

let committedRouteKey: string | null = null;

/** True when navigating into a new top-level section (before the key is committed). */
export function peekRouteSectionChange(currentKey: string): boolean {
  return committedRouteKey !== null && committedRouteKey !== currentKey;
}

export function commitRouteSectionKey(currentKey: string): void {
  committedRouteKey = currentKey;
}
