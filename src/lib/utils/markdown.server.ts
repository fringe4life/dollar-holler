/**
 * Server-only markdown utility. Uses Bun.markdown which is only available on the server.
 * Do not import this in client-side code.
 */
import type { Maybe, SanitizedHTML } from "$lib/types";
import { sanitize } from "isomorphic-dompurify";

export const markdownToHtml = (source: string): Maybe<SanitizedHTML> => {
  if (!source) return null;

  try {
    const html = Bun.markdown.html(source);
    return sanitize(html) as SanitizedHTML;
  } catch (error) {
    console.error("Error parsing markdown with Bun.markdown:", error);
    return sanitize(source) as SanitizedHTML;
  }
};
