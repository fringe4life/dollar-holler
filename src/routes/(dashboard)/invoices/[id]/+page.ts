import { clientsStore } from "$lib/stores/clientsStore.svelte";
import { invoicesStore } from "$lib/stores/invoicesStore.svelte";
import { lineItemsStore } from "$lib/stores/lineItemsStore.svelte";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const { id } = params;
  const invoice = await invoicesStore.loadInvoiceById(id);

  if (!invoice) {
    error(404, {
      message: "Invoice not found",
    });
  }

  // Return promises without awaiting - enables parallel fetching and streaming
  return {
    invoice,
    clientPromise: clientsStore.getClientById(invoice.clientId),
    lineItemsPromise: lineItemsStore.loadLineItemsByInvoiceId(invoice.id),
  };
};
