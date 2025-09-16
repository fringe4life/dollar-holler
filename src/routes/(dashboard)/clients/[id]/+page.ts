import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
export const load: PageLoad = async ({ params, fetch }) => {
  const { id } = params;
  const response = await fetch(`/api/clients/${id}`);

  if (!response.ok) {
    error(404, {
      message: "Client not found",
    });
  }

  const client = await response.json();
  return { client };
};
