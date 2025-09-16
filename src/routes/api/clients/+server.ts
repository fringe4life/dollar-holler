import { db } from '$lib/db';
import { clients as clientsTable, invoices as invoicesTable, lineItems as lineItemsTable } from '$lib/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const clientData = await db
			.select()
			.from(clientsTable)
			.leftJoin(invoicesTable, eq(clientsTable.id, invoicesTable.clientId))
			.leftJoin(lineItemsTable, eq(invoicesTable.id, lineItemsTable.invoiceId));

		// Transform the data to match the expected Client structure
		const transformedClients = clientData.reduce((acc, row) => {
			const existingClient = acc.find((c) => c.id === row.clients.id);
			if (existingClient) {
				if (
					row.invoices &&
					!existingClient.invoice?.find(
						(i) => i.id === row.invoices!.id,
					)
				) {
					existingClient.invoice = [
						...(existingClient.invoice || []),
						row.invoices!,
					];
				}
			} else {
				acc.push({
					...row.clients,
					invoice: row.invoices ? [row.invoices] : [],
				});
			}
			return acc;
		}, [] as any[]);

		return json(transformedClients);
	} catch (error) {
		console.error('Error loading clients:', error);
		return json({ error: 'Failed to load clients' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const clientToAdd = await request.json();
		const id = crypto.randomUUID();

		await db.insert(clientsTable).values({
			...clientToAdd,
			id,
			clientStatus: 'active',
		});

		return json({ id });
	} catch (error) {
		console.error('Error adding client:', error);
		return json({ error: 'Failed to add client' }, { status: 500 });
	}
};
