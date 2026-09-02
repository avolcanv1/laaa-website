import { useEffect, useState } from "react";

import {
  ACERCA_PAGE_FALLBACK,
  fetchAcercaPage,
  type AcercaPageContent,
} from "../lib/acercaPage";

export function useAcercaPage(): AcercaPageContent {
  const [content, setContent] = useState<AcercaPageContent>(ACERCA_PAGE_FALLBACK);

  useEffect(() => {
    let cancelled = false;

    fetchAcercaPage().then((data) => {
      if (cancelled) return;
      setContent(data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return content;
}
