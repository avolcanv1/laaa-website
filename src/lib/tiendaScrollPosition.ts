const SCROLL_KEY = "laaa:tienda-scroll";
const RESTORE_KEY = "laaa:tienda-restore";

export type TiendaScrollPosition = {
  left: number;
  top: number;
};

export function saveTiendaScroll(el: HTMLElement): void {
  const position: TiendaScrollPosition = {
    left: el.scrollLeft,
    top: el.scrollTop,
  };
  sessionStorage.setItem(SCROLL_KEY, JSON.stringify(position));
}

function readTiendaScroll(): TiendaScrollPosition | null {
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TiendaScrollPosition;
    if (typeof parsed.left !== "number" || typeof parsed.top !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function markTiendaScrollRestore(): void {
  sessionStorage.setItem(RESTORE_KEY, "1");
}

export function clearTiendaScrollRestore(): void {
  sessionStorage.removeItem(RESTORE_KEY);
  sessionStorage.removeItem(SCROLL_KEY);
}

export function consumeTiendaScrollRestore(): boolean {
  const restore = sessionStorage.getItem(RESTORE_KEY) === "1";
  sessionStorage.removeItem(RESTORE_KEY);
  return restore;
}

export function restoreTiendaScroll(el: HTMLElement): void {
  const position = readTiendaScroll();
  if (!position) return;
  el.scrollLeft = position.left;
  el.scrollTop = position.top;
}

export function rememberTiendaScrollBeforeProduct(el: HTMLElement | null): void {
  if (!el) return;
  saveTiendaScroll(el);
  markTiendaScrollRestore();
}
