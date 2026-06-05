import { useEffect, useState } from "react";

export const HOVER_FADE_MS = 550;

/**
 * Keeps content mounted while fading out, then unmounts after {@link HOVER_FADE_MS}.
 */
export function useHoverFade(active: boolean, durationMs = HOVER_FADE_MS) {
  const [mounted, setMounted] = useState(active);
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (active) {
      setMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), durationMs);
    return () => window.clearTimeout(timeout);
  }, [active, durationMs]);

  return { mounted, visible };
}
