/* eslint-disable new-cap */
import { db } from "$lib/db";
import { cursorSchema } from "$lib/db/id";
import {
  clients as clientsTable,
  invoices as invoicesTable,
} from "$lib/db/schema";
import { type } from "arktype";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { betterAuthPlugin } from "../auth-plugin";
import { clientReceivedBalanceSubquery } from "../clientListHelpers";
import {
  lineItemsTotalSubquery,
  mapRowsWithTotal,
} from "../invoiceListHelpers";

// Client validation schema
// const clientSchema = t.Object({
//   id: optionalCursorId,
//   userId: t.String(),
//   name: t.String(),
//   email: t.Optional(t.Nullable(t.String())),
//   street: t.Optional(t.Nullable(t.String())),
//   city: t.Optional(t.Nullable(t.String())),
//   state: t.Optional(t.Nullable(t.String())),
//   zip: t.Optional(t.Nullable(t.String())),
//   clientStatus: t.Optional(
//     t.Nullable(t.Union([t.Literal("active"), t.Literal("archive")]))
//   ),
// });
const clientStatusSchema = type({
  clientStatus: "'active' | 'archive'",
});

const querySchema = type({
  q: "string?",
});

const clientSchema = type({
  id: cursorSchema.optional(),
  userId: "string",
  name: "string",
  email: "string?",
  street: "string?",
  city: "string?",
  state: "string?",
  zip: "string?",
  "clientStatus?": "'active' | 'archive' | null | undefined",
});

export const clientsRoutes = new Elysia({ prefix: "/clients" })
  .use(betterAuthPlugin)
  // GET /api/clients - List all clients with received and balance
  .get(
    "/",
    async ({ user, query }) => {
      try {
        const baseWhere = eq(clientsTable.userId, user.id);
        const searchWhere = query.q?.trim()
          ? or(
              ilike(clientsTable.name, `%${query.q.trim()}%`),
              ilike(clientsTable.email, `%${query.q.trim()}%`),
              ilike(clientsTable.street, `%${query.q.trim()}%`),
              ilike(clientsTable.city, `%${query.q.trim()}%`),
              ilike(clientsTable.state, `%${query.q.trim()}%`),
              ilike(clientsTable.zip, `%${query.q.trim()}%`),
              ilike(clientsTable.clientStatus, `%${query.q.trim()}%`)
            )
          : undefined;
        const whereClause = searchWhere
          ? and(baseWhere, searchWhere)
          : baseWhere;

        const rows = await db
          .select({
            id: clientsTable.id,
            userId: clientsTable.userId,
            name: clientsTable.name,
            email: clientsTable.email,
            street: clientsTable.street,
            city: clientsTable.city,
            state: clientsTable.state,
            zip: clientsTable.zip,
            clientStatus: clientsTable.clientStatus,
            createdAt: clientsTable.createdAt,
            updatedAt: clientsTable.updatedAt,
            received: clientReceivedBalanceSubquery.received,
            balance: clientReceivedBalanceSubquery.balance,
          })
          .from(clientsTable)
          .leftJoin(
            clientReceivedBalanceSubquery,
            eq(clientsTable.id, clientReceivedBalanceSubquery.clientId)
          )
          .where(whereClause);

        return rows.map((row) => ({
          ...row,
          received: Math.round(Number(row.received ?? 0)),
          balance: Math.round(Number(row.balance ?? 0)),
        }));
      } catch (error) {
        return { error: "Failed to load clients" };
      }
    },
    {
      auth: true,
      query: querySchema,
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
        return { error: "Failed to add client" };
      }
    },
    {
      body: clientSchema,
      auth: true,
    }
  )
  // GET /api/clients/:id - Get single client
  .get(
    "/:id",
    async ({ params: { id }, set, user }) => {
      try {
        const client = await db.query.clients.findFirst({
          where: { id: { eq: id }, userId: { eq: user.id } },
        });
        if (!client) {
          set.status = 404;
          return { error: "Client not found" };
        }
        return client;
      } catch (error) {
        console.error("Error loading client:", error);
        return { error: "Failed to load client" };
      }
    },
    {
      params: type({ id: cursorSchema }),
      auth: true,
    }
  )
  // PUT /api/clients/:id - Update client
  .put(
    "/:id",
    async ({ params: { id }, body, set, user }) => {
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
          set.status = 404;
          return { error: "Client not found" };
        }
        return updated;
      } catch (error) {
        console.error("Error updating client:", error);
        return { error: "Failed to update client" };
      }
    },
    {
      params: type({ id: cursorSchema }),
      body: clientSchema,

      auth: true,
    }
  )
  // PATCH /api/clients/:id - Update client status only
  .patch(
    "/:id",
    async ({ params: { id }, body, set, user }) => {
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
          set.status = 404;
          return { error: "Client not found" };
        }
        return updated;
      } catch (error) {
        console.log({ id });
        console.error("Error updating client status:", error);
        return { error: "Failed to update client status" };
      }
    },
    {
      params: type({ id: cursorSchema }),
      body: clientStatusSchema,
      auth: true,
    }
  )
  // DELETE /api/clients/:id - Delete client
  .delete(
    "/:id",
    async ({ params: { id }, set, user }) => {
      try {
        const [deleted] = await db
          .delete(clientsTable)
          .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, user.id)))
          .returning({ id: clientsTable.id });

        if (!deleted) {
          set.status = 404;
          return { error: "Client not found" };
        }
        return { success: true };
      } catch (error) {
        console.error("Error deleting client:", error);
        return { error: "Failed to delete client" };
      }
    },
    {
      params: type({ id: cursorSchema }),
      auth: true,
    }
  )
  // GET /api/clients/:id/invoices - Get client's invoices with total
  .get(
    "/:id/invoices",
    async ({ params: { id }, set, user }) => {
      try {
        const client = await db.query.clients.findFirst({
          where: { id: { eq: id }, userId: { eq: user.id } },
        });
        if (!client) {
          set.status = 404;
          return { error: "Client not found" };
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
        return { error: "Failed to load client invoices" };
      }
    },
    {
      params: type({ id: cursorSchema }),
      auth: true,
    }
  );
