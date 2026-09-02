import { useCallback, useEffect, useRef, useState } from "react";

import {
  INACTIVITY_STICKER_INTERVAL_MS,
  INACTIVITY_THRESHOLD_MS,
  createPlacedInactivitySticker,
  maxInactivityStickers,
  type PlacedInactivitySticker,
} from "../lib/inactivityStickers";

const ACTIVITY_THROTTLE_MS = 400;

function isReducedMotionPreferred(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useInactivityStickers(): PlacedInactivitySticker[] {
  const [stickers, setStickers] = useState<PlacedInactivitySticker[]>([]);
  const activeRef = useRef(false);
  const lastActivityRef = useRef(Date.now());
  const lastBumpRef = useRef(0);
  const stickerIntervalRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  const clearStickerInterval = useCallback(() => {
    if (stickerIntervalRef.current !== null) {
      window.clearInterval(stickerIntervalRef.current);
      stickerIntervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    activeRef.current = false;
    clearStickerInterval();
    setStickers([]);
    lastActivityRef.current = Date.now();
  }, [clearStickerInterval]);

  const addSticker = useCallback(() => {
    setStickers((prev) => {
      const cap = maxInactivityStickers();
      if (prev.length >= cap) return prev;
      return [...prev, createPlacedInactivitySticker()];
    });
  }, []);

  const startStickerLoop = useCallback(() => {
    clearStickerInterval();
    addSticker();
    stickerIntervalRef.current = window.setInterval(
      addSticker,
      INACTIVITY_STICKER_INTERVAL_MS,
    );
  }, [addSticker, clearStickerInterval]);

  const bumpActivity = useCallback(
    (immediate = false) => {
      const now = Date.now();
      if (!immediate && now - lastBumpRef.current < ACTIVITY_THROTTLE_MS) {
        return;
      }
      lastBumpRef.current = now;

      if (activeRef.current) {
        reset();
        return;
      }

      lastActivityRef.current = now;
    },
    [reset],
  );

  useEffect(() => {
    if (isReducedMotionPreferred()) return;

    const onImmediateActivity = () => bumpActivity(true);
    const onThrottledActivity = () => bumpActivity(false);

    const immediateEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "touchstart",
    ];
    const throttledEvents: Array<keyof WindowEventMap> = [
      "pointermove",
      "wheel",
      "scroll",
    ];

    for (const event of immediateEvents) {
      window.addEventListener(event, onImmediateActivity, { passive: true });
    }
    for (const event of throttledEvents) {
      window.addEventListener(event, onThrottledActivity, { passive: true });
    }

    pollIntervalRef.current = window.setInterval(() => {
      if (activeRef.current) return;
      if (Date.now() - lastActivityRef.current < INACTIVITY_THRESHOLD_MS) return;
      activeRef.current = true;
      startStickerLoop();
    }, 1_000);

    return () => {
      for (const event of immediateEvents) {
        window.removeEventListener(event, onImmediateActivity);
      }
      for (const event of throttledEvents) {
        window.removeEventListener(event, onThrottledActivity);
      }
      if (pollIntervalRef.current !== null) {
        window.clearInterval(pollIntervalRef.current);
      }
      clearStickerInterval();
    };
  }, [bumpActivity, clearStickerInterval, startStickerLoop]);

  return stickers;
}
