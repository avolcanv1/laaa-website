import type { SectionLabelKey } from "../nav/sectionLabels";
import { SECTION_PATHS } from "../nav/sectionLabels";

/**
 * Orden importante: las rutas más específicas van primero, para que un
 * prefijo corto no se coma a uno largo.
 */
const SECTION_KEYS: SectionLabelKey[] = [
  "exposiciones",
  "investigacion",
  "talleres",
  "tienda",
  "acerca",
];

/**
 * Groups routes that share the same main-column "slot" so slug changes within a
 * section (index ↔ ficha) do not re-trigger the page-level transition.
 */
export function getRouteTransitionKey(pathname: string): string {
  if (pathname === "/") return "home";
  for (const key of SECTION_KEYS) {
    if (pathname.startsWith(SECTION_PATHS[key])) return key;
  }
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
