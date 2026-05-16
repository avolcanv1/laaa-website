import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NavHoverKey } from "../nav/navHoverPreviews";

type MainNavHoverContextValue = {
  hovered: NavHoverKey | null;
  setHovered: (key: NavHoverKey | null) => void;
};

const MainNavHoverContext = createContext<MainNavHoverContextValue | null>(
  null,
);

export function MainNavHoverProvider({ children }: { children: ReactNode }) {
  const [hovered, setHoveredState] = useState<NavHoverKey | null>(null);

  const setHovered = useCallback((key: NavHoverKey | null) => {
    setHoveredState(key);
  }, []);

  const value = useMemo(
    () => ({ hovered, setHovered }),
    [hovered, setHovered],
  );

  return (
    <MainNavHoverContext.Provider value={value}>
      {children}
    </MainNavHoverContext.Provider>
  );
}

export function useMainNavHover() {
  const ctx = useContext(MainNavHoverContext);
  if (!ctx) {
    throw new Error("useMainNavHover must be used within MainNavHoverProvider");
  }
  return ctx;
}
