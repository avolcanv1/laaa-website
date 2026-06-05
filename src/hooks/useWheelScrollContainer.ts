import { useEffect, useRef } from "react";

function canScrollX(el: HTMLElement): boolean {
  return el.scrollWidth > el.clientWidth + 1;
}

function canScrollY(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight + 1;
}

/**
 * Maps wheel / trackpad gestures to the scrollable axis of a container.
 * Desktop tienda strip (horizontal-only): vertical wheel scrolls horizontally.
 */
export function useWheelScrollContainer<
  T extends HTMLElement = HTMLDivElement,
>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const scrollX = canScrollX(el);
      const scrollY = canScrollY(el);
      if (!scrollX && !scrollY) return;

      const { deltaX, deltaY } = e;

      if (scrollX && !scrollY) {
        const delta =
          Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
        if (delta === 0) return;

        const atStart = el.scrollLeft <= 0;
        const atEnd =
          el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
        if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;

        el.scrollLeft += delta;
        e.preventDefault();
        return;
      }

      if (scrollY && !scrollX) {
        if (deltaX === 0) return;

        const atTop = el.scrollTop <= 0;
        const atBottom =
          el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        if ((deltaX < 0 && atTop) || (deltaX > 0 && atBottom)) return;

        el.scrollTop += deltaX;
        e.preventDefault();
        return;
      }

      if (scrollX && scrollY) {
        let handled = false;

        if (deltaX !== 0) {
          const atStart = el.scrollLeft <= 0;
          const atEnd =
            el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
          if (!((deltaX < 0 && atStart) || (deltaX > 0 && atEnd))) {
            el.scrollLeft += deltaX;
            handled = true;
          }
        }

        if (deltaY !== 0) {
          const atTop = el.scrollTop <= 0;
          const atBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
          if (!((deltaY < 0 && atTop) || (deltaY > 0 && atBottom))) {
            el.scrollTop += deltaY;
            handled = true;
          }
        }

        if (handled) e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return ref;
}
