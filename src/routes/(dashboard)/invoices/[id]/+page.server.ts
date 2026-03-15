import { db } from "$lib/db";
import { markdownToHtml } from "$lib/utils/markdown.server";
import { tryCatch } from "$lib/utils/try-catch";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const { id } = params;

  if (!locals.user) {
    throw redirect(303, "/login");
  }

  const { data: invoice } = await tryCatch(() =>
    db.query.invoices.findFirst({
      where: { id, userId: locals.user.id },
    })
  );

  if (!invoice) {
    throw error(404, { message: "Invoice not found" });
  }

  const [{ data: client }, { data: lineItems }] = await Promise.all([
    tryCatch(() =>
      db.query.clients.findFirst({
        where: { id: invoice.clientId, userId: locals.user.id },
      })
    ),
    tryCatch(() =>
      db.query.lineItems.findMany({
        where: { invoiceId: invoice.id, userId: locals.user.id },
      })
    ),
  ]);

  const notesHtml = invoice.notes ? markdownToHtml(invoice.notes) : null;
  const termsHtml = invoice.terms ? markdownToHtml(invoice.terms) : null;

  return {
    invoice,
    client,
    lineItems,
    notesHtml,
    termsHtml,
  };
};
