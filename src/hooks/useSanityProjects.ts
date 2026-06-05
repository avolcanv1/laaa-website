import { useEffect, useState } from "react";

import {
  fetchAllProjectImageUrls,
  fetchProjectBySlug,
  fetchProjectList,
  type ProjectWithSlug,
} from "../lib/sanityProject";
import type { ProjectDocumentType } from "../lib/queries";
import { DEFAULT_LANGUAGE } from "../lib/queries";

const projectBySlugCache = new Map<string, ProjectWithSlug | null>();

function projectCacheKey(
  type: ProjectDocumentType,
  slug: string,
  language: string,
): string {
  return `${type}:${language}:${slug}`;
}

export type SanityFetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: T };

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

export function useSanityProjectList(
  type: ProjectDocumentType,
  language = DEFAULT_LANGUAGE,
): SanityFetchState<ProjectWithSlug[]> {
  const [state, setState] = useState<SanityFetchState<ProjectWithSlug[]>>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchProjectList(type, language)
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", error: toError(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [type, language]);

  return state;
}

export function useSanityProjectBySlug(
  type: ProjectDocumentType,
  slug: string | undefined,
  language = DEFAULT_LANGUAGE,
): SanityFetchState<ProjectWithSlug | null> {
  const [state, setState] = useState<SanityFetchState<ProjectWithSlug | null>>(() => {
    if (!slug) return { status: "idle" };
    const cached = projectBySlugCache.get(projectCacheKey(type, slug, language));
    return cached !== undefined
      ? { status: "success", data: cached }
      : { status: "loading" };
  });

  useEffect(() => {
    if (!slug) {
      setState({ status: "idle" });
      return;
    }

    const key = projectCacheKey(type, slug, language);
    const cached = projectBySlugCache.get(key);
    let cancelled = false;

    if (cached === undefined) {
      setState({ status: "loading" });
    }

    fetchProjectBySlug(type, slug, language)
      .then((data) => {
        if (cancelled) return;
        projectBySlugCache.set(key, data);
        setState({ status: "success", data });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", error: toError(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [type, slug, language]);

  return state;
}

export function useSanityAllProjectImageUrls(
  language = DEFAULT_LANGUAGE,
): SanityFetchState<string[]> {
  const [state, setState] = useState<SanityFetchState<string[]>>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchAllProjectImageUrls(language)
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", error: toError(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  return state;
}
