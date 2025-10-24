import { db } from "$lib/db";
import { lineItems as lineItemsTable } from "$lib/db/schema";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  try {
    const lineItems = await db
      .select()
      .from(lineItemsTable)
      .where(eq(lineItemsTable.invoiceId, params.id));

    return json(lineItems);
  } catch (error) {
    console.error("Error loading line items:", error);
    return json({ error: "Failed to load line items" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const lineItemsData = await request.json();
    
    const lineItems = await db
      .insert(lineItemsTable)
      .values(
        lineItemsData.map((item: any) => ({
          ...item,
          invoiceId: params.id,
        }))
      )
      .returning();

    return json(lineItems);
  } catch (error) {
    console.error("Error creating line items:", error);
    return json({ error: "Failed to create line items" }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const lineItemsData = await request.json();
    
    // First, delete existing line items for this invoice
    await db.delete(lineItemsTable).where(eq(lineItemsTable.invoiceId, params.id));
    
    // Then insert the new ones
    const lineItems = await db
      .insert(lineItemsTable)
      .values(
        lineItemsData.map((item: any) => ({
          ...item,
          invoiceId: params.id,
        }))
      )
      .returning();

    return json(lineItems);
  } catch (error) {
    console.error("Error updating line items:", error);
    return json({ error: "Failed to update line items" }, { status: 500 });
  }
};
