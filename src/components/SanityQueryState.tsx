import type { ReactNode } from "react";

import type { SanityFetchState } from "../hooks/useSanityProjects";

type SanityQueryStateProps<T> = {
  state: SanityFetchState<T>;
  errorMessage?: string;
  emptyMessage?: string;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
};

export function SanityQueryState<T>({
  state,
  errorMessage = "No se pudo cargar el contenido.",
  emptyMessage,
  isEmpty,
  children,
}: SanityQueryStateProps<T>) {
  if (state.status === "idle" || state.status === "loading") {
    return null;
  }

  if (state.status === "error") {
    return (
      <p className="sanityQuery__status sanityQuery__status--error" role="alert">
        {errorMessage}
        {import.meta.env.DEV ? (
          <span className="sanityQuery__errorDetail"> {state.error.message}</span>
        ) : null}
      </p>
    );
  }

  if (emptyMessage && isEmpty?.(state.data)) {
    return (
      <p className="sanityQuery__status sanityQuery__status--empty">{emptyMessage}</p>
    );
  }

  return <>{children(state.data)}</>;
}
