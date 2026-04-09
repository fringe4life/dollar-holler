import { DEFAULT_LIMIT } from "../constants";
import type { PaginationSearchParams } from "../types";
import { normalizeListQueryFromUrl } from "./list-query";

/**
 * Canonical string for comparing “same list request” as the server/API.
 * Omitted params match defaults: `limit` 10, `direction` forward, no `q`/`cursor`.
 */
export const listUrlKey = (url: URL): string => {
  const { normalized } = normalizeListQueryFromUrl(url);
  return serializeNormalizedForKey(normalized);
};

/** Fixed key order for stable equality (not alphabetical — avoids splitting pairs). */
export const serializeNormalizedForKey = (
  n: PaginationSearchParams
): string => {
  const parts: string[] = [];
  if (n.q) {
    parts.push(`q=${encodeURIComponent(n.q)}`);
  }
  if (n.cursor) {
    parts.push(`cursor=${encodeURIComponent(n.cursor)}`);
  }
  if (n.direction === "backward") {
    parts.push("direction=backward");
  }
  if (n.limit !== DEFAULT_LIMIT) {
    parts.push(`limit=${String(n.limit)}`);
  }
  return parts.join("&");
};

/** Build `?foo=bar` for pushState after a successful fetch. */
export const buildListSearchString = (n: PaginationSearchParams): string => {
  const s = serializeNormalizedForKey(n);
  return s === "" ? "" : `?${s}`;
};

/**
 * Eden/query object aligned with {@link serializeNormalizedForKey} (same wire shape, decoded values).
 */
export const normalizedToQueryRecord = (
  n: PaginationSearchParams
): Record<string, string> => {
  const s = serializeNormalizedForKey(n);
  if (s === "") {
    return {};
  }
  return Object.fromEntries(new URLSearchParams(s)) as Record<string, string>;
};
