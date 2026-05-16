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

type TalleresSubHoverContextValue = {
  hoveredSlug: string | null;
  setHoveredSlug: (slug: string | null) => void;
};

const TalleresSubHoverContext = createContext<TalleresSubHoverContextValue | null>(
  null,
);

export function TalleresSubHoverProvider({ children }: { children: ReactNode }) {
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
    <TalleresSubHoverContext.Provider value={value}>
      {children}
    </TalleresSubHoverContext.Provider>
  );
}

export function useTalleresSubHover() {
  const ctx = useContext(TalleresSubHoverContext);
  if (!ctx) {
    throw new Error(
      "useTalleresSubHover must be used within TalleresSubHoverProvider",
    );
  }
  return ctx;
}
