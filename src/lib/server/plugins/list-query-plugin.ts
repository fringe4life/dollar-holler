import { Elysia } from "elysia";
import { listQueryWireSchema } from "$features/pagination/schemas.server";
import { normalizeListQuery } from "$features/pagination/utils/list-query";

/**
 * Pagination query macro for Elysia: `listQuery: true` validates list query params and injects
 * `normalized` into the handler context. Compose with [`protectedApiPlugin`](./auth-plugin.ts) where routes need both.
 */
export const listQueryPlugin = new Elysia({ name: "list-query" }).macro(
  "listQuery",
  {
    query: listQueryWireSchema,
    resolve({ query }) {
      const { normalized } = normalizeListQuery({
        q: query.q,
        cursor: query.cursor,
        direction: query.direction,
        limit: query.limit,
      });
      return { normalized };
    },
  }
);
