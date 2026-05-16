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

type InvestigacionSubHoverContextValue = {
  hoveredSlug: string | null;
  setHoveredSlug: (slug: string | null) => void;
};

const InvestigacionSubHoverContext =
  createContext<InvestigacionSubHoverContextValue | null>(null);

export function InvestigacionSubHoverProvider({
  children,
}: {
  children: ReactNode;
}) {
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
    <InvestigacionSubHoverContext.Provider value={value}>
      {children}
    </InvestigacionSubHoverContext.Provider>
  );
}

export function useInvestigacionSubHover() {
  const ctx = useContext(InvestigacionSubHoverContext);
  if (!ctx) {
    throw new Error(
      "useInvestigacionSubHover must be used within InvestigacionSubHoverProvider",
    );
  }
  return ctx;
}
