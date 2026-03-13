import { db } from "$lib/db";
import { markdownToHtml } from "$lib/utils/markdown";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  const invoice = await db.query.invoices.findFirst({
    where: { id },
  });

  if (!invoice) {
    error(404, { message: "Invoice not found" });
  }

  const [client, lineItems] = await Promise.all([
    db.query.clients.findFirst({
      where: { id: invoice.clientId },
    }),
    db.query.lineItems.findMany({
      where: { invoiceId: invoice.id },
    }),
  ]);

  const notesHtml = invoice.notes ? markdownToHtml(invoice.notes) : "";
  const termsHtml = invoice.terms ? markdownToHtml(invoice.terms) : "";

  return {
    invoice,
    client,
    lineItems,
    notesHtml,
    termsHtml,
  };
};
