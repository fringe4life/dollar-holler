/* eslint-disable new-cap */
import { fetchPaginatedInvoices } from "$lib/features/invoices/queries/invoices-list.server";
import { invoicePaginatedListSchema } from "$lib/features/invoices/schemas";
import { db } from "$lib/server/db";
import {
  invoices as invoicesTable,
  lineItems as lineItemsTable,
} from "$lib/server/db/schema";
import {
  apiErrorBodySchema,
  deleteSuccessSchema,
  idResponseSchema,
  invoiceInsertSchema,
  invoiceSelectSchema,
  invoiceUpdateSchema,
  lineItemEditRowSchema,
  lineItemInsertSchema,
  lineItemSelectSchema,
} from "$lib/server/schemas";
import { type } from "arktype";
import { and, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { protectedApiPlugin } from "../plugins/auth-plugin";
import { listQueryPlugin } from "../plugins/list-query-plugin";
import { InternalServerError, NotFoundError } from "../utils/errors";

export const invoicesRoutes = new Elysia({ prefix: "/invoices" })
  .use(protectedApiPlugin)
  .use(listQueryPlugin)
  .guard({
    detail: {
      tags: ["Invoices"],
    },
  })
  // GET /api/invoices - List invoices with client name and total (cursor pagination)
  .get(
    "/",
    async ({ user, normalized }) => {
      try {
        return await fetchPaginatedInvoices(user.id, normalized);
      } catch (error) {
        console.error("Error loading invoices:", error);
        throw new InternalServerError("Failed to load invoices");
      }
    },
    {
      auth: true,
      listQuery: true,
      detail: {
        operationId: "listInvoices",
        summary: "List invoices",
        description:
          "Cursor-paginated invoices for the authenticated user (includes client name and totals). Supports `cursor`, `direction`, `limit`, and optional `q`.",
      },
      response: {
        200: invoicePaginatedListSchema,
        401: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // POST /api/invoices - Create invoice
  .post(
    "/",
    async ({ body, user }) => {
      try {
        const [inserted] = await db
          .insert(invoicesTable)
          .values({
            ...body,
            userId: user.id,
          })
          .returning();

        return inserted;
      } catch (error) {
        console.error("Error adding invoice:", error);
        throw new InternalServerError("Failed to add invoice");
      }
    },
    {
      body: invoiceInsertSchema,
      authMutation: true,
      detail: {
        operationId: "createInvoice",
        summary: "Create invoice",
        description:
          "Creates an invoice owned by the authenticated user. Returns the full inserted row.",
      },
      response: {
        200: invoiceSelectSchema,
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
          throw new NotFoundError("Invoice not found");
        }
        return invoice;
      } catch (error) {
        if (error instanceof NotFoundError) throw error;
        console.error("Error loading invoice:", error);
        throw new InternalServerError("Failed to load invoice");
      }
    },
    {
      params: idResponseSchema,
      auth: true,
      detail: {
        operationId: "getInvoice",
        summary: "Get invoice by id",
        description:
          "Returns one invoice if it exists and belongs to the authenticated user; otherwise 404.",
      },
      response: {
        200: invoiceSelectSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // PATCH /api/invoices/:id - Update invoice
  .patch(
    "/:id",
    async ({ params: { id }, body, user }) => {
      try {
        const [updated] = await db
          .update(invoicesTable)
          .set({
            ...body,
            invoiceStatus: body.invoiceStatus ?? "draft",
          })
          .where(
            and(eq(invoicesTable.id, id), eq(invoicesTable.userId, user.id))
          )
          .returning({ id: invoicesTable.id });

        if (!updated) {
          throw new NotFoundError("Invoice not found");
        }
        return updated;
      } catch (error) {
        if (error instanceof NotFoundError) throw error;
        console.error("Error updating invoice:", error);
        throw new InternalServerError("Failed to update invoice");
      }
    },
    {
      params: idResponseSchema,
      body: invoiceUpdateSchema,
      authMutation: true,
      detail: {
        operationId: "patchInvoice",
        summary: "Update invoice",
        description:
          "Partial update; `invoiceStatus` defaults to draft when omitted. Returns only `{ id }` on success. Missing or non-owned invoice returns 404.",
      },
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
          throw new NotFoundError("Invoice not found");
        }
        return { success: true as const };
      } catch (error) {
        if (error instanceof NotFoundError) throw error;
        console.error("Error deleting invoice:", error);
        throw new InternalServerError("Failed to delete invoice");
      }
    },
    {
      params: idResponseSchema,
      authMutation: true,
      detail: {
        operationId: "deleteInvoice",
        summary: "Delete invoice",
        description:
          "Deletes the invoice if it belongs to the authenticated user. Missing invoice returns 404.",
      },
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
      .guard({
        detail: {
          tags: ["Line items"],
        },
      })
      // GET /api/invoices/:id/line-items - Get invoice line items
      .get(
        "/",
        async ({ params: { id }, user }) => {
          try {
            return await db.query.lineItems.findMany({
              where: {
                invoiceId: { eq: id },
                userId: { eq: user.id },
              },
            });
          } catch (error) {
            console.error("Error loading line items:", error);
            throw new InternalServerError("Failed to load line items");
          }
        },
        {
          params: idResponseSchema,
          verifyInvoiceGet: true,
          detail: {
            operationId: "listInvoiceLineItems",
            summary: "List line items for invoice",
            description:
              "All line item columns for the invoice. Path `id` is the invoice id. Returns 404 if the invoice does not exist or is not owned by the user.",
          },
          response: {
            200: lineItemSelectSchema.array(),
            401: apiErrorBodySchema,
            404: apiErrorBodySchema,
            500: apiErrorBodySchema,
          },
        }
      )
      // GET /api/invoices/:id/line-items/edit — id, description, quantity, amount only
      .get(
        "/edit",
        async ({ params: { id }, user }) => {
          try {
            const rows = await db.query.lineItems.findMany({
              where: {
                invoiceId: { eq: id },
                userId: { eq: user.id },
              },
              columns: {
                id: true,
                description: true,
                quantity: true,
                amount: true,
              },
            });
            return rows;
          } catch (error) {
            console.error("Error loading line items for edit:", error);
            throw new InternalServerError("Failed to load line items");
          }
        },
        {
          params: idResponseSchema,
          verifyInvoiceGet: true,
          detail: {
            operationId: "listInvoiceLineItemsForEdit",
            summary: "Line items for edit form",
            description:
              "Returns id, description, quantity, and amount only—suitable for editing UI. Path `id` is the invoice id. Returns 404 if the invoice does not exist or is not owned by the user.",
          },
          response: {
            200: lineItemEditRowSchema.array(),
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
            const items = body.lineItems.map(({ id: _lid, ...item }) => ({
              ...item,
              invoiceId: id,
              userId: user.id,
            }));
            return await db.insert(lineItemsTable).values(items).returning();
          } catch (error) {
            console.error("Error creating line items:", error);
            throw new InternalServerError("Failed to create line items");
          }
        },
        {
          params: idResponseSchema,
          body: type({ lineItems: lineItemInsertSchema.array().required() }),
          verifyInvoiceMutation: true,
          detail: {
            operationId: "createInvoiceLineItems",
            summary: "Create line items on invoice",
            description:
              "Inserts one or more line items for the invoice. Path `id` is the invoice id. Returns 404 if the invoice does not exist or is not owned by the user.",
          },
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
                  userId: user.id,
                  invoiceId: id,
                }))
              )
              .returning();
          } catch (error) {
            console.error("Error updating line items:", error);
            throw new InternalServerError("Failed to update line items");
          }
        },
        {
          params: idResponseSchema,
          body: type({ lineItems: lineItemInsertSchema.array().required() }),
          verifyInvoiceMutation: true,
          detail: {
            operationId: "replaceInvoiceLineItems",
            summary: "Replace all line items on invoice",
            description:
              "Deletes existing line items for the invoice, then inserts the provided set. Path `id` is the invoice id. Returns 404 if the invoice does not exist or is not owned by the user.",
          },
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
  .use(protectedApiPlugin)
  .guard({
    detail: {
      tags: ["Line items"],
    },
  })
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
        throw new InternalServerError("Failed to load line items");
      }
    },
    {
      auth: true,
      detail: {
        operationId: "listAllLineItems",
        summary: "List all line items",
        description:
          "Returns every line item belonging to the authenticated user across all invoices.",
      },
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
          throw new NotFoundError("Line item not found");
        }
        return { success: true as const };
      } catch (error) {
        if (error instanceof NotFoundError) throw error;
        console.error("Error deleting line item:", error);
        throw new InternalServerError("Failed to delete line item");
      }
    },
    {
      params: idResponseSchema,
      authMutation: true,
      detail: {
        operationId: "deleteLineItem",
        summary: "Delete line item",
        description:
          "Deletes a single line item by id if it belongs to the authenticated user. Missing line item returns 404.",
      },
      response: {
        200: deleteSuccessSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  );
