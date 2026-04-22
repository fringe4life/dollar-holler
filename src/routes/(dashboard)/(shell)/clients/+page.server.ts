import { fetchPaginatedClients } from "$features/clients/queries/clients-list.server";
import { normalizeListQueryFromUrl } from "$features/pagination/utils/list-query";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) {
    throw error(401, "Unauthorized");
  }

  const { normalized, listCursorWasNormalized } =
    normalizeListQueryFromUrl(url);
  try {
    const result = await fetchPaginatedClients(user.id, normalized);
    return {
      ...result,
      listCursorWasNormalized,
    };
  } catch {
    throw error(500, "Failed to load clients");
  }
};
