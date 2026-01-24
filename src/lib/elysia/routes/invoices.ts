import { Elysia, t } from "elysia";
import { db } from "$lib/db";
import {
  invoices as invoicesTable,
  lineItems as lineItemsTable,
} from "$lib/db/schema";
import { eq } from "drizzle-orm";

// Invoice validation schema
const invoiceSchema = t.Object({
  id: t.Optional(t.String()),
  userId: t.String(),
  invoiceNumber: t.String(),
  clientId: t.String(),
  subject: t.Optional(t.Nullable(t.String())),
  issueDate: t.String(),
  dueDate: t.String(),
  discount: t.Optional(t.Nullable(t.Number())),
  notes: t.Optional(t.Nullable(t.String())),
  terms: t.Optional(t.Nullable(t.String())),
  invoiceStatus: t.Optional(
    t.Nullable(
      t.Union([t.Literal("draft"), t.Literal("sent"), t.Literal("paid")])
    )
  ),
});

// Invoice with client and lineItems (for POST)
const invoiceWithRelationsSchema = t.Object({
  ...invoiceSchema.properties,
  client: t.Object({
    id: t.String(),
  }),
  lineItems: t.Optional(
    t.Array(
      t.Object({
        id: t.Optional(t.String()),
        userId: t.String(),
        description: t.String(),
        quantity: t.Number(),
        amount: t.Number(),
      })
    )
  ),
});

export const invoicesRoutes = new Elysia({ prefix: "/invoices" })
  // GET /api/invoices - List all invoices
  .get("/", async () => {
    try {
      const invoices = await db.select().from(invoicesTable);
      return invoices;
    } catch (error) {
      console.error("Error loading invoices:", error);
      return { error: "Failed to load invoices" };
    }
  })
  // POST /api/invoices - Create invoice (with line items)
  .post(
    "/",
    async ({ body }) => {
      try {
        const { lineItems, client, ...newInvoice } = body;

        const [inserted] = await db
          .insert(invoicesTable)
          .values({
            ...newInvoice,
            clientId: client.id,
          })
          .returning({ id: invoicesTable.id });

        // Note: Line items are handled in the line-items routes module
        // If lineItems are provided here, they should be created via the line-items endpoint
        // For now, we'll just return the invoice ID

        return { id: inserted.id };
      } catch (error) {
        console.error("Error adding invoice:", error);
        return { error: "Failed to add invoice" };
      }
    },
    {
      body: invoiceWithRelationsSchema,
    }
  )
  // GET /api/invoices/:id - Get single invoice
  .get(
    "/:id",
    async ({ params: { id } }) => {
      try {
        const invoice = await db
          .select()
          .from(invoicesTable)
          .where(eq(invoicesTable.id, id))
          .limit(1);

        if (invoice.length === 0) {
          return { error: "Invoice not found" };
        }

        return invoice[0];
      } catch (error) {
        console.error("Error loading invoice:", error);
        return { error: "Failed to load invoice" };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  // PUT /api/invoices/:id - Update invoice
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      try {
        const { lineItems, client, ...updateData } = body;

        const [updated] = await db
          .update(invoicesTable)
          .set({
            ...updateData,
            clientId: client?.id,
            updatedAt: new Date(),
          })
          .where(eq(invoicesTable.id, id))
          .returning();

        return updated;
      } catch (error) {
        console.error("Error updating invoice:", error);
        return { error: "Failed to update invoice" };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: invoiceWithRelationsSchema,
    }
  )
  // DELETE /api/invoices/:id - Delete invoice
  .delete(
    "/:id",
    async ({ params: { id } }) => {
      try {
        await db.delete(invoicesTable).where(eq(invoicesTable.id, id));
        return { success: true };
      } catch (error) {
        console.error("Error deleting invoice:", error);
        return { error: "Failed to delete invoice" };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  // Line items routes nested under invoices
  .group("/:id/line-items", (app) =>
    app
      // GET /api/invoices/:id/line-items - Get invoice line items
      .get(
        "/",
        async ({ params: { id } }) => {
          try {
            const lineItems = await db
              .select()
              .from(lineItemsTable)
              .where(eq(lineItemsTable.invoiceId, id));

            return lineItems;
          } catch (error) {
            console.error("Error loading line items:", error);
            return { error: "Failed to load line items" };
          }
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )
      // POST /api/invoices/:id/line-items - Create line items
      .post(
        "/",
        async ({ params: { id }, body }) => {
          try {
            const lineItems = await db
              .insert(lineItemsTable)
              .values(
                body.map((item: any) => ({
                  ...item,
                  invoiceId: id,
                }))
              )
              .returning();

            return lineItems;
          } catch (error) {
            console.error("Error creating line items:", error);
            return { error: "Failed to create line items" };
          }
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Array(
            t.Object({
              id: t.Optional(t.String()),
              userId: t.String(),
              description: t.String(),
              quantity: t.Number(),
              amount: t.Number(),
            })
          ),
        }
      )
      // PUT /api/invoices/:id/line-items - Replace line items
      .put(
        "/",
        async ({ params: { id }, body }) => {
          try {
            // First, delete existing line items for this invoice
            await db
              .delete(lineItemsTable)
              .where(eq(lineItemsTable.invoiceId, id));

            // Then insert the new ones
            const lineItems = await db
              .insert(lineItemsTable)
              .values(
                body.map((item: any) => ({
                  ...item,
                  invoiceId: id,
                }))
              )
              .returning();

            return lineItems;
          } catch (error) {
            console.error("Error updating line items:", error);
            return { error: "Failed to update line items" };
          }
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Array(
            t.Object({
              id: t.Optional(t.String()),
              userId: t.String(),
              description: t.String(),
              quantity: t.Number(),
              amount: t.Number(),
            })
          ),
        }
      )
  );
