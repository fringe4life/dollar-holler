/* eslint-disable new-cap */
import { db } from "$lib/db";
import {
  invoices as invoicesTable,
  lineItems as lineItemsTable,
} from "$lib/db/schema";
import {
  invoicePaginatedListSchema,
  invoiceSchema,
  invoiceUpsertBodySchema,
} from "$lib/features/invoices/schemas";
import {
  lineItemSchema,
  newLineItemSchema,
} from "$lib/features/line-items/schemas/schemas";
import { listQueryWireSchema } from "$lib/features/pagination/schemas";
import { fetchPaginatedInvoices } from "$lib/features/pagination/utils/invoices-list.server";
import { normalizeListQuery } from "$lib/features/pagination/utils/list-query";
import {
  apiErrorBodySchema,
  deleteSuccessSchema,
  idResponseSchema,
} from "$lib/server/api-response-schemas";
import { invoiceSelectSchema, lineItemSelectSchema } from "$lib/validators";
import { type } from "arktype";
import { and, eq } from "drizzle-orm";
import { Elysia, status } from "elysia";
import { betterAuthPlugin } from "../auth-plugin";

export const invoicesRoutes = new Elysia({ prefix: "/invoices" })
  .use(betterAuthPlugin)
  // GET /api/invoices - List invoices with client name and total (cursor pagination)
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
        return await fetchPaginatedInvoices(user.id, normalized);
      } catch (_) {
        return status(500, { message: "Failed to load invoices" });
      }
    },
    {
      auth: true,
      query: listQueryWireSchema,
      response: {
        200: invoicePaginatedListSchema,
        401: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // POST /api/invoices - Create invoice (with line items)
  .post(
    "/",
    async ({ body, user }) => {
      try {
        const { lineItems: _lineItems, ...invoice } = body;

        const [inserted] = await db
          .insert(invoicesTable)
          .values({
            ...invoice,
            userId: user.id,
            issueDate: new Date(invoice.issueDate),
            dueDate: new Date(invoice.dueDate),
          })
          .returning({ id: invoicesTable.id });

        return { id: inserted.id };
      } catch (error) {
        console.error("Error adding invoice:", error);
        return status(500, { message: "Failed to add invoice" });
      }
    },
    {
      body: invoiceUpsertBodySchema,
      auth: true,
      response: {
        200: idResponseSchema,
        401: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // GET /api/invoices/:id - Get single invoice
  .get(
    "/:id",
    async ({ params: { id }, user }) => {
      try {
        const invoice = await db.query.invoices.findFirst({
          where: { id: { eq: id }, userId: { eq: user.id } },
        });
        if (!invoice) {
          return status(404, { message: "Invoice not found" });
        }
        return invoice;
      } catch (error) {
        return status(500, { message: "Failed to load invoice" });
      }
    },
    {
      params: idResponseSchema,
      auth: true,
      response: {
        200: invoiceSelectSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // PUT /api/invoices/:id - Update invoice
  .put(
    "/:id",
    async ({ params: { id }, body, user }) => {
      try {
        const [updated] = await db
          .update(invoicesTable)
          .set({
            ...body,
            updatedAt: new Date(),
            issueDate: new Date(body.issueDate),
            dueDate: new Date(body.dueDate),
            invoiceStatus: body.invoiceStatus ?? "draft",
          })
          .where(
            and(eq(invoicesTable.id, id), eq(invoicesTable.userId, user.id))
          )
          .returning();

        if (!updated) {
          return status(404, { message: "Invoice not found" });
        }
        return { id: updated.id };
      } catch (error) {
        console.error("Error updating invoice:", error);
        return status(500, { message: "Failed to update invoice" });
      }
    },
    {
      params: idResponseSchema,
      body: invoiceSchema,
      auth: true,
      response: {
        200: idResponseSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // DELETE /api/invoices/:id - Delete invoice
  .delete(
    "/:id",
    async ({ params: { id }, user }) => {
      try {
        const [deleted] = await db
          .delete(invoicesTable)
          .where(
            and(eq(invoicesTable.id, id), eq(invoicesTable.userId, user.id))
          )
          .returning({ id: invoicesTable.id });

        if (!deleted) {
          return status(404, { message: "Invoice not found" });
        }
        return { success: true as const };
      } catch (error) {
        console.error("Error deleting invoice:", error);
        return status(500, { message: "Failed to delete invoice" });
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
  // Line items routes nested under invoices
  .group("/:id/line-items", (app) =>
    app
      // GET /api/invoices/:id/line-items - Get invoice line items
      .get(
        "/",
        async ({ params: { id }, user }) => {
          try {
            const invoice = await db.query.invoices.findFirst({
              where: { id: { eq: id }, userId: { eq: user.id } },
            });
            if (!invoice) {
              return status(404, { message: "Invoice not found" });
            }
            return await db.query.lineItems.findMany({
              where: {
                invoiceId: { eq: id },
                userId: { eq: user.id },
              },
            });
          } catch (error) {
            console.error("Error loading line items:", error);
            return status(500, { message: "Failed to load line items" });
          }
        },
        {
          params: idResponseSchema,
          auth: true,
          response: {
            200: lineItemSelectSchema.array(),
            401: apiErrorBodySchema,
            404: apiErrorBodySchema,
            500: apiErrorBodySchema,
          },
        }
      )
      // POST /api/invoices/:id/line-items - Create line items
      .post(
        "/",
        async ({ params: { id }, body, user }) => {
          try {
            const invoice = await db.query.invoices.findFirst({
              where: { id: { eq: id }, userId: { eq: user.id } },
            });
            if (!invoice) {
              return status(404, { message: "Invoice not found" });
            }
            const items = body.lineItems.map(({ id: _lid, ...item }) => ({
              ...item,
              invoiceId: invoice.id,
              userId: user.id,
            }));
            return await db.insert(lineItemsTable).values(items).returning();
          } catch (error) {
            console.error("Error creating line items:", error);
            return status(500, { message: "Failed to create line items" });
          }
        },
        {
          params: idResponseSchema,
          body: type({ lineItems: newLineItemSchema.array().required() }),
          auth: true,
          response: {
            200: lineItemSelectSchema.array(),
            401: apiErrorBodySchema,
            404: apiErrorBodySchema,
            500: apiErrorBodySchema,
          },
        }
      )
      // PUT /api/invoices/:id/line-items - Replace line items
      .put(
        "/",
        async ({ params: { id }, body, user }) => {
          try {
            const invoice = await db.query.invoices.findFirst({
              where: { id: { eq: id }, userId: { eq: user.id } },
            });
            if (!invoice) {
              return status(404, { message: "Invoice not found" });
            }

            await db
              .delete(lineItemsTable)
              .where(
                and(
                  eq(lineItemsTable.invoiceId, id),
                  eq(lineItemsTable.userId, user.id)
                )
              );

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
            return status(500, { message: "Failed to update line items" });
          }
        },
        {
          params: idResponseSchema,
          body: type({ lineItems: lineItemSchema.array().required() }),
          auth: true,
          response: {
            200: lineItemSelectSchema.array(),
            401: apiErrorBodySchema,
            404: apiErrorBodySchema,
            500: apiErrorBodySchema,
          },
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
        return status(500, { message: "Failed to load line items" });
      }
    },
    {
      auth: true,
      response: {
        200: lineItemSelectSchema.array(),
        401: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // DELETE /api/line-items/:id - Delete a specific line item
  .delete(
    "/:id",
    async ({ params: { id }, user }) => {
      try {
        const [deleted] = await db
          .delete(lineItemsTable)
          .where(
            and(eq(lineItemsTable.id, id), eq(lineItemsTable.userId, user.id))
          )
          .returning({ id: lineItemsTable.id });

        if (!deleted) {
          return status(404, { message: "Line item not found" });
        }
        return { success: true as const };
      } catch (error) {
        console.error("Error deleting line item:", error);
        return status(500, { message: "Failed to delete line item" });
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
  );
