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
const projectBySlugErrors = new Map<string, Error>();

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
        if (cancelled) return;
        for (const project of data) {
          projectBySlugCache.set(
            projectCacheKey(type, project.slug, language),
            project,
          );
        }
        setState({ status: "success", data });
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
  const [, setVersion] = useState(0);

  useEffect(() => {
    if (!slug) return;

    const key = projectCacheKey(type, slug, language);
    if (projectBySlugCache.has(key) || projectBySlugErrors.has(key)) return;

    let cancelled = false;

    fetchProjectBySlug(type, slug, language)
      .then((data) => {
        if (cancelled) return;
        projectBySlugCache.set(key, data);
        projectBySlugErrors.delete(key);
        setVersion((v) => v + 1);
      })
      .catch((err) => {
        if (cancelled) return;
        projectBySlugErrors.set(key, toError(err));
        setVersion((v) => v + 1);
      });

    return () => {
      cancelled = true;
    };
  }, [type, slug, language]);

  if (!slug) return { status: "idle" };

  const key = projectCacheKey(type, slug, language);
  const cached = projectBySlugCache.get(key);
  if (cached !== undefined) {
    return { status: "success", data: cached };
  }

  const error = projectBySlugErrors.get(key);
  if (error) {
    return { status: "error", error };
  }

  return { status: "loading" };
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
