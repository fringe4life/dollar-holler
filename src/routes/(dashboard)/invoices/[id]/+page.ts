import { getInvoiceById } from "$lib/stores/InvoiceStore.svelte";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const { id } = params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    error(404, {
      message: "Invoice not found",
    });
  }

  return { invoice };
};
