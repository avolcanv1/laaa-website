import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

type ExpoSubHoverContextValue = {
  hoveredSlug: string | null;
  setHoveredSlug: (slug: string | null) => void;
};

const ExpoSubHoverContext = createContext<ExpoSubHoverContextValue | null>(
  null,
);

export function ExpoSubHoverProvider({ children }: { children: ReactNode }) {
  const [hoveredSlug, setHoveredSlugState] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setHoveredSlugState(null);
  }, [pathname]);

  const setHoveredSlug = useCallback((slug: string | null) => {
    setHoveredSlugState(slug);
  }, []);

  const value = useMemo(
    () => ({ hoveredSlug, setHoveredSlug }),
    [hoveredSlug, setHoveredSlug],
  );

  return (
    <ExpoSubHoverContext.Provider value={value}>
      {children}
    </ExpoSubHoverContext.Provider>
  );
}

export function useExpoSubHover() {
  const ctx = useContext(ExpoSubHoverContext);
  if (!ctx) {
    throw new Error("useExpoSubHover must be used within ExpoSubHoverProvider");
  }
  return ctx;
}
