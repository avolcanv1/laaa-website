import { useEffect, useState, type ReactNode } from "react";

type ProjectDetailEnterProps = {
  slugKey: string;
  children: ReactNode;
};

/**
 * Staggered fade/slide when a ficha mounts or the slug changes.
 */
export function ProjectDetailEnter({ slugKey, children }: ProjectDetailEnterProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(false);
    const id = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(id);
  }, [slugKey]);

  return (
    <div
      className={`projectDetailEnter${active ? " projectDetailEnter--active" : ""}`.trim()}
    >
      {children}
    </div>
  );
}
