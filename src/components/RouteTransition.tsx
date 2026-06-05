import { useEffect, useRef, useState, type ReactNode } from "react";

type RouteTransitionProps = {
  transitionKey: string;
  children: ReactNode;
};

/**
 * Fade/slide the main column when navigating between top-level sections.
 * Slug changes within the same section (e.g. exposiciones index ↔ ficha) reuse
 * the same key and are handled by {@link ProjectDetailEnter} instead.
 */
export function RouteTransition({ transitionKey, children }: RouteTransitionProps) {
  const isFirstMount = useRef(true);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      setActive(true);
      return;
    }

    setActive(false);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setActive(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [transitionKey]);

  useEffect(() => {
    if (isFirstMount.current) return;
    const main = document.querySelector<HTMLElement>(".appMain");
    if (main) main.scrollTop = 0;
  }, [transitionKey]);

  return (
    <div
      className={[
        "routeTransition",
        active ? "routeTransition--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
