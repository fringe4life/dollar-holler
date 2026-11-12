/**
 * Server-only markdown utility. Do not import this in client-side code.
 *
 * SanitizedHTML contract: `markdownToHtml` / `sanitizeMarkdownHtml` are the only
 * places that may establish the brand (via `xss` + the notes/terms allowlist).
 * Invoice writes go through `invoice-notes-terms-html.server.ts`; insert/update schemas
 * omit `notesHtml` / `termsHtml` so clients never post raw HTML.
 */
import { FilterXSS, safeAttrValue } from "xss";
import { marked } from "marked";
import { parse } from "valibot";
import type { Maybe } from "#lib/types.ts";
import {
  sanitizedHtmlSchema,
  type SanitizedHTML,
} from "#lib/schemas/sanitized-html.server.ts";

const ALLOWED_TAGS = [
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
] as const;

const ALLOWED_HREF_SCHEMES = new Set(["http:", "https:", "mailto:"]);

/** Shared policy for invoice notes/terms HTML. Keep in sync with read-path schema in `sanitized-html.server.ts`. */
const MARKDOWN_WHITE_LIST: Record<string, string[]> = Object.fromEntries(
  ALLOWED_TAGS.map((tag) => [tag, tag === "a" ? ["href", "class"] : ["class"]])
);

const hrefAttrValue = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.startsWith("//")) {
    return "";
  }
  const scheme = /^([a-zA-Z][a-zA-Z+.-]*):/.exec(trimmed);
  if (scheme === null) {
    return trimmed;
  }
  const protocol = `${scheme[1].toLowerCase()}:`;
  return ALLOWED_HREF_SCHEMES.has(protocol) ? trimmed : "";
};

const markdownXss = new FilterXSS({
  allowCommentTag: false,
  css: false,
  safeAttrValue: (tag, name, value, cssFilter) => {
    if (name === "href") {
      return hrefAttrValue(value);
    }
    return safeAttrValue(tag, name, value, cssFilter);
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"],
  whiteList: MARKDOWN_WHITE_LIST,
});

/** Write path: run xss, then brand via Valibot schema. Do not brand without this step. */
const sanitizeMarkdownHtml = (html: string): SanitizedHTML =>
  parse(sanitizedHtmlSchema, markdownXss.process(html));

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

/** Test/debug helper: sanitizer only, same allowlist as `markdownToHtml`. */
export const sanitizeMarkdownHtmlForTest = sanitizeMarkdownHtml;
