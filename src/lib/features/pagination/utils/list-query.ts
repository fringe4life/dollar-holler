import type { CursorId, Maybe } from "$lib/types";
import { DEFAULT_LIMIT, LIMITS } from "../constants";
import type { ListDirection, PaginationSearchParams } from "../types";

import { ArkErrors } from "arktype";
import { cursorSchema } from "../schemas";
import type { NormalizeListQueryResult } from "../types";

const parseLimit = (raw: string | undefined): number => {
  return parseLimitParam(raw);
};

const parseDirection = (raw: string | undefined): ListDirection => {
  return raw === "backward" ? "backward" : "forward";
};

/**
 * Shared list-query normalization for SSR, Elysia GET handlers, and client.
 * Invalid UUIDv7 `cursor` values are dropped (first-page semantics); sets `listCursorWasNormalized`.
 */
export const normalizeListQuery = (raw: {
  q?: string;
  cursor?: string;
  direction?: string;
  limit?: string;
}): NormalizeListQueryResult => {
  let listCursorWasNormalized = false;
  const q = raw.q?.trim() || undefined;

  let cursor: CursorId | undefined;
  if (raw.cursor !== undefined && raw.cursor !== "") {
    const parsed = cursorSchema(raw.cursor);
    if (parsed instanceof ArkErrors) {
      listCursorWasNormalized = true;
    } else {
      cursor = parsed;
    }
  }

  const direction = parseDirection(raw.direction);
  const limit = parseLimit(raw.limit);

  /** Backward without cursor: first page (same as forward, no cursor). */
  const effectiveDirection: ListDirection =
    direction === "backward" && !cursor ? "forward" : direction;

  return {
    normalized: {
      q,
      cursor,
      direction: effectiveDirection,
      limit,
    },
    listCursorWasNormalized,
  };
};

export const normalizeListQueryFromUrl = (
  url: URL
): NormalizeListQueryResult => {
  return normalizeListQuery(parseSearchParamsToRaw(url.searchParams));
};

const firstParam = (
  searchParams: URLSearchParams,
  key: string
): string | undefined => {
  const v = searchParams.get(key);
  return v === null || v === "" ? undefined : v;
};

/** First `cursor` wins (matches `URLSearchParams.get`). */
export const parseSearchParamsToRaw = (
  searchParams: URLSearchParams
): {
  q?: string;
  cursor?: string;
  direction?: string;
  limit?: string;
} => {
  return {
    q: firstParam(searchParams, "q"),
    cursor: firstParam(searchParams, "cursor"),
    direction: firstParam(searchParams, "direction"),
    limit: firstParam(searchParams, "limit"),
  };
};

export const parseLimitParam = (raw: Maybe<string>): number => {
  if (!raw) {
    return DEFAULT_LIMIT;
  }
  const n = Number(raw);
  return LIMITS.includes(n as (typeof LIMITS)[number]) ? n : DEFAULT_LIMIT;
};

/** Build normalized query from store/API args (defaults match URL + server). */
export const toNormalizedListQuery = (
  q: string | undefined,
  options?: {
    cursor?: CursorId;
    direction?: ListDirection;
    limit?: number;
  }
): PaginationSearchParams => {
  const limit =
    options?.limit !== undefined &&
    LIMITS.includes(options.limit as (typeof LIMITS)[number])
      ? options.limit
      : DEFAULT_LIMIT;
  let direction: ListDirection = options?.direction ?? "forward";
  if (direction === "backward" && !options?.cursor) {
    direction = "forward";
  }
  return {
    q: q?.trim() || undefined,
    cursor: options?.cursor,
    direction,
    limit,
  };
};
