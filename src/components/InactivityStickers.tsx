import { useInactivityStickers } from "../hooks/useInactivityStickers";

/**
 * After 3 minutes without interaction, stickers appear one by one until the
 * viewport fills. Any interaction clears them and resets the timer.
 */
export function InactivityStickers() {
  const stickers = useInactivityStickers();

  if (stickers.length === 0) return null;

  return (
    <div className="inactivityStickers" aria-hidden>
      {stickers.map((sticker) => (
        <img
          key={sticker.id}
          src={sticker.src}
          alt=""
          className="inactivityStickers__item"
          draggable={false}
          style={{
            left: `${sticker.left}px`,
            top: `${sticker.top}px`,
            width: `${sticker.size}px`,
            ["--sticker-rot" as string]: `${sticker.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
}
