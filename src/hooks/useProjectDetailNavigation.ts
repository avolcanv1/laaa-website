import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import {
  getRouteTransitionKey,
  peekRouteSectionChange,
} from "../lib/routeTransitionKey";

/**
 * Scroll main column to top on slug change and skip enter animation when the
 * subnav hover preview already shows this project, or when the page-level
 * route transition is handling the enter (cross-section navigation).
 */
export function useProjectDetailNavigation(
  slug: string,
  hoveredSlug: string | null,
): { skipEnter: boolean } {
  const { pathname } = useLocation();
  const routeKey = getRouteTransitionKey(pathname);
  const skipFromRouteRef = useRef<boolean | null>(null);

  if (skipFromRouteRef.current === null) {
    skipFromRouteRef.current = peekRouteSectionChange(routeKey);
  }

  useEffect(() => {
    skipFromRouteRef.current = null;
  }, [slug]);

  const skipEnter =
    Boolean(slug && hoveredSlug === slug) ||
    Boolean(skipFromRouteRef.current);

  useEffect(() => {
    if (!slug) return;
    const main = document.querySelector<HTMLElement>(".appMain");
    if (main) main.scrollTop = 0;
  }, [slug]);

  return { skipEnter };
}
