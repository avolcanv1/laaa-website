import { useCallback, useEffect, useState } from "react";
import { ArchivalMedia } from "./ArchivalMedia";

type CascadeArchivalMediaProps = {
  src: string;
  className?: string;
  /** First visible cascade row: starts fetch early with the hero */
  priority?: boolean;
  /** When true (default), portrait images use a fixed 3∶4 frame with `object-fit: cover`. */
  framePortrait?: boolean;
  /** Orientation/layout without a second `Image()` request */
  onIntrinsicDimensions?: (naturalWidth: number, naturalHeight: number) => void;
};

type IntrinsicShape = "portrait" | "landscape" | "square" | null;

function classifyShape(w: number, h: number): IntrinsicShape {
  if (w <= 0 || h <= 0) return null;
  if (w === h) return "square";
  if (h > w) return "portrait";
  return "landscape";
}

/**
 * Cascade / ficha: landscape and square keep intrinsic proportions (width 100%, height auto).
 * Portrait uses a fixed **3∶4** frame with `object-fit: cover`, unless `framePortrait` is false.
 */
export function CascadeArchivalMedia({
  src,
  className = "",
  priority = false,
  framePortrait = true,
  onIntrinsicDimensions,
}: CascadeArchivalMediaProps) {
  const [shape, setShape] = useState<IntrinsicShape>(null);

  useEffect(() => {
    setShape(null);
  }, [src]);

  const handleIntrinsicDimensions = useCallback(
    (w: number, h: number) => {
      setShape(classifyShape(w, h));
      onIntrinsicDimensions?.(w, h);
    },
    [onIntrinsicDimensions],
  );

  const portraitFrame = shape === "portrait" && framePortrait;

  return (
    <ArchivalMedia
      key={src}
      src={src}
      alt=""
      className={className}
      treatment="natural"
      aspectRatio={portraitFrame ? "3 / 4" : undefined}
      objectFit={portraitFrame ? "cover" : undefined}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      onIntrinsicDimensions={handleIntrinsicDimensions}
    />
  );
}
