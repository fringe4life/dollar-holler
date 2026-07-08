import { type } from "arktype";
import { and, eq } from "drizzle-orm";
import { Elysia, InternalServerError, NotFoundError } from "elysia";
import { fetchPaginatedInvoices } from "$features/invoices/queries/invoices-list.server";
import {
  invoiceInsertSchema,
  invoicePaginatedListSchema,
  invoiceSelectSchema,
  invoiceUpdateSchema,
} from "$features/invoices/schemas.server";
import {
  lineItemEditRowSchema,
  lineItemInsertSchema,
  lineItemSelectSchema,
} from "$features/line-items/schemas.server";
import { db } from "$lib/server/db";
import {
  invoices as invoicesTable,
  lineItems as lineItemsTable,
} from "$lib/server/db/schema";
import {
  apiErrorBodySchema,
  deleteSuccessSchema,
  idResponseSchema,
} from "$lib/server/schemas";
import { stripNullishEntries } from "$lib/utils/strip-nullish-entries";
import { protectedApiPlugin } from "../plugins/auth-plugin";
import { listQueryPlugin } from "../plugins/list-query-plugin";

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
      detail: {
        description:
          "Cursor-paginated invoices for the authenticated user (includes client name and totals). Supports `cursor`, `direction`, `limit`, and optional `q`.",
        operationId: "listInvoices",
        summary: "List invoices",
      },
      listQuery: true,
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
    async ({ body, user, invoiceNotesTermsHtmlAugment }) => {
      try {
        const [inserted] = await db
          .insert(invoicesTable)
          .values({
            ...body,
            ...invoiceNotesTermsHtmlAugment,
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
      detail: {
        description:
          "Creates an invoice owned by the authenticated user. Returns the full inserted row.",
        operationId: "createInvoice",
        summary: "Create invoice",
      },
      invoiceInsertNotesTermsHtmlAugment: true,
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
        if (error instanceof NotFoundError) {
          throw error;
        }
        console.error("Error loading invoice:", error);
        throw new InternalServerError("Failed to load invoice");
      }
    },
    {
      auth: true,
      detail: {
        description:
          "Returns one invoice if it exists and belongs to the authenticated user; otherwise 404.",
        operationId: "getInvoice",
        summary: "Get invoice by id",
      },
      params: idResponseSchema,
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
    async ({ params: { id }, body, user, invoiceNotesTermsHtmlAugment }) => {
      try {
        const setPayload = {
          ...stripNullishEntries({
            ...body,
          }),
          ...invoiceNotesTermsHtmlAugment,
        };
        const [updated] = await db
          .update(invoicesTable)
          .set(setPayload)
          .where(
            and(eq(invoicesTable.id, id), eq(invoicesTable.userId, user.id))
          )
          .returning({ id: invoicesTable.id });

        if (!updated) {
          throw new NotFoundError("Invoice not found");
        }
        return updated;
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        console.error("Error updating invoice:", error);
        throw new InternalServerError("Failed to update invoice");
      }
    },
    {
      body: invoiceUpdateSchema,
      detail: {
        description:
          "Partial update; omitted fields are left unchanged (including `invoiceStatus`). When `invoiceStatus` is set, only draft→sent, sent→paid, or a no-op same value is allowed. Returns only `{ id }` on success. Missing or non-owned invoice returns 404.",
        operationId: "patchInvoice",
        summary: "Update invoice",
      },
      params: idResponseSchema,
      response: {
        200: idResponseSchema,
        400: apiErrorBodySchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
      verifyInvoicePatchMutation: true,
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
        if (error instanceof NotFoundError) {
          throw error;
        }
        console.error("Error deleting invoice:", error);
        throw new InternalServerError("Failed to delete invoice");
      }
    },
    {
      authMutation: true,
      detail: {
        description:
          "Deletes the invoice if it belongs to the authenticated user. Missing invoice returns 404.",
        operationId: "deleteInvoice",
        summary: "Delete invoice",
      },
      params: idResponseSchema,
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
          detail: {
            description:
              "All line item columns for the invoice. Path `id` is the invoice id. Returns 404 if the invoice does not exist or is not owned by the user.",
            operationId: "listInvoiceLineItems",
            summary: "List line items for invoice",
          },
          params: idResponseSchema,
          response: {
            200: lineItemSelectSchema.array(),
            401: apiErrorBodySchema,
            404: apiErrorBodySchema,
            500: apiErrorBodySchema,
          },
          verifyInvoiceGet: true,
        }
      )
      // GET /api/invoices/:id/line-items/edit — id, description, quantity, amount only
      .get(
        "/edit",
        async ({ params: { id }, user }) => {
          try {
            const rows = await db.query.lineItems.findMany({
              columns: {
                amount: true,
                description: true,
                id: true,
                quantity: true,
              },
              where: {
                invoiceId: { eq: id },
                userId: { eq: user.id },
              },
            });
            return rows;
          } catch (error) {
            console.error("Error loading line items for edit:", error);
            throw new InternalServerError("Failed to load line items");
          }
        },
        {
          detail: {
            description:
              "Returns id, description, quantity, and amount only—suitable for editing UI. Path `id` is the invoice id. Returns 404 if the invoice does not exist or is not owned by the user.",
            operationId: "listInvoiceLineItemsForEdit",
            summary: "Line items for edit form",
          },
          params: idResponseSchema,
          response: {
            200: lineItemEditRowSchema.array(),
            401: apiErrorBodySchema,
            404: apiErrorBodySchema,
            500: apiErrorBodySchema,
          },
          verifyInvoiceGet: true,
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
          body: type({ lineItems: lineItemInsertSchema.array().required() }),
          detail: {
            description:
              "Inserts one or more line items for the invoice. Path `id` is the invoice id. Returns 404 if the invoice does not exist or is not owned by the user.",
            operationId: "createInvoiceLineItems",
            summary: "Create line items on invoice",
          },
          params: idResponseSchema,
          response: {
            200: lineItemSelectSchema.array(),
            401: apiErrorBodySchema,
            404: apiErrorBodySchema,
            500: apiErrorBodySchema,
          },
          verifyInvoiceMutation: true,
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
                  invoiceId: id,
                  userId: user.id,
                }))
              )
              .returning();
          } catch (error) {
            console.error("Error updating line items:", error);
            throw new InternalServerError("Failed to update line items");
          }
        },
        {
          body: type({ lineItems: lineItemInsertSchema.array().required() }),
          detail: {
            description:
              "Deletes existing line items for the invoice, then inserts the provided set. Path `id` is the invoice id. Returns 404 if the invoice does not exist or is not owned by the user.",
            operationId: "replaceInvoiceLineItems",
            summary: "Replace all line items on invoice",
          },
          params: idResponseSchema,
          response: {
            200: lineItemSelectSchema.array(),
            401: apiErrorBodySchema,
            404: apiErrorBodySchema,
            500: apiErrorBodySchema,
          },
          verifyInvoiceMutation: true,
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
        description:
          "Returns every line item belonging to the authenticated user across all invoices.",
        operationId: "listAllLineItems",
        summary: "List all line items",
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
        if (error instanceof NotFoundError) {
          throw error;
        }
        console.error("Error deleting line item:", error);
        throw new InternalServerError("Failed to delete line item");
      }
    },
    {
      authMutation: true,
      detail: {
        description:
          "Deletes a single line item by id if it belongs to the authenticated user. Missing line item returns 404.",
        operationId: "deleteLineItem",
        summary: "Delete line item",
      },
      params: idResponseSchema,
      response: {
        200: deleteSuccessSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  );
