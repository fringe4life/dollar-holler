/**
 * Layout is `prerender` + `csr = false` (Ogygia shell; form is a wake island).
 * The island posts `?/remote=…` as a document POST. Alchemy's dev platform
 * throws on `platform.env.DB` for prerenderable routes, so Better Auth sees
 * no D1 and the remote returns 200 with "Signup failed". Dynamic SSR keeps
 * the Ogygia island and gives the POST a real DB binding.
 */
export const prerender = false;
