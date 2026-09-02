import sticker01 from "../assets/stickers/sticker-01.png";
import sticker02 from "../assets/stickers/sticker-02.png";
import sticker03 from "../assets/stickers/sticker-03.png";
import sticker04 from "../assets/stickers/sticker-04.png";

export const INACTIVITY_STICKER_SRCS = [
  sticker01,
  sticker02,
  sticker03,
  sticker04,
] as const;

/** Wait before the first sticker appears. */
export const INACTIVITY_THRESHOLD_MS = 3 * 60 * 1000;

/** Interval between stickers once inactivity mode is active. */
export const INACTIVITY_STICKER_INTERVAL_MS = 2_800;

export type PlacedInactivitySticker = {
  id: string;
  src: string;
  left: number;
  top: number;
  size: number;
  rotation: number;
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function stickerSizeForViewport(): number {
  const vw = window.innerWidth;
  return Math.round(Math.min(168, Math.max(84, vw * 0.11)));
}

export function maxInactivityStickers(): number {
  const size = stickerSizeForViewport();
  const cols = Math.ceil(window.innerWidth / (size * 0.72));
  const rows = Math.ceil(window.innerHeight / (size * 0.72));
  return cols * rows;
}

export function createPlacedInactivitySticker(): PlacedInactivitySticker {
  const size = stickerSizeForViewport();
  const margin = size * 0.08;
  const maxLeft = Math.max(margin, window.innerWidth - size - margin);
  const maxTop = Math.max(margin, window.innerHeight - size - margin);
  const src =
    INACTIVITY_STICKER_SRCS[
      Math.floor(Math.random() * INACTIVITY_STICKER_SRCS.length)
    ]!;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    src,
    left: randomBetween(margin, maxLeft),
    top: randomBetween(margin, maxTop),
    size,
    rotation: randomBetween(-22, 22),
  };
}
