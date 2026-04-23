import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ data }) => ({
  session: data.session,
  user: data.user,
});
