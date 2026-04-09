/* eslint-disable new-cap */
import { db } from "$lib/db";
import {
  clients as clientsTable,
  invoices as invoicesTable,
} from "$lib/db/schema";
import {
  clientPaginatedListSchema,
  clientPickerOptionsResponseSchema,
  clientSchema,
  clientStatusPatchResponseSchema,
  clientStatusSchema,
} from "$lib/features/clients/schemas";
import { invoiceListRowSchema } from "$lib/features/invoices/schemas";
import { listQueryWireSchema } from "$lib/features/pagination/schemas";
import { fetchPaginatedClients } from "$lib/features/pagination/utils/clients-list.server";
import { fetchClientPickerOptions } from "$lib/features/pagination/utils/clients-options.server";
import { normalizeListQuery } from "$lib/features/pagination/utils/list-query";
import {
  apiErrorBodySchema,
  deleteSuccessSchema,
  idResponseSchema,
} from "$lib/server/api-response-schemas";
import { clientSelectSchema } from "$lib/validators";
import { and, eq, sql } from "drizzle-orm";
import { Elysia, status } from "elysia";
import {
  lineItemsTotalSubquery,
  mapRowsWithTotal,
} from "../../features/invoices/queries/invoiceListHelpers";
import { betterAuthPlugin } from "../auth-plugin";

export const clientsRoutes = new Elysia({ prefix: "/clients" })
  .use(betterAuthPlugin)
  // GET /api/clients - List clients with received and balance (cursor pagination)
  .get(
    "/",
    async ({ user, query }) => {
      try {
        const { normalized } = normalizeListQuery({
          q: query.q,
          cursor: query.cursor,
          direction: query.direction,
          limit: query.limit,
        });
        return await fetchPaginatedClients(user.id, normalized);
      } catch (error) {
        console.error("Error loading clients:", error);
        return status(500, { message: "Failed to load clients" });
      }
    },
    {
      auth: true,
      query: listQueryWireSchema,
      response: {
        200: clientPaginatedListSchema,
        401: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // POST /api/clients - Create client (with upsert on conflict)
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
          .onConflictDoUpdate({
            target: clientsTable.id,
            set: {
              userId: sql`excluded.user_id`,
              name: sql`excluded.name`,
              email: sql`excluded.email`,
              street: sql`excluded.street`,
              city: sql`excluded.city`,
              state: sql`excluded.state`,
              zip: sql`excluded.zip`,
              clientStatus: sql`excluded.client_status`,
            },
          })
          .returning({ id: clientsTable.id });

        return { id: inserted.id };
      } catch (error) {
        console.error("Error adding client:", error);
        return status(500, { message: "Failed to add client" });
      }
    },
    {
      body: clientSchema,
      auth: true,
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
        return status(500, { message: "Failed to load client options" });
      }
    },
    {
      auth: true,
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
          return status(404, { message: "Client not found" });
        }
        return client;
      } catch (error) {
        console.error("Error loading client:", error);
        return status(500, { message: "Failed to load client" });
      }
    },
    {
      params: idResponseSchema,
      auth: true,
      response: {
        200: clientSelectSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // PUT /api/clients/:id - Update client
  .put(
    "/:id",
    async ({ params: { id }, body, user }) => {
      try {
        const [updated] = await db
          .update(clientsTable)
          .set({
            ...body,
            updatedAt: new Date(),
          })
          .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, user.id)))
          .returning();

        if (!updated) {
          return status(404, { message: "Client not found" });
        }
        return updated;
      } catch (error) {
        console.error("Error updating client:", error);
        return status(500, { message: "Failed to update client" });
      }
    },
    {
      params: idResponseSchema,
      body: clientSchema,

      auth: true,
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
    "/:id",
    async ({ params: { id }, body, user }) => {
      try {
        const [updated] = await db
          .update(clientsTable)
          .set({
            clientStatus: body.clientStatus,
            updatedAt: new Date(),
          })
          .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, user.id)))
          .returning({
            id: clientsTable.id,
            clientStatus: clientsTable.clientStatus,
            updatedAt: clientsTable.updatedAt,
          });

        if (!updated) {
          return status(404, { message: "Client not found" });
        }
        return updated;
      } catch (error) {
        console.error("Error updating client status:", error);
        return status(500, { message: "Failed to update client status" });
      }
    },
    {
      params: idResponseSchema,
      body: clientStatusSchema,
      auth: true,
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
          return status(404, { message: "Client not found" });
        }
        return { success: true as const };
      } catch (error) {
        console.error("Error deleting client:", error);
        return status(500, { message: "Failed to delete client" });
      }
    },
    {
      params: idResponseSchema,
      auth: true,
      response: {
        200: deleteSuccessSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // GET /api/clients/:id/invoices - Get client's invoices with total
  .get(
    "/:id/invoices",
    async ({ params: { id }, user }) => {
      try {
        const client = await db.query.clients.findFirst({
          where: { id: { eq: id }, userId: { eq: user.id } },
        });
        if (!client) {
          return status(404, { message: "Client not found" });
        }

        const rows = await db
          .select({
            id: invoicesTable.id,
            userId: invoicesTable.userId,
            invoiceNumber: invoicesTable.invoiceNumber,
            clientId: invoicesTable.clientId,
            subject: invoicesTable.subject,
            issueDate: invoicesTable.issueDate,
            dueDate: invoicesTable.dueDate,
            discount: invoicesTable.discount,
            notes: invoicesTable.notes,
            terms: invoicesTable.terms,
            invoiceStatus: invoicesTable.invoiceStatus,
            createdAt: invoicesTable.createdAt,
            updatedAt: invoicesTable.updatedAt,
            clientName: clientsTable.name,
            subtotal: lineItemsTotalSubquery.subtotal,
          })
          .from(invoicesTable)
          .leftJoin(clientsTable, eq(invoicesTable.clientId, clientsTable.id))
          .leftJoin(
            lineItemsTotalSubquery,
            eq(invoicesTable.id, lineItemsTotalSubquery.invoiceId)
          )
          .where(
            and(
              eq(invoicesTable.clientId, id),
              eq(invoicesTable.userId, user.id)
            )
          );

        const withTotal = mapRowsWithTotal(rows);
        return withTotal.map((row) => {
          const { clientName, ...rest } = row;
          return {
            ...rest,
            client: { name: clientName ?? "Unknown" },
          };
        });
      } catch (error) {
        console.error("Error loading client invoices:", error);
        return status(500, { message: "Failed to load client invoices" });
      }
    },
    {
      params: idResponseSchema,
      auth: true,
      response: {
        200: invoiceListRowSchema.array(),
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  );
