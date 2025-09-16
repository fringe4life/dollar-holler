import { db } from '$lib/db';
import { clients as clientsTable, invoices as invoicesTable, lineItems as lineItemsTable } from '$lib/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;
		const invoiceData = await db
			.select()
			.from(invoicesTable)
			.where(eq(invoicesTable.id, id))
			.leftJoin(clientsTable, eq(invoicesTable.clientId, clientsTable.id))
			.leftJoin(lineItemsTable, eq(invoicesTable.id, lineItemsTable.invoiceId));

		if (invoiceData.length === 0) {
			return json({ error: 'Invoice not found' }, { status: 404 });
		}

		// Transform the data to match the expected Invoice structure
		const invoice = invoiceData[0].invoices;
		const client = invoiceData[0].clients!;
		const lineItems = invoiceData
			.filter((row) => row.line_items)
			.map((row) => row.line_items!);

		return json({
			...invoice,
			client,
			lineItems,
		});
	} catch (error) {
		console.error('Error getting invoice by ID:', error);
		return json({ error: 'Failed to get invoice' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const { id } = params;
		const invoiceToUpdate = await request.json();
		const { lineItems, client, ...updatedInvoice } = invoiceToUpdate;

		// Delete all line items
		await db
			.delete(lineItemsTable)
			.where(eq(lineItemsTable.invoiceId, id));

		// Add new line items
		if (lineItems && lineItems.length > 0) {
			const newLineItems = lineItems.map((lineItem: any) => ({
				...lineItem,
				id: crypto.randomUUID(),
				invoiceId: id,
			}));

			await db.insert(lineItemsTable).values(newLineItems);
		}

		// Update invoice
		await db
			.update(invoicesTable)
			.set({ ...updatedInvoice, clientId: client.id })
			.where(eq(invoicesTable.id, id));

		return json({ success: true });
	} catch (error) {
		console.error('Error updating invoice:', error);
		return json({ error: 'Failed to update invoice' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		// Delete all line items first
		await db
			.delete(lineItemsTable)
			.where(eq(lineItemsTable.invoiceId, id));

		// Delete the invoice
		await db.delete(invoicesTable).where(eq(invoicesTable.id, id));

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting invoice:', error);
		return json({ error: 'Failed to delete invoice' }, { status: 500 });
	}
};
