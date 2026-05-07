import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals: { user }, cookies }) => ({
  user,
  cookies: cookies.getAll(),
});
