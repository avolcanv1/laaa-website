import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";

type ProjectDetailEnterProps = {
  slugKey: string;
  /** When true (e.g. click from subnav hover), hero is already visible — skip fade-in. */
  skipEnter?: boolean;
  children: ReactNode;
};

/**
 * Staggered fade/slide when a ficha mounts or the slug changes.
 * Parent must pass `key={slugKey}` to remount per project and avoid stale media.
 */
export function ProjectDetailEnter({
  slugKey,
  skipEnter = false,
  children,
}: ProjectDetailEnterProps) {
  const [active, setActive] = useState(false);

  useLayoutEffect(() => {
    if (skipEnter) {
      setActive(true);
      return;
    }
    setActive(false);
  }, [slugKey, skipEnter]);

  useEffect(() => {
    if (skipEnter) return;

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setActive(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [slugKey, skipEnter]);

  return (
    <div
      className={[
        "projectDetailEnter",
        active ? "projectDetailEnter--active" : "",
        skipEnter ? "projectDetailEnter--skipEnter" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
