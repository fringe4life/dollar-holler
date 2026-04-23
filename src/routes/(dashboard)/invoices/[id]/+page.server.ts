import { error, redirect } from "@sveltejs/kit";
import { ArkErrors } from "arktype";
import { cursorSchema } from "$features/pagination/schemas.server";
import { db } from "$lib/server/db";
import { markdownToHtml } from "$lib/utils/markdown.server";
import { tryCatch } from "$lib/utils/try-catch";
import type { PageServerLoad } from "./$types";
export const load: PageServerLoad = async ({ params, locals }) => {
  const { id } = params;
  if (!locals?.user?.id) {
    throw redirect(303, "/login");
  }

  const parsedId = cursorSchema(id);
  if (parsedId instanceof ArkErrors) {
    throw error(400, { message: "Invalid invoice ID" });
  }

  const { data: invoice } = await tryCatch(() =>
    db.query.invoices.findFirst({
      where: { id: { eq: parsedId }, userId: { eq: locals?.user?.id } },
    })
  );

  if (!invoice) {
    throw error(404, { message: "Invoice not found" });
  }

  const [{ data: client }, { data: lineItems }] = await Promise.all([
    tryCatch(() =>
      db.query.clients.findFirst({
        where: {
          id: { eq: invoice.clientId },
          userId: locals?.user?.id,
        },
      })
    ),
    tryCatch(() =>
      db.query.lineItems.findMany({
        where: {
          invoiceId: { eq: invoice.id },
          userId: locals?.user?.id,
        },
      })
    ),
  ]);

  const notesHtml = markdownToHtml(invoice?.notes);
  const termsHtml = markdownToHtml(invoice?.terms);

  return {
    invoice,
    client,
    lineItems,
    notesHtml,
    termsHtml,
  };
};
