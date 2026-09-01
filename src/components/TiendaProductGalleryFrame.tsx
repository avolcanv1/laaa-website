import type { MouseEvent, ReactNode } from "react";

type TiendaProductGalleryFrameProps = {
  children: ReactNode;
};

export function TiendaProductGalleryFrame({
  children,
}: TiendaProductGalleryFrameProps) {
  const setZoomPan = (event: MouseEvent<HTMLDivElement>) => {
    const frame = event.currentTarget;
    const rect = frame.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    frame.style.setProperty("--pan-x", `${(0.5 - x) * 100}%`);
    frame.style.setProperty("--pan-y", `${(0.5 - y) * 100}%`);
  };

  const resetZoomPan = (event: MouseEvent<HTMLDivElement>) => {
    const frame = event.currentTarget;
    frame.style.removeProperty("--pan-x");
    frame.style.removeProperty("--pan-y");
  };

  return (
    <div
      className="tiendaProduct__galleryFrame"
      onMouseMove={setZoomPan}
      onMouseLeave={resetZoomPan}
    >
      {children}
    </div>
  );
}
