/**
 * Server-only markdown utility. Do not import this in client-side code.
 */
import { sanitize, type Config } from "isomorphic-dompurify";
import { marked } from "marked";
import type { Maybe, SanitizedHTML } from "$lib/types";

const MARKDOWN_PURIFY_CONFIG: Config = Object.freeze({
  ALLOWED_ATTR: ["href", "class"],
  ALLOWED_TAGS: [
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
  ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
  ALLOW_UNKNOWN_PROTOCOLS: false,
});

const sanitizeMarkdownHtml = (html: string): SanitizedHTML =>
  sanitize(html, MARKDOWN_PURIFY_CONFIG) as SanitizedHTML;

export const markdownToHtml = (source: Maybe<string>): Maybe<SanitizedHTML> => {
  if (!source) {
    return null;
  }

  try {
    const html = marked(source, { async: false });
    return sanitizeMarkdownHtml(html);
  } catch (error) {
    console.error("Error parsing markdown with marked:", error);
    return sanitizeMarkdownHtml(source);
  }
};
