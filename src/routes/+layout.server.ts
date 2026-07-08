import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals: { user }, cookies }) => ({
  cookies: cookies.getAll(),
  user,
});
