import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

function IconClose() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      aria-hidden
    >
      <path
        d="M38.1192 12.8105L25.9606 24.9691L37.8414 36.8499L36.7978 37.8936L24.917 26.0128L12.8106 38.1192L11.8808 37.1894L23.9872 25.083L12.1064 13.2022L13.1501 12.1585L25.0308 24.0393L37.1894 11.8807L38.1192 12.8105Z"
        fill="black"
      />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      aria-hidden
    >
      <path
        d="M30.7773 11.2119L44.0654 24.5H4.02051V25.5H44.0654L30.7773 38.7891L31.4844 39.4961L45.9805 25L31.4844 10.5039L30.7773 11.2119Z"
        fill="black"
      />
    </svg>
  );
}

type GalleryLightboxProps = {
  images: string[];
  index: number;
  onClose: () => void;
  onGoTo: (index: number) => void;
};

/**
 * Full-screen gallery overlay — [Figma Galería / Copias](https://www.figma.com/design/VYTIexbznmMIeDTVgOgaK3/LAAA-%7C-Web?node-id=40-1468&m=dev)
 */
export function GalleryLightbox({
  images,
  index,
  onClose,
  onGoTo,
}: GalleryLightboxProps) {
  const n = images.length;
  const safe = n === 0 ? 0 : ((index % n) + n) % n;

  const go = useCallback(
    (delta: number) => {
      if (n === 0) return;
      onGoTo((safe + delta + n) % n);
    },
    [n, onGoTo, safe],
  );

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  if (n === 0) return null;

  return createPortal(
    <div
      className="galleryLightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Galería de imágenes"
    >
      <p className="galleryLightbox__counter" aria-live="polite">
        ( {safe + 1} / {n} )
      </p>
      <button
        type="button"
        className="galleryLightbox__close"
        onClick={onClose}
        aria-label="Cerrar galería"
      >
        <IconClose />
      </button>
      <button
        type="button"
        className="galleryLightbox__prev"
        onClick={() => go(-1)}
        aria-label="Imagen anterior"
      >
        <span className="galleryLightbox__arrowMirror">
          <IconArrow />
        </span>
      </button>
      <button
        type="button"
        className="galleryLightbox__next"
        onClick={() => go(1)}
        aria-label="Imagen siguiente"
      >
        <IconArrow />
      </button>
      <div className="galleryLightbox__frame">
        <div className="galleryLightbox__media">
          <img
            src={images[safe]}
            alt=""
            className="galleryLightbox__img"
            decoding="async"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
