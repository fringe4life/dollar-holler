import { DEFAULT_LIMIT } from "../constants";
import type { PaginationSearchParams } from "../types";

/** Fixed key order for stable equality (not alphabetical — avoids splitting pairs). */
const serializeNormalizedForKey = (n: PaginationSearchParams): string => {
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

/**
 * Browser-visible list URL after shallow `goto`. Prefer over `page.url` when reading
 * search/pagination query params on the client.
 */
export const visibleListUrl = <
  T extends { pathname: string; searchParams: Pick<URLSearchParams, "get"> },
>(page: {
  url: T;
  shallow: { url: T } | null;
}): T => page.shallow?.url ?? page.url;

/** Build `?foo=bar` for shallow `goto` after a successful fetch. */
export const buildListSearchString = (n: PaginationSearchParams): string => {
  const s = serializeNormalizedForKey(n);
  return s === "" ? "" : `?${s}`;
};
