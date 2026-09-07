/**
 * Overlay HTML for invoice notes/terms. Paint only — never persist this
 * string as `notesHtml` / `termsHtml` (those go through `markdownToHtml`).
 *
 * Walk `Prism.tokenize` ourselves. Do not use `Prism.highlight` /
 * `Token.stringify` (markdown `wrap` hook can set attrs / rewrite HTML).
 */
import "./prism-setup.ts";
import Prism from "prismjs/components/prism-core.js";
import type {
  PrismToken,
  PrismTokenStream,
} from "prismjs/components/prism-core.js";
import "prismjs/components/prism-markup.js";
import "prismjs/components/prism-markdown.js";

/** `<pre>` drops a trailing empty line; a space keeps wrap/scroll aligned. */
const EMPTY_LAST_LINE = " ";

/** Prism token type / alias used as a class segment (`code-snippet`, `language-yaml`). */
const SAFE_TOKEN_CLASS = /^[A-Za-z][\w-]*$/;

const escapeHtml = (text: string): string =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;");

const sourceForOverlay = (source: string): string =>
  source.endsWith("\n") ? `${source}${EMPTY_LAST_LINE}` : source;

const isToken = (node: string | PrismToken): node is PrismToken =>
  typeof node === "object" && node !== null && typeof node.type === "string";

const normalizeAliases = (alias: PrismToken["alias"]): string[] => {
  if (alias == null) {
    return [];
  }
  if (Array.isArray(alias)) {
    return alias;
  }
  return [alias];
};

const tokenClassNames = (token: PrismToken): string => {
  const aliases = normalizeAliases(token.alias);
  const parts = ["token", token.type, ...aliases].filter((part) =>
    SAFE_TOKEN_CLASS.test(part)
  );
  return parts.length > 0 ? parts.join(" ") : "token";
};

const stringifySafe = (
  node: string | PrismToken | PrismTokenStream
): string => {
  if (typeof node === "string") {
    return escapeHtml(node);
  }
  if (Array.isArray(node)) {
    return node.map(stringifySafe).join("");
  }
  if (!isToken(node)) {
    return "";
  }
  return `<span class="${tokenClassNames(node)}">${stringifySafe(node.content)}</span>`;
};

export const highlightMarkdown = (source: string): string => {
  const prepared = sourceForOverlay(source);
  const grammar = Prism.languages.markdown;
  if (!grammar) {
    return escapeHtml(prepared);
  }
  return stringifySafe(Prism.tokenize(prepared, grammar));
};
