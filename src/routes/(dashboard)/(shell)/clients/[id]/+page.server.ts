import { db } from "$lib/db";
import { tryCatch } from "$lib/utils/try-catch";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const { id } = params;

  if (!locals.user) {
    throw redirect(303, "/login");
  }

  const { data: client } = await tryCatch(() =>
    db.query.clients.findFirst({
      where: { id, userId: locals.user.id },
    })
  );

  if (!client) {
    throw error(404, { message: "Client not found" });
  }

  return { client };
};
