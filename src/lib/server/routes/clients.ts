import { and, eq } from "drizzle-orm";
import { Elysia, InternalServerError, NotFoundError } from "elysia";
import { fetchPaginatedClients } from "$features/clients/queries/clients-list.server";
import { fetchClientPickerOptions } from "$features/clients/queries/clients-options.server";
import {
  clientInsertSchema,
  clientPaginatedListSchema,
  clientPickerOptionsResponseSchema,
  clientSelectSchema,
  clientStatusPatchResponseSchema,
  clientStatusSchema,
  clientUpdateSchema,
} from "$features/clients/schemas.server";
import {
  fetchClientInvoiceSummary,
  fetchPaginatedInvoicesForClient,
} from "$features/invoices/queries/invoices-list.server";
import {
  clientInvoiceSummarySchema,
  invoicePaginatedListSchema,
} from "$features/invoices/schemas.server";
import { querySchema } from "$features/pagination/schemas.server";
import { db } from "$lib/server/db";
import { clients as clientsTable } from "$lib/server/db/schema";
import {
  apiErrorBodySchema,
  deleteSuccessSchema,
  idResponseSchema,
} from "$lib/server/schemas";
import { protectedApiPlugin } from "../plugins/auth-plugin";
import { listQueryPlugin } from "../plugins/list-query-plugin";

export const clientsRoutes = new Elysia({ prefix: "/clients" })
  .use(protectedApiPlugin)
  .use(listQueryPlugin)
  .guard({
    detail: {
      tags: ["Clients"],
    },
  })
  // GET /api/clients - List clients with received and balance (cursor pagination)
  .get(
    "/",
    async ({ user, normalized }) => {
      try {
        return await fetchPaginatedClients(user.id, normalized);
      } catch (error) {
        console.error("Error loading clients:", error);
        throw new InternalServerError("Failed to load clients");
      }
    },
    {
      auth: true,
      listQuery: true,
      detail: {
        operationId: "listClients",
        summary: "List clients",
        description:
          "Cursor-paginated list of clients for the authenticated user, including received amount and balance. Supports optional search and cursor query params (`cursor`, `direction`, `limit`, `q`). Unauthenticated requests return 401.",
      },
      response: {
        200: clientPaginatedListSchema,
        401: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // POST /api/clients - Create client
  .post(
    "/",
    async ({ body, user }) => {
      try {
        const [inserted] = await db
          .insert(clientsTable)
          .values({
            ...body,
            userId: user.id,
          })
          .returning({ id: clientsTable.id });

        return { id: inserted.id };
      } catch (error) {
        console.error("Error adding client:", error);
        throw new InternalServerError("Failed to add client");
      }
    },
    {
      body: clientInsertSchema,
      authMutation: true,
      detail: {
        operationId: "createClient",
        summary: "Create client",
        description:
          "Creates a client owned by the authenticated user (`userId` from session). Mutations validate the session without cookie cache. Returns the new client's id.",
      },
      response: {
        200: idResponseSchema,
        401: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // GET /api/clients/options - All id+name rows for client pickers (no pagination)
  .get(
    "/options",
    async ({ user }) => {
      try {
        const options = await fetchClientPickerOptions(user.id);
        return { options };
      } catch (error) {
        console.error("Error loading client options:", error);
        throw new InternalServerError("Failed to load client options");
      }
    },
    {
      auth: true,
      detail: {
        operationId: "getClientPickerOptions",
        summary: "Client picker options",
        description:
          "Returns id and display fields for every client belonging to the user, for dropdowns and pickers. Not paginated.",
      },
      response: {
        200: clientPickerOptionsResponseSchema,
        401: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // GET /api/clients/:id - Get single client
  .get(
    "/:id",
    async ({ params: { id }, user }) => {
      try {
        const client = await db.query.clients.findFirst({
          where: { id: { eq: id }, userId: { eq: user.id } },
        });
        if (!client) {
          throw new NotFoundError("Client not found");
        }
        return client;
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        console.error("Error loading client:", error);
        throw new InternalServerError("Failed to load client");
      }
    },
    {
      params: idResponseSchema,
      auth: true,
      detail: {
        operationId: "getClient",
        summary: "Get client by id",
        description:
          "Returns a single client if it exists and belongs to the authenticated user. Missing or other users' clients return 404.",
      },
      response: {
        200: clientSelectSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // PATCH /api/clients/:id - Update client
  .patch(
    "/:id",
    async ({ params: { id }, body, user }) => {
      try {
        const [updated] = await db
          .update(clientsTable)
          .set(body)
          .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, user.id)))
          .returning();

        if (!updated) {
          throw new NotFoundError("Client not found");
        }
        return updated;
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        console.error("Error updating client:", error);
        throw new InternalServerError("Failed to update client");
      }
    },
    {
      params: idResponseSchema,
      body: clientUpdateSchema,
      authMutation: true,
      detail: {
        operationId: "updateClient",
        summary: "Update client",
        description:
          "Full update of client fields. The client must belong to the authenticated user; otherwise returns 404.",
      },
      response: {
        200: clientSelectSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // PATCH /api/clients/:id - Update client status only
  .patch(
    "/status/:id",
    async ({ params: { id }, body, user }) => {
      try {
        const [updated] = await db
          .update(clientsTable)
          .set({
            clientStatus: body.clientStatus,
          })
          .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, user.id)))
          .returning({
            id: clientsTable.id,
            clientStatus: clientsTable.clientStatus,
            updatedAt: clientsTable.updatedAt,
          });

        if (!updated) {
          throw new NotFoundError("Client not found");
        }

        return updated;
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        console.error("Error updating client status:", error);
        throw new InternalServerError("Failed to update client status");
      }
    },
    {
      params: idResponseSchema,
      body: clientStatusSchema,
      authMutation: true,
      detail: {
        operationId: "patchClientStatus",
        summary: "Update client status",
        description:
          "Updates only the client status. The client must belong to the authenticated user; otherwise returns 404.",
      },
      response: {
        200: clientStatusPatchResponseSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // DELETE /api/clients/:id - Delete client
  .delete(
    "/:id",
    async ({ params: { id }, user }) => {
      try {
        const [deleted] = await db
          .delete(clientsTable)
          .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, user.id)))
          .returning({ id: clientsTable.id });

        if (!deleted) {
          throw new NotFoundError("Client not found");
        }
        return { success: true as const };
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        console.error("Error deleting client:", error);
        throw new InternalServerError("Failed to delete client");
      }
    },
    {
      params: idResponseSchema,
      authMutation: true,
      detail: {
        operationId: "deleteClient",
        summary: "Delete client",
        description:
          "Deletes the client if it belongs to the authenticated user. Missing client returns 404.",
      },
      response: {
        200: deleteSuccessSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // GET /api/clients/:id/invoices/summary - Bucket totals (cents) for filtered set
  .get(
    "/:id/invoices/summary",
    async ({ params: { id }, user, query }) => {
      try {
        return await fetchClientInvoiceSummary(user.id, id, query.q);
      } catch (error) {
        console.error("Error loading client invoice summary:", error);
        throw new InternalServerError("Failed to load client invoice summary");
      }
    },
    {
      params: idResponseSchema,
      verifyClientGet: true,
      query: querySchema,
      detail: {
        operationId: "getClientInvoiceSummary",
        summary: "Invoice summary for client",
        description:
          "Returns aggregated invoice totals (cents) for the client's invoices. Optional `q` narrows the invoice set. Returns 404 if the client does not exist or is not owned by the user.",
      },
      response: {
        200: clientInvoiceSummarySchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // GET /api/clients/:id/invoices - Client's invoices (cursor pagination)
  .get(
    "/:id/invoices",
    async ({ params: { id }, user, normalized }) => {
      try {
        return await fetchPaginatedInvoicesForClient(user.id, id, normalized);
      } catch (error) {
        console.error("Error loading client invoices:", error);
        throw new InternalServerError("Failed to load client invoices");
      }
    },
    {
      params: idResponseSchema,
      verifyClientGet: true,
      listQuery: true,
      detail: {
        operationId: "listClientInvoices",
        summary: "List invoices for client",
        description:
          "Cursor-paginated invoices for this client (`cursor`, `direction`, `limit`, optional `q`). Returns 404 if the client does not exist or is not owned by the user.",
      },
      response: {
        200: invoicePaginatedListSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  );
