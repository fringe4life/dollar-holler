import { db } from "$lib/db";
import { invoices as invoicesTable, lineItems as lineItemsTable } from "$lib/db/schema";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  try {
    const invoices = await db.query.invoices.findMany({
      with: {
        client: true,
        lineItems: true,
      },
    });
    return json(invoices);
  } catch (error) {
    console.error("Error loading invoices:", error);
    return json({ error: "Failed to load invoices" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const invoiceToAdd = await request.json();
    const { lineItems, client, ...newInvoice } = invoiceToAdd;

    const [inserted] = await db
      .insert(invoicesTable)
      .values({
        ...newInvoice,
        clientId: client.id,
      })
      .returning({ id: invoicesTable.id });

    if (lineItems && lineItems.length > 0) {
      await db.insert(lineItemsTable).values(
        lineItems.map((li: any) => ({ ...li, invoiceId: inserted.id }))
      );
    }

    return json({ id: inserted.id });
  } catch (error) {
    console.error("Error adding invoice:", error);
    return json({ error: "Failed to add invoice" }, { status: 500 });
  }
};
