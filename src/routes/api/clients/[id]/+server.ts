import { db } from '$lib/db';
import { clients as clientsTable, invoices as invoicesTable, lineItems as lineItemsTable } from '$lib/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;
		const clientData = await db
			.select()
			.from(clientsTable)
			.where(eq(clientsTable.id, id))
			.leftJoin(invoicesTable, eq(clientsTable.id, invoicesTable.clientId))
			.leftJoin(lineItemsTable, eq(invoicesTable.id, lineItemsTable.invoiceId));

		if (clientData.length === 0) {
			return json({ error: 'Client not found' }, { status: 404 });
		}

		// Transform the data to match the expected Client structure
		const client = clientData[0].clients;
		const invoices = clientData
			.filter((row) => row.invoices)
			.map((row) => row.invoices!)
			.reduce(
				(acc, invoice) => {
					const existing = acc.find((i) => i.id === invoice.id);
					if (!existing) {
						acc.push({
							...invoice,
							client: { id: client.id, name: client.name },
							lineItems: clientData
								.filter(
									(row) => row.line_items && row.invoices?.id === invoice.id,
								)
								.map((row) => row.line_items!),
						});
					}
					return acc;
				},
				[] as any[],
			);

		return json({
			...client,
			invoice: invoices,
		});
	} catch (error) {
		console.error('Error getting client by ID:', error);
		return json({ error: 'Failed to get client' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const { id } = params;
		const clientToUpdate = await request.json();
		const { invoice, ...newClient } = clientToUpdate;

		await db
			.update(clientsTable)
			.set(newClient)
			.where(eq(clientsTable.id, id));

		return json({ success: true });
	} catch (error) {
		console.error('Error updating client:', error);
		return json({ error: 'Failed to update client' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;
		await db.delete(clientsTable).where(eq(clientsTable.id, id));
		return json({ success: true });
	} catch (error) {
		console.error('Error deleting client:', error);
		return json({ error: 'Failed to delete client' }, { status: 500 });
	}
};
