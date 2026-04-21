import {
  fetchClientInvoiceSummary,
  fetchPaginatedInvoicesForClient,
} from "$lib/features/invoices/queries/invoices-list.server";
import { cursorSchema } from "$lib/features/pagination/schemas";
import { normalizeListQueryFromUrl } from "$lib/features/pagination/utils/list-query";
import { db } from "$lib/server/db";
import { tryCatch } from "$lib/utils/try-catch";
import { error, redirect } from "@sveltejs/kit";
import { ArkErrors } from "arktype";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals, url }) => {
  const { id } = params;

  const parsedId = cursorSchema(id);
  if (parsedId instanceof ArkErrors) {
    throw error(400, { message: "Invalid client ID" });
  }

  if (!locals?.user) {
    throw redirect(303, "/login");
  }

  const user = locals.user;

  const { data: client } = await tryCatch(() =>
    db.query.clients.findFirst({
      where: { id: { eq: parsedId }, userId: { eq: user.id } },
    })
  );

  if (!client) {
    throw error(404, { message: "Client not found" });
  }

  const { normalized, listCursorWasNormalized } =
    normalizeListQueryFromUrl(url);

  try {
    const [listResult, summary] = await Promise.all([
      fetchPaginatedInvoicesForClient(user.id, parsedId, normalized),
      fetchClientInvoiceSummary(user.id, parsedId, normalized.q),
    ]);

    return {
      client,
      items: listResult.items,
      paginationMetadata: listResult.paginationMetadata,
      summary,
      listCursorWasNormalized,
    };
  } catch {
    throw error(500, { message: "Failed to load client invoices" });
  }
};
