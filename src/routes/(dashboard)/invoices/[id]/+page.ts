import { getClientById } from "$lib/stores/clientsStore.svelte";
import { loadInvoiceById } from "$lib/stores/invoicesStore.svelte";
import { loadLineItemsByInvoiceId } from "$lib/stores/lineItemsStore.svelte";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const { id } = params;
  const invoice = await loadInvoiceById(id);

  if (!invoice) {
    error(404, {
      message: "Invoice not found",
    });
  }

  // Return promises without awaiting - enables parallel fetching and streaming
  return {
    invoice,
    clientPromise: getClientById(invoice.clientId),
    lineItemsPromise: loadLineItemsByInvoiceId(invoice.id),
  };
};
