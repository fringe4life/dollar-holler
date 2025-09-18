import { db } from "$lib/db";
import { clients as clientsTable } from "$lib/db/schema";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;
    const client = await db.query.clients.findFirst({
      where: (clients, { eq }) => eq(clients.id, id),
      with: { invoices: { with: { lineItems: true } } },
    });
    if (!client) return json({ error: "Client not found" }, { status: 404 });
    return json(client);
  } catch (error) {
    console.error("Error getting client by ID:", error);
    return json({ error: "Failed to get client" }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const { id } = params;
    const clientToUpdate = await request.json();
    const { invoice, ...newClient } = clientToUpdate;

    await db.update(clientsTable).set(newClient).where(eq(clientsTable.id, id));

    return json({ success: true });
  } catch (error) {
    console.error("Error updating client:", error);
    return json({ error: "Failed to update client" }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;
    await db.delete(clientsTable).where(eq(clientsTable.id, id));
    return json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return json({ error: "Failed to delete client" }, { status: 500 });
  }
};
