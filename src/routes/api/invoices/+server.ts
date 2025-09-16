import { db } from "$lib/db";
import {
  clients as clientsTable,
  invoices as invoicesTable,
  lineItems as lineItemsTable,
} from "$lib/db/schema";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  try {
    const invoiceData = await db
      .select()
      .from(invoicesTable)
      .leftJoin(clientsTable, eq(invoicesTable.clientId, clientsTable.id))
      .leftJoin(lineItemsTable, eq(invoicesTable.id, lineItemsTable.invoiceId));

    // Transform the data to match the expected Invoice structure
    const transformedInvoices = invoiceData.reduce((acc, row) => {
      const existingInvoice = acc.find((i) => i.id === row.invoices.id);
      if (existingInvoice) {
        if (
          row.line_items &&
          !existingInvoice.lineItems?.find((li) => li.id === row.line_items!.id)
        ) {
          existingInvoice.lineItems = [
            ...(existingInvoice.lineItems || []),
            row.line_items!,
          ];
        }
      } else {
        acc.push({
          ...row.invoices,
          client: row.clients!,
          lineItems: row.line_items ? [row.line_items] : [],
        });
      }
      return acc;
    }, [] as any[]);

    return json(transformedInvoices);
  } catch (error) {
    console.error("Error loading invoices:", error);
    return json({ error: "Failed to load invoices" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const invoiceToAdd = await request.json();
    const { lineItems, client, ...newInvoice } = invoiceToAdd;
    const invoiceId = crypto.randomUUID();

    // Add invoice to database
    await db.insert(invoicesTable).values({
      ...newInvoice,
      id: invoiceId,
      clientId: client.id,
    });

    // Add line items
    if (lineItems && lineItems.length > 0) {
      const newLineItems = lineItems.map((lineItem: any) => ({
        ...lineItem,
        id: crypto.randomUUID(),
        invoiceId,
      }));

      await db.insert(lineItemsTable).values(newLineItems);
    }

    return json({ id: invoiceId });
  } catch (error) {
    console.error("Error adding invoice:", error);
    return json({ error: "Failed to add invoice" }, { status: 500 });
  }
};
