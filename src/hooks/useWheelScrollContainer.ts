import { useEffect, useRef } from "react";

const DRAG_THRESHOLD_PX = 4;

function canScrollX(el: HTMLElement): boolean {
  return el.scrollWidth > el.clientWidth + 1;
}

function canScrollY(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight + 1;
}

/**
 * Wheel / trackpad + pointer-drag scrolling for tienda gallery strips.
 * Desktop: vertical wheel maps to horizontal scroll; drag moves horizontally.
 */
export function useWheelScrollContainer<
  T extends HTMLElement = HTMLDivElement,
>() {
  const ref = useRef<T>(null);
  const dragState = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

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

    const endDrag = () => {
      const state = dragState.current;
      if (!state.active) return;
      state.active = false;
      el.classList.remove("tiendaPage__scroll--dragging");
      if (state.pointerId >= 0) {
        try {
          el.releasePointerCapture(state.pointerId);
        } catch {
          /* already released */
        }
      }
      state.pointerId = -1;
    };

    const beginDrag = (state: typeof dragState.current, pointerId: number) => {
      state.moved = true;
      el.classList.add("tiendaPage__scroll--dragging");
      el.setPointerCapture(pointerId);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const scrollX = canScrollX(el);
      const scrollY = canScrollY(el);
      if (!scrollX && !scrollY) return;

      const state = dragState.current;
      state.active = true;
      state.moved = false;
      state.pointerId = e.pointerId;
      state.startX = e.clientX;
      state.startY = e.clientY;
      state.scrollLeft = el.scrollLeft;
      state.scrollTop = el.scrollTop;
    };

    const onPointerMove = (e: PointerEvent) => {
      const state = dragState.current;
      if (!state.active || e.pointerId !== state.pointerId) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      const scrollX = canScrollX(el);
      const scrollY = canScrollY(el);

      if (
        !state.moved &&
        Math.hypot(dx, dy) < DRAG_THRESHOLD_PX
      ) {
        return;
      }

      if (!state.moved) {
        beginDrag(state, e.pointerId);
      }

      if (scrollX) {
        el.scrollLeft = state.scrollLeft - dx;
      }
      if (scrollY) {
        el.scrollTop = state.scrollTop - dy;
      }

      e.preventDefault();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== dragState.current.pointerId) return;
      endDrag();
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!dragState.current.moved) return;
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = false;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("click", onClickCapture, true);
      el.classList.remove("tiendaPage__scroll--dragging");
    };
  }, []);

  return ref;
}
