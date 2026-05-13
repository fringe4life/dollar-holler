/**
 * Server-only markdown utility. Do not import this in client-side code.
 */

import { sanitize } from "isomorphic-dompurify";
import { marked } from "marked";
import type { Maybe, SanitizedHTML } from "$lib/types";

export const markdownToHtml = (source: Maybe<string>): Maybe<SanitizedHTML> => {
  if (!source) {
    return null;
  }

  try {
    const html = marked(source, { async: false });
    return sanitize(html) as SanitizedHTML;
  } catch (error) {
    console.error("Error parsing markdown with marked:", error);
    return sanitize(source) as SanitizedHTML;
  }
};
