// client.ts
import { PUBLIC_BASE_URL } from "$env/static/public";
import { treaty } from "@elysiajs/eden";
import type { App } from "../routes/api/[...slugs]/+server";
// Use same-origin in the browser so dev/preview/prod all work without hardcoding a port.
// On the server (SSR), fall back to PUBLIC_BASE_URL so treaty still has an absolute URL.
// const baseURL =
//   globalThis.window === undefined ? process.env.PUBLIC_BASE_URL : "";

const client = treaty<App>(PUBLIC_BASE_URL);

export { client };
