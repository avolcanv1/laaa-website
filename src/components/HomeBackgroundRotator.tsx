import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArchivalMedia } from "./ArchivalMedia";
import { useMainNavHover } from "../context/MainNavHoverContext";
import { useMobileLayoutMax1200 } from "../hooks/useMobileLayoutMax1200";
import { useSanityAllProjectImageUrls } from "../hooks/useSanityProjects";
import {
  probeImageOrientations,
  urlMatchesBreakpointOrientation,
} from "../lib/imageOrientationProbe";

const ROTATE_MS = 5000;

function pickRandom(urls: string[], exclude?: string): string {
  if (urls.length === 0) return "";
  if (urls.length === 1) return urls[0]!;
  const candidates = exclude
    ? urls.filter((u) => u !== exclude)
    : urls;
  const list = candidates.length > 0 ? candidates : urls;
  return list[Math.floor(Math.random() * list.length)]!;
}

export function HomeBackgroundRotator() {
  const { pathname } = useLocation();
  const { hovered } = useMainNavHover();
  const urlFetchState = useSanityAllProjectImageUrls();
  const allUrls =
    urlFetchState.status === "success" ? urlFetchState.data : [];
  const isMobile = useMobileLayoutMax1200();
  const reduceMotion = useReducedMotionPreference();

  /** Desktop: hide ambient rotator while a main-nav row is hovered (nav preview / focus). */
  const hideForNavHover =
    pathname === "/" && !isMobile && hovered !== null;

  const [typedPools, setTypedPools] = useState<{
    landscape: string[];
    portrait: string[];
  } | null>(null);

  useEffect(() => {
    if (allUrls.length === 0) return;
    let cancelled = false;
    probeImageOrientations(allUrls).then((ors) => {
      if (cancelled) return;
      const landscape: string[] = [];
      const portrait: string[] = [];
      allUrls.forEach((u, i) => {
        const o = ors[i] ?? null;
        if (urlMatchesBreakpointOrientation(o, false)) landscape.push(u);
        if (urlMatchesBreakpointOrientation(o, true)) portrait.push(u);
      });
      setTypedPools({ landscape, portrait });
    });
    return () => {
      cancelled = true;
    };
  }, [allUrls]);

  const pool = useMemo(() => {
    if (allUrls.length === 0) return [];
    if (!typedPools) return allUrls;
    const oriented = isMobile ? typedPools.portrait : typedPools.landscape;
    return oriented.length > 0 ? oriented : allUrls;
  }, [allUrls, typedPools, isMobile]);

  const poolKey = useMemo(() => pool.join("\0"), [pool]);

  const [srcA, setSrcA] = useState(() => pool[0] ?? "");
  const [srcB, setSrcB] = useState(() =>
    pool.length > 1 ? pool[1]! : pool[0] ?? "",
  );
  const [activeIsA, setActiveIsA] = useState(true);

  const srcARef = useRef(srcA);
  const srcBRef = useRef(srcB);
  srcARef.current = srcA;
  srcBRef.current = srcB;

  useEffect(() => {
    if (pool.length === 0) return;
    setSrcA(pool[0] ?? "");
    setSrcB(pool.length > 1 ? pool[1]! : pool[0] ?? "");
    setActiveIsA(true);
    srcARef.current = pool[0] ?? "";
    srcBRef.current = pool.length > 1 ? pool[1]! : pool[0] ?? "";
  }, [poolKey, pool]);

  useEffect(() => {
    if (pool.length === 0 || reduceMotion) return;

    const id = window.setInterval(() => {
      setActiveIsA((wasA) => {
        const cur = wasA ? srcARef.current : srcBRef.current;
        const next = pickRandom(pool, cur);
        if (wasA) {
          setSrcB(next);
          return false;
        }
        setSrcA(next);
        return true;
      });
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [poolKey, pool, reduceMotion]);

  if (hideForNavHover) {
    return null;
  }

  if (urlFetchState.status === "loading" || urlFetchState.status === "idle") {
    return null;
  }

  if (urlFetchState.status === "error") {
    return (
      <p
        className="sanityQuery__status sanityQuery__status--error pageHome__ambientError"
        role="alert"
      >
        No se pudieron cargar las imágenes de fondo.
      </p>
    );
  }

  if (pool.length === 0) {
    return null;
  }

  return (
    <div
      className="pageHome__ambient"
      aria-hidden
      data-single-layer={pool.length === 1 || reduceMotion ? "true" : undefined}
    >
      <div
        className={[
          "pageHome__ambientLayer",
          activeIsA || reduceMotion ? "pageHome__ambientLayer--front" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ArchivalMedia
          src={srcA}
          alt=""
          className="pageHome__ambientMedia"
          treatment="natural"
          objectFit="cover"
          loading="eager"
          fetchPriority="high"
        />
      </div>
      {!reduceMotion && pool.length > 1 ? (
        <div
          className={[
            "pageHome__ambientLayer",
            !activeIsA ? "pageHome__ambientLayer--front" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <ArchivalMedia
            src={srcB}
            alt=""
            className="pageHome__ambientMedia"
            treatment="natural"
            objectFit="cover"
            loading="lazy"
          />
        </div>
      ) : null}
    </div>
  );
}

function useReducedMotionPreference(): boolean {
  const [reduce, setReduce] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduce;
}
