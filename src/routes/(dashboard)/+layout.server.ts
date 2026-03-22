import { resolve } from "$app/paths";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent }) => {
  const { user, session } = await parent();
  if (!user || !session) {
    throw redirect(303, resolve("/login"));
  }
  return { user, session };
};
