import { useSyncExternalStore } from "react";

/** Match `layout.css` @media (max-width: 1200px) — drawer + mobile header + mosaic. */
const MOBILE_NAV_MQ = "(max-width: 1200px)";

export function useMobileLayoutMax1200(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(MOBILE_NAV_MQ);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(MOBILE_NAV_MQ).matches,
    () => false,
  );
}
