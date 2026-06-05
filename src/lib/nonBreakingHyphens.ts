const NB_HYPHEN = "\u2011";

/** Keep hyphenated titles (e.g. Barbara Sanchez-Kane) on one line. */
export function nonBreakingHyphens(text: string): string {
  return text.replace(/-/g, NB_HYPHEN);
}
