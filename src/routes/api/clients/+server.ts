import { db } from "$lib/db";
import { clients as clientsTable } from "$lib/db/schema";
import { json } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
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
      })
      .onConflictDoUpdate({
        target: clientsTable.id,
        set: {
          userId: sql`excluded.user_id`,
          name: sql`excluded.name`,
          email: sql`excluded.email`,
          street: sql`excluded.street`,
          city: sql`excluded.city`,
          state: sql`excluded.state`,
          zip: sql`excluded.zip`,
          clientStatus: sql`excluded.client_status`,
        },
      })
      .returning({ id: clientsTable.id });

    return json({ id: inserted.id });
  } catch (error) {
    console.error("Error adding client:", error);
    return json({ error: "Failed to add client" }, { status: 500 });
  }
};
