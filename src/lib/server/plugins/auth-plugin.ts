import { Elysia, NotFoundError } from "elysia";
import { verifyClient } from "$features/clients/queries/verify-client";
import {
  verifyInvoice,
  verifyInvoiceStatus,
} from "$features/invoices/queries/verify-invoice";
import { invoiceUpdateSchema } from "$features/invoices/schemas.server";
import { auth } from "$lib/auth.server";
import { idResponseSchema } from "../schemas";
import { UnauthorizedError } from "../utils/errors";
import { assertAllowedInvoiceStatusTransition } from "../utils/invoice-status-transitions";

/**
 * Protected API plugin for ElysiaJS: session macros and resource guards.
 * Better Auth HTTP routes are mounted on the root API app via `.mount(auth.handler)` in [`app.ts`](../app.ts).
 *
 * - **`auth`:** GET-safe; uses cookie cache when enabled (see auth config).
 * - **`authMutation`:** POST/PUT/PATCH/DELETE; bypasses cookie cache so the session is validated against the DB.
 *
 * **401:** Unauthenticated requests throw [`UnauthorizedError`](../errors.ts); [`app.onError`](../app.ts) maps
 * code `UNAUTHORIZED` to `401` + `apiErrorBody`. Protected routes should still declare `401: apiErrorBodySchema`
 * on each endpoint using `auth` or `authMutation` so OpenAPI and inferred response types include that status.
 *
 * **List pagination:** use [`listQueryPlugin`](./list-query-plugin.ts) and `listQuery: true` on routes that need
 * `normalized` query context (stack with `auth` / `authMutation`).
 *
 * **Resource verify macros (`verifyClientGet` / `verifyClientMutation` / `verifyInvoiceGet` / `verifyInvoiceMutation`):**
 * Each extends the right session macro (`auth` vs `authMutation`) via `auth: true` / `authMutation: true`.
 * Macros are registered with **named** `.macro("…")` chains so Elysia can infer `user` (and `params`) in `resolve`;
 * a single `.macro({ … })` object does not get that inference (TypeScript limitation). Missing `user` throws
 * `UnauthorizedError`. Missing resource throws [`NotFoundError`](../errors.ts); [`app.onError`](../app.ts) maps to 404 + `apiErrorBody`.
 *
 * @remarks
 * A single parameterized session + verify macro (or codegen) may reduce API surface; revisit when upgrading
 * Elysia or if macro composition typing improves.
 */
export const protectedApiPlugin = new Elysia({ name: "protected-api" })
  .macro("auth", {
    async resolve({ request: { headers } }) {
      const session = await auth.api.getSession({ headers });
      if (!session) {
        throw new UnauthorizedError();
      }
      return {
        user: session.user,
      };
    },
  })
  .macro("authMutation", {
    async resolve({ request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
        query: { disableCookieCache: true },
      });
      if (!session) {
        throw new UnauthorizedError();
      }
      return {
        user: session.user,
      };
    },
  })
  .macro("verifyClientGet", {
    auth: true,
    params: idResponseSchema,
    async resolve({ user, params: { id } }) {
      if (!(await verifyClient(user.id, id))) {
        throw new NotFoundError("Client not found");
      }
    },
  })
  .macro("verifyClientMutation", {
    authMutation: true,
    params: idResponseSchema,
    async resolve({ user, params: { id } }) {
      if (!(await verifyClient(user.id, id))) {
        throw new NotFoundError("Client not found");
      }
    },
  })
  .macro("verifyInvoiceGet", {
    auth: true,
    params: idResponseSchema,
    async resolve({ user, params: { id } }) {
      if (!(await verifyInvoice(user.id, id))) {
        throw new NotFoundError("Invoice not found");
      }
    },
  })
  .macro("verifyInvoiceMutation", {
    authMutation: true,
    params: idResponseSchema,
    async resolve({ user, params: { id } }) {
      if (!(await verifyInvoice(user.id, id))) {
        throw new NotFoundError("Invoice not found");
      }
    },
  })
  /** PATCH /invoices/:id — verifies invoice ownership and legal `invoiceStatus` transitions when present. */
  .macro("verifyInvoicePatchMutation", {
    authMutation: true,
    params: idResponseSchema,
    body: invoiceUpdateSchema,
    async resolve({ user, params: { id }, body }) {
      const result = await verifyInvoiceStatus(user.id, id);
      if (!result?.id) {
        throw new NotFoundError("Invoice not found");
      }
      // TODO: This is a workaround to allow the api endpoint to continue without the invoice status
      if (!body?.invoiceStatus) {
        return;
      }
      const current = result.invoiceStatus;
      if (!current) {
        throw new NotFoundError("Invoice not found");
      }
      assertAllowedInvoiceStatusTransition(current, body.invoiceStatus);
    },
  });
