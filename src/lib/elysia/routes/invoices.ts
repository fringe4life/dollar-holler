/* eslint-disable new-cap */
import { db } from "$lib/db";
import { cursorSchema } from "$lib/db/id";
import {
  clients as clientsTable,
  invoices as invoicesTable,
  lineItems as lineItemsTable,
} from "$lib/db/schema";
import { type } from "arktype";
import { and, eq, ilike, or } from "drizzle-orm";
import { Elysia } from "elysia";
import { betterAuthPlugin } from "../auth-plugin";
import {
  lineItemsTotalSubquery,
  mapRowsWithTotal,
} from "../invoiceListHelpers";

const invoiceSchema = type({
  id: cursorSchema.optional(),
  userId: "string",
  invoiceNumber: "string",
  clientId: "string",
  subject: "string?",
  issueDate: "string.date.parse",
  dueDate: "string.date.parse",
  discount: "number?",
  notes: "string?",
  terms: "string?",
  "invoiceStatus?": "'draft' | 'sent' | 'paid' | null | undefined",
});

const lineItemSchema = type({
  id: cursorSchema.optional(),
  userId: "string",
  description: "string",
  quantity: "number",
  amount: "number",
});

const newLineItemSchema = type({
  "id?": "string",
  userId: "string",
  description: "string",
  quantity: "number",
  amount: "number > 0",
});

const lineItemsSchema = type({ lineItems: lineItemSchema.array().optional() });

const invoiceWithRelationsSchema = invoiceSchema
  .merge({
    client: type({ id: "string" }),
  })
  .and(lineItemsSchema);

export const invoicesRoutes = new Elysia({ prefix: "/invoices" })
  .use(betterAuthPlugin)
  // GET /api/invoices - List all invoices with client name and total (single query)
  .get(
    "/",
    async ({ user, query }) => {
      try {
        const baseWhere = eq(invoicesTable.userId, user.id);
        const searchWhere = query.q?.trim()
          ? or(
              ilike(invoicesTable.invoiceNumber, `%${query.q.trim()}%`),
              ilike(invoicesTable.subject, `%${query.q.trim()}%`),
              ilike(invoicesTable.invoiceStatus, `%${query.q.trim()}%`),
              ilike(clientsTable.name, `%${query.q.trim()}%`)
            )
          : undefined;

        const whereClause = searchWhere
          ? and(baseWhere, searchWhere)
          : baseWhere;

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
          .where(whereClause);

        const withTotal = mapRowsWithTotal(rows);
        return withTotal.map((row) => {
          const { clientName, ...rest } = row;
          return {
            ...rest,
            client: { name: clientName ?? "Unknown" },
          };
        });
      } catch (_) {
        return { error: "Failed to load invoices" };
      }
    },
    {
      auth: true,
      query: type({
        q: "string?",
      }),
    }
  )
  // POST /api/invoices - Create invoice (with line items)
  .post(
    "/",
    async ({ body, user }) => {
      try {
        const { client, lineItems, ...invoice } = body;

        const [inserted] = await db
          .insert(invoicesTable)
          .values({
            ...invoice,
            clientId: client.id,
            userId: user.id,
            issueDate: new Date(invoice.issueDate),
            dueDate: new Date(invoice.dueDate),
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
      auth: true,
    }
  )
  // GET /api/invoices/:id - Get single invoice
  .get(
    "/:id",
    async ({ params: { id }, set, user }) => {
      try {
        const invoice = await db.query.invoices.findFirst({
          where: { id: { eq: id }, userId: { eq: user.id } },
        });
        if (!invoice) {
          set.status = 404;
          return { error: "Invoice not found" };
        }
        return invoice;
      } catch (error) {
        return { error: "Failed to load invoice" };
      }
    },
    {
      params: type({ id: cursorSchema }),
      auth: true,
    }
  )
  // PUT /api/invoices/:id - Update invoice
  .put(
    "/:id",
    async ({ params: { id }, body, set, user }) => {
      try {
        const { lineItems, client, ...updateData } = body;

        const [updated] = await db
          .update(invoicesTable)
          .set({
            ...updateData,
            clientId: client.id,
            updatedAt: new Date(),
            issueDate: new Date(updateData.issueDate),
            dueDate: new Date(updateData.dueDate),
          })
          .where(
            and(eq(invoicesTable.id, id), eq(invoicesTable.userId, user.id))
          )
          .returning();

        if (!updated) {
          set.status = 404;
          return { error: "Invoice not found" };
        }
        return updated;
      } catch (error) {
        console.error("Error updating invoice:", error);
        return { error: "Failed to update invoice" };
      }
    },
    {
      params: type({ id: cursorSchema }),
      body: invoiceWithRelationsSchema,
      auth: true,
    }
  )
  // DELETE /api/invoices/:id - Delete invoice
  .delete(
    "/:id",
    async ({ params: { id }, set, user }) => {
      try {
        const [deleted] = await db
          .delete(invoicesTable)
          .where(
            and(eq(invoicesTable.id, id), eq(invoicesTable.userId, user.id))
          )
          .returning({ id: invoicesTable.id });

        if (!deleted) {
          set.status = 404;
          return { error: "Invoice not found" };
        }
        return { success: true };
      } catch (error) {
        console.error("Error deleting invoice:", error);
        return { error: "Failed to delete invoice" };
      }
    },
    {
      params: type({ id: cursorSchema }),
      auth: true,
    }
  )
  // Line items routes nested under invoices
  .group("/:id/line-items", (app) =>
    app
      // GET /api/invoices/:id/line-items - Get invoice line items
      .get(
        "/",
        async ({ params: { id }, set, user }) => {
          try {
            const invoice = await db.query.invoices.findFirst({
              where: { id: { eq: id }, userId: { eq: user.id } },
            });
            if (!invoice) {
              set.status = 404;
              return { error: "Invoice not found" };
            }
            return await db.query.lineItems.findMany({
              where: {
                invoiceId: { eq: id },
                userId: { eq: user.id },
              },
            });
          } catch (error) {
            console.error("Error loading line items:", error);
            return { error: "Failed to load line items" };
          }
        },
        {
          params: type({ id: cursorSchema }),
          auth: true,
        }
      )
      // POST /api/invoices/:id/line-items - Create line items
      .post(
        "/",
        async ({ params: { id }, body, set, user }) => {
          try {
            const invoice = await db.query.invoices.findFirst({
              where: { id: { eq: id }, userId: { eq: user.id } },
            });
            if (!invoice) {
              set.status = 404;
              return { error: "Invoice not found" };
            }
            const items = body.lineItems.map(({ id, ...item }) => ({
              ...item,
              invoiceId: invoice.id,
              userId: user.id,
            }));
            return await db.insert(lineItemsTable).values(items).returning();
          } catch (error) {
            console.error("Error creating line items:", error);
            return { error: "Failed to create line items" };
          }
        },
        {
          params: type({ id: cursorSchema }),
          body: type({ lineItems: newLineItemSchema.array().required() }),
          auth: true,
        }
      )
      // PUT /api/invoices/:id/line-items - Replace line items
      .put(
        "/",
        async ({ params: { id }, body, set, user }) => {
          try {
            const invoice = await db.query.invoices.findFirst({
              where: { id: { eq: id }, userId: { eq: user.id } },
            });
            if (!invoice) {
              set.status = 404;
              return { error: "Invoice not found" };
            }

            // First, delete existing line items for this invoice
            await db
              .delete(lineItemsTable)
              .where(
                and(
                  eq(lineItemsTable.invoiceId, id),
                  eq(lineItemsTable.userId, user.id)
                )
              );

            // Then insert the new ones
            return await db
              .insert(lineItemsTable)
              .values(
                body.lineItems.map((item) => ({
                  ...item,
                  invoiceId: id,
                  userId: user.id,
                }))
              )
              .returning();
          } catch (error) {
            console.error("Error updating line items:", error);
            return { error: "Failed to update line items" };
          }
        },
        {
          params: type({ id: cursorSchema }),
          body: type({ lineItems: lineItemSchema.array().required() }),
          auth: true,
        }
      )
  );

// Standalone line items routes (not nested under invoices)
export const lineItemsRoutes = new Elysia({ prefix: "/line-items" })
  .use(betterAuthPlugin)
  // GET /api/line-items - List all line items (for admin purposes)
  .get(
    "/",
    async ({ user }) => {
      try {
        return await db.query.lineItems.findMany({
          where: { userId: user.id },
        });
      } catch (error) {
        console.error("Error loading line items:", error);
        return { error: "Failed to load line items" };
      }
    },
    { auth: true }
  )
  // DELETE /api/line-items/:id - Delete a specific line item
  .delete(
    "/:id",
    async ({ params: { id }, set, user }) => {
      try {
        const [deleted] = await db
          .delete(lineItemsTable)
          .where(
            and(eq(lineItemsTable.id, id), eq(lineItemsTable.userId, user.id))
          )
          .returning({ id: lineItemsTable.id });

        if (!deleted) {
          set.status = 404;
          return { error: "Line item not found" };
        }
        return { success: true };
      } catch (error) {
        console.error("Error deleting line item:", error);
        return { error: "Failed to delete line item" };
      }
    },
    {
      params: type({ id: cursorSchema }),
      auth: true,
    }
  );
