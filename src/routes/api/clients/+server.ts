import { db } from "$lib/db";
import { clients as clientsTable } from "$lib/db/schema";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  try {
    const clients = await db.query.clients.findMany({
      with: {
        invoices: {
          with: {
            lineItems: true,
          },
        },
      },
    });

    return json(clients);
  } catch (error) {
    console.error("Error loading clients:", error);
    return json({ error: "Failed to load clients" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const clientToAdd = await request.json();

    const [inserted] = await db
      .insert(clientsTable)
      .values({
        ...clientToAdd,
        clientStatus: "active",
      })
      .returning({ id: clientsTable.id });

    return json({ id: inserted.id });
  } catch (error) {
    console.error("Error adding client:", error);
    return json({ error: "Failed to add client" }, { status: 500 });
  }
};
