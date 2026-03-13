/* eslint-disable new-cap */
import { db } from "$lib/db";
import {
  clients as clientsTable,
  invoices as invoicesTable,
} from "$lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { betterAuthPlugin } from "../auth-plugin";
import { clientReceivedBalanceSubquery } from "../clientListHelpers";
import {
  lineItemsTotalSubquery,
  mapRowsWithTotal,
} from "../invoiceListHelpers";

// Client validation schema
const clientSchema = t.Object({
  id: t.Optional(t.String()),
  userId: t.String(),
  name: t.String(),
  email: t.Optional(t.Nullable(t.String())),
  street: t.Optional(t.Nullable(t.String())),
  city: t.Optional(t.Nullable(t.String())),
  state: t.Optional(t.Nullable(t.String())),
  zip: t.Optional(t.Nullable(t.String())),
  clientStatus: t.Optional(
    t.Nullable(t.Union([t.Literal("active"), t.Literal("archive")]))
  ),
});

export const clientsRoutes = new Elysia({ prefix: "/clients" })
  .use(betterAuthPlugin)
  // GET /api/clients - List all clients with received and balance
  .get("/", async () => {
    try {
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
        );

      return rows.map((row) => ({
        ...row,
        received: Number(row.received ?? 0),
        balance: Number(row.balance ?? 0),
      }));
    } catch (error) {
      return { error: "Failed to load clients" };
    }
  })
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
    async ({ params: { id }, set }) => {
      try {
        const client = await db.query.clients.findFirst({
          where: { id },
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
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  // PUT /api/clients/:id - Update client
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      try {
        const [updated] = await db
          .update(clientsTable)
          .set({
            ...body,
            updatedAt: new Date(),
          })
          .where(eq(clientsTable.id, id))
          .returning();

        return updated;
      } catch (error) {
        console.error("Error updating client:", error);
        return { error: "Failed to update client" };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: clientSchema,

      auth: true,
    }
  )
  // DELETE /api/clients/:id - Delete client
  .delete(
    "/:id",
    async ({ params: { id } }) => {
      try {
        await db.delete(clientsTable).where(eq(clientsTable.id, id));
        return { success: true };
      } catch (error) {
        console.error("Error deleting client:", error);
        return { error: "Failed to delete client" };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      auth: true,
    }
  )
  // GET /api/clients/:id/invoices - Get client's invoices with total
  .get(
    "/:id/invoices",
    async ({ params: { id } }) => {
      try {
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
          .where(eq(invoicesTable.clientId, id));

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
      params: t.Object({
        id: t.String(),
      }),
    }
  );
