/**
 * Prism-free overlay text. Shared by SSR fallback and `highlightMarkdown`
 * so trailing-newline padding cannot drift.
 */

/** `<pre>` drops a trailing empty line; a space keeps wrap/scroll aligned. */
const EMPTY_LAST_LINE = " ";

export const escapeOverlayHtml = (text: string): string =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;");

export const sourceForOverlay = (source: string): string =>
  source.endsWith("\n") ? `${source}${EMPTY_LAST_LINE}` : source;

/** Escaped overlay HTML before the highlighter loads (SSR + first client paint). */
export const overlayPlainHtml = (source: string): string =>
  escapeOverlayHtml(sourceForOverlay(source));
