import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ data }) => ({
  theme: data.theme,
  user: data.user,
});
