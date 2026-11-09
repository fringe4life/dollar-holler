/**
 * Same as signup: layout `csr = false` island posts `?/remote=…`, which needs
 * a live `platform.env.DB` (not Alchemy's prerender env guard).
 */
export const prerender = false;
