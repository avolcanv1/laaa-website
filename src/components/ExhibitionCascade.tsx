import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { GalleryCascadeBlock } from "../data/exhibitionContent";
import { CascadeArchivalMedia } from "./CascadeArchivalMedia";

type ExhibitionCascadeProps = {
  blocks: GalleryCascadeBlock[];
  slideshow: string[];
  onOpenLightbox: (slideIndex: number) => void;
};

function indexInSlideshow(slideshow: string[], url: string) {
  const i = slideshow.indexOf(url);
  return i === -1 ? 0 : i;
}

function CascadeRevealRow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setVisible(true);
      return;
    }
    const scrollRoot = el.closest(".appMain");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      {
        root: scrollRoot instanceof HTMLElement ? scrollRoot : null,
        rootMargin: "0px 0px 14% 0px",
        threshold: 0,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "exhibitionCascade__row",
        visible ? "exhibitionCascade__row--visible" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function ExhibitionCascadePair({
  left,
  right,
  slideshow,
  onOpenLightbox,
  priority,
}: {
  left: string;
  right: string;
  slideshow: string[];
  onOpenLightbox: (slideIndex: number) => void;
  priority?: boolean;
}) {
  const [leftLandscape, setLeftLandscape] = useState(false);
  const [rightLandscape, setRightLandscape] = useState(false);

  const onLeftIntrinsic = useCallback((w: number, h: number) => {
    setLeftLandscape(w > h);
  }, []);
  const onRightIntrinsic = useCallback((w: number, h: number) => {
    setRightLandscape(w > h);
  }, []);

  useEffect(() => {
    setLeftLandscape(false);
    setRightLandscape(false);
  }, [left, right]);

  return (
    <div className="exhibitionCascade__pair">
      <button
        type="button"
        className={[
          "exhibitionCascade__hit",
          leftLandscape ? "exhibitionCascade__hit--wide" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onOpenLightbox(indexInSlideshow(slideshow, left))}
        aria-label="Abrir imagen en galería"
      >
        <CascadeArchivalMedia
          src={left}
          className="exhibitionCascade__cell"
          priority={priority}
          onIntrinsicDimensions={onLeftIntrinsic}
        />
      </button>
      <button
        type="button"
        className={[
          "exhibitionCascade__hit",
          rightLandscape ? "exhibitionCascade__hit--wide" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onOpenLightbox(indexInSlideshow(slideshow, right))}
        aria-label="Abrir imagen en galería"
      >
        <CascadeArchivalMedia
          src={right}
          className="exhibitionCascade__cell"
          priority={priority}
          onIntrinsicDimensions={onRightIntrinsic}
        />
      </button>
    </div>
  );
}

function ExhibitionCascadeFullHit({
  src,
  slideshow,
  onOpenLightbox,
  priority,
}: {
  src: string;
  slideshow: string[];
  onOpenLightbox: (slideIndex: number) => void;
  priority?: boolean;
}) {
  const [landscape, setLandscape] = useState(false);

  const onIntrinsicDimensions = useCallback((w: number, h: number) => {
    setLandscape(w > h);
  }, []);

  useEffect(() => {
    setLandscape(false);
  }, [src]);

  return (
    <button
      type="button"
      className={[
        "exhibitionCascade__hit",
        "exhibitionCascade__hit--full",
        landscape ? "exhibitionCascade__hit--wide" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onOpenLightbox(indexInSlideshow(slideshow, src))}
      aria-label="Abrir imagen en galería"
    >
      <CascadeArchivalMedia
        src={src}
        className="exhibitionCascade__full"
        priority={priority}
        onIntrinsicDimensions={onIntrinsicDimensions}
      />
    </button>
  );
}

export function ExhibitionCascade({
  blocks,
  slideshow,
  onOpenLightbox,
}: ExhibitionCascadeProps) {
  return (
    <div className="exhibitionCascade">
      {blocks.map((block, i) => {
        const priorityFirstRow = i === 0;
        return (
          <CascadeRevealRow key={i}>
            {block.type === "pair" ? (
              <ExhibitionCascadePair
                left={block.left}
                right={block.right}
                slideshow={slideshow}
                onOpenLightbox={onOpenLightbox}
                priority={priorityFirstRow}
              />
            ) : (
              <ExhibitionCascadeFullHit
                src={block.src}
                slideshow={slideshow}
                onOpenLightbox={onOpenLightbox}
                priority={priorityFirstRow}
              />
            )}
          </CascadeRevealRow>
        );
      })}
    </div>
  );
}
