import { useCallback, useEffect, useRef, useState } from "react";

type ArchivalMediaProps = {
  src: string;
  alt?: string;
  className?: string;
  /** e.g. "544 / 737" */
  aspectRatio?: string;
  objectFit?: "cover" | "contain";
  /** `archival` = olive / grain (hover & previews); `natural` = full color on ficha */
  treatment?: "archival" | "natural";
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  /** After decode; use instead of a second `Image()` fetch for layout/orientation */
  onIntrinsicDimensions?: (naturalWidth: number, naturalHeight: number) => void;
};

/**
 * Archival look: grayscale image (`saturate(0)`), fill `var(--color-archival-wash)` (#82781B) with
 * `mix-blend-mode: screen`, plus SVG grain (`#archivalGrainFilter` in index.html).
 */
export function ArchivalMedia({
  src,
  alt = "",
  className = "",
  aspectRatio,
  objectFit = "cover",
  treatment = "archival",
  loading = "lazy",
  fetchPriority,
  onIntrinsicDimensions,
}: ArchivalMediaProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageReady, setImageReady] = useState(false);
  const ratioClass = aspectRatio ? " archivalMedia--ratio" : "";
  const naturalClass = treatment === "natural" ? " archivalMedia--natural" : "";
  const loadedClass =
    treatment === "natural" || imageReady ? " archivalMedia--imageLoaded" : "";

  const syncFromImg = useCallback(() => {
    const img = imgRef.current;
    if (!img || img.naturalWidth <= 0) return;
    if (treatment !== "natural") setImageReady(true);
    onIntrinsicDimensions?.(img.naturalWidth, img.naturalHeight);
  }, [treatment, onIntrinsicDimensions]);

  useEffect(() => {
    setImageReady(false);
  }, [src]);

  useEffect(() => {
    syncFromImg();
    const id = requestAnimationFrame(() => syncFromImg());
    return () => cancelAnimationFrame(id);
  }, [src, syncFromImg]);

  return (
    <div
      className={`archivalMedia${ratioClass}${naturalClass}${loadedClass} ${className}`.trim()}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="archivalMedia__img"
        style={aspectRatio ? { objectFit } : undefined}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        onLoad={syncFromImg}
      />
      <div className="archivalMedia__mat" aria-hidden />
      {treatment === "archival" ? (
        <>
          <div className="archivalMedia__wash" aria-hidden />
          <div className="archivalMedia__grain" aria-hidden>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              className="archivalMedia__grainSvg"
            >
              <rect
                width="100%"
                height="100%"
                filter="url(#archivalGrainFilter)"
                fill="#808080"
                opacity="1"
              />
            </svg>
          </div>
        </>
      ) : null}
    </div>
  );
}
