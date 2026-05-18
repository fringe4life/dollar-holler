/**
 * Server-only markdown utility. Do not import this in client-side code.
 */

import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import type { Maybe, SanitizedHTML } from "$lib/types";

type SanitizeOptions = NonNullable<Parameters<typeof sanitizeHtml>[1]>;

const MARKDOWN_SANITIZE_OPTIONS: SanitizeOptions = Object.freeze({
  allowedTags: [
    "p",
    "br",
    "hr",
    "blockquote",
    "pre",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "b",
    "em",
    "i",
    "code",
    "a",
    "ul",
    "ol",
    "li",
    "del",
    "s",
  ],
  allowedAttributes: {
    a: ["href"],
    code: ["class"],
  },
  allowedClasses: {
    code: ["language-*"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
});

export const markdownToHtml = (source: Maybe<string>): Maybe<SanitizedHTML> => {
  if (!source) {
    return null;
  }

  try {
    const html = marked(source, { async: false });
    return sanitizeHtml(html, MARKDOWN_SANITIZE_OPTIONS) as SanitizedHTML;
  } catch (error) {
    console.error("Error parsing markdown with marked:", error);
    return sanitizeHtml(source, MARKDOWN_SANITIZE_OPTIONS) as SanitizedHTML;
  }
};
