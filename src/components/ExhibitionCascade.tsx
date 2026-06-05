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

function lastCascadeImageUrl(blocks: GalleryCascadeBlock[]): string | null {
  const last = blocks.at(-1);
  if (!last) return null;
  return last.type === "full" ? last.src : last.right;
}

function CascadeRevealRow({
  children,
  revealOnMount = false,
}: {
  children: ReactNode;
  revealOnMount?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(revealOnMount);

  useEffect(() => {
    if (revealOnMount) {
      setVisible(true);
      return;
    }
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
  }, [revealOnMount]);

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
  lastImageUrl,
}: {
  left: string;
  right: string;
  slideshow: string[];
  onOpenLightbox: (slideIndex: number) => void;
  priority?: boolean;
  lastImageUrl: string | null;
}) {
  const [leftLandscape, setLeftLandscape] = useState(false);
  const [rightLandscape, setRightLandscape] = useState(false);
  const [leftPortrait, setLeftPortrait] = useState(false);
  const [rightPortrait, setRightPortrait] = useState(false);

  const onLeftIntrinsic = useCallback((w: number, h: number) => {
    setLeftLandscape(w > h);
    setLeftPortrait(h > w);
  }, []);
  const onRightIntrinsic = useCallback((w: number, h: number) => {
    setRightLandscape(w > h);
    setRightPortrait(h > w);
  }, []);

  useEffect(() => {
    setLeftLandscape(false);
    setRightLandscape(false);
    setLeftPortrait(false);
    setRightPortrait(false);
  }, [left, right]);

  const leftIsLast = lastImageUrl !== null && left === lastImageUrl;
  const rightIsLast = lastImageUrl !== null && right === lastImageUrl;
  const leftWide = leftLandscape || (leftIsLast && leftPortrait);
  const rightWide = rightLandscape || (rightIsLast && rightPortrait);

  return (
    <div className="exhibitionCascade__pair">
      <button
        type="button"
        className={[
          "exhibitionCascade__hit",
          leftWide ? "exhibitionCascade__hit--wide" : "",
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
          framePortrait={!(leftIsLast && leftPortrait)}
          onIntrinsicDimensions={onLeftIntrinsic}
        />
      </button>
      <button
        type="button"
        className={[
          "exhibitionCascade__hit",
          rightWide ? "exhibitionCascade__hit--wide" : "",
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
          framePortrait={!(rightIsLast && rightPortrait)}
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
  isLast,
}: {
  src: string;
  slideshow: string[];
  onOpenLightbox: (slideIndex: number) => void;
  priority?: boolean;
  isLast: boolean;
}) {
  const [landscape, setLandscape] = useState(false);
  const [portrait, setPortrait] = useState(false);

  const onIntrinsicDimensions = useCallback((w: number, h: number) => {
    setLandscape(w > h);
    setPortrait(h > w);
  }, []);

  useEffect(() => {
    setLandscape(false);
    setPortrait(false);
  }, [src]);

  const spanFullColumn = landscape || (isLast && portrait);

  return (
    <button
      type="button"
      className={[
        "exhibitionCascade__hit",
        "exhibitionCascade__hit--full",
        spanFullColumn ? "exhibitionCascade__hit--wide" : "",
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
        framePortrait={!(isLast && portrait)}
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
  const lastImageUrl = lastCascadeImageUrl(blocks);

  return (
    <div className="exhibitionCascade">
      {blocks.map((block, i) => {
        const priorityFirstRow = i === 0;
        return (
          <CascadeRevealRow key={i} revealOnMount={priorityFirstRow}>
            {block.type === "pair" ? (
              <ExhibitionCascadePair
                left={block.left}
                right={block.right}
                slideshow={slideshow}
                onOpenLightbox={onOpenLightbox}
                priority={priorityFirstRow}
                lastImageUrl={lastImageUrl}
              />
            ) : (
              <ExhibitionCascadeFullHit
                src={block.src}
                slideshow={slideshow}
                onOpenLightbox={onOpenLightbox}
                priority={priorityFirstRow}
                isLast={block.src === lastImageUrl}
              />
            )}
          </CascadeRevealRow>
        );
      })}
    </div>
  );
}
