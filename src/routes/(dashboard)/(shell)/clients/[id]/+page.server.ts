import { db } from "$lib/db";
import { cursorSchema } from "$lib/features/pagination/schemas";
import { tryCatch } from "$lib/utils/try-catch";
import { error, redirect } from "@sveltejs/kit";
import { ArkErrors } from "arktype";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const { id } = params;

  const parsedId = cursorSchema(id);
  if (parsedId instanceof ArkErrors) {
    throw error(400, { message: "Invalid client ID" });
  }

  if (!locals?.user) {
    throw redirect(303, "/login");
  }

  const { data: client } = await tryCatch(() =>
    db.query.clients.findFirst({
      where: { id: { eq: parsedId }, userId: { eq: locals?.user?.id } },
    })
  );

  if (!client) {
    throw error(404, { message: "Client not found" });
  }

  return { client };
};
