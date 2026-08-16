/**
 * Server-only markdown utility. Do not import this in client-side code.
 */
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";
import type { Maybe, SanitizedHTML } from "#lib/types.ts";

const MARKDOWN_SANITIZE_OPTIONS: sanitizeHtml.IOptions = Object.freeze({
  allowProtocolRelative: false,
  allowedAttributes: {
    a: ["href", "class"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
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
});

const sanitizeMarkdownHtml = (html: string): SanitizedHTML =>
  sanitizeHtml(html, MARKDOWN_SANITIZE_OPTIONS) as SanitizedHTML;

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
