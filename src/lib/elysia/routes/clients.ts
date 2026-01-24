import { db } from "$lib/db";
import {
  clients as clientsTable,
  invoices as invoicesTable,
} from "$lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";

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
  // GET /api/clients - List all clients
  .get("/", async () => {
    try {
      const clients = await db.select().from(clientsTable);
      return clients;
    } catch (error) {
      console.error("Error loading clients:", error);
      return { error: "Failed to load clients" };
    }
  })
  // POST /api/clients - Create client (with upsert on conflict)
  .post(
    "/",
    async ({ body }) => {
      try {
        const [inserted] = await db
          .insert(clientsTable)
          .values({
            ...body,
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
    }
  )
  // GET /api/clients/:id - Get single client
  .get(
    "/:id",
    async ({ params: { id } }) => {
      try {
        const client = await db
          .select()
          .from(clientsTable)
          .where(eq(clientsTable.id, id))
          .limit(1);

        if (client.length === 0) {
          return { error: "Client not found" };
        }

        return client[0];
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
    }
  )
  // GET /api/clients/:id/invoices - Get client's invoices
  .get(
    "/:id/invoices",
    async ({ params: { id } }) => {
      try {
        const invoices = await db
          .select()
          .from(invoicesTable)
          .where(eq(invoicesTable.clientId, id));

        return invoices;
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
