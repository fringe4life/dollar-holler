/**
 * Server-only markdown utility. Do not import this in client-side code.
 *
 * SanitizedHTML contract: `markdownToHtml` / `sanitizeMarkdownHtml` are the only
 * places that may establish the brand (via `sanitizeHtml` + MARKDOWN_SANITIZE_OPTIONS).
 * Invoice writes go through `invoice-notes-terms-html.server.ts`; insert/update schemas
 * omit `notesHtml` / `termsHtml` so clients never post raw HTML.
 */
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";
import { parse } from "valibot";
import type { Maybe } from "#lib/types.ts";
import {
  sanitizedHtmlSchema,
  type SanitizedHTML,
} from "#lib/schemas/sanitized-html.server.ts";

/** Shared policy for invoice notes/terms HTML. Keep in sync with read-path schema in `sanitized-html.server.ts`. */
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

/** Write path: run sanitize-html, then brand via Valibot schema. Do not brand without this step. */
const sanitizeMarkdownHtml = (html: string): SanitizedHTML =>
  parse(sanitizedHtmlSchema, sanitizeHtml(html, MARKDOWN_SANITIZE_OPTIONS));

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
