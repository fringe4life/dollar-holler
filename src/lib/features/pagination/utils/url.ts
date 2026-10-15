import { DEFAULT_LIMIT } from "../constants";
import type { PaginationSearchParams } from "../types";

const LIST_KEYS = new Set(["q", "cursor", "direction", "limit"]);

export interface ListSearchParams {
  entries(): Iterable<[string, string]>;
  get(key: string): string | null;
}

export interface ListLocation {
  pathname: string;
  searchParams: ListSearchParams;
}

export interface ListPage {
  shallow: { url: ListLocation } | null;
  url: ListLocation;
}

const encodePair = (key: string, value: string): string =>
  `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

/**
 * Browser-visible list URL after shallow `goto`. Prefer over `page.url` when reading
 * search/pagination query params on the client.
 */
export const visibleListUrl = (page: ListPage): ListLocation =>
  page.shallow?.url ?? page.url;

/** `?q=&cursor=&direction=&limit=` with defaults omitted. Other keys are appended. */
export const buildListSearchString = (
  query: PaginationSearchParams,
  searchParams?: ListSearchParams
): string => {
  const parts: string[] = [];
  if (query.q) {
    parts.push(encodePair("q", query.q));
  }
  if (query.cursor) {
    parts.push(encodePair("cursor", query.cursor));
  }
  if (query.direction === "backward") {
    parts.push(encodePair("direction", "backward"));
  }
  if (query.limit !== DEFAULT_LIMIT) {
    parts.push(encodePair("limit", String(query.limit)));
  }
  if (searchParams) {
    for (const [key, value] of searchParams.entries()) {
      if (LIST_KEYS.has(key)) {
        continue;
      }
      parts.push(encodePair(key, value));
    }
  }
  return parts.length === 0 ? "" : `?${parts.join("&")}`;
};
