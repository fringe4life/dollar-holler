// client.ts
import { PUBLIC_BASE_URL } from "$env/static/public";
import { treaty } from "@elysiajs/eden";
import type { App } from "../routes/api/[...slugs]/+server";

const client = treaty<App>(PUBLIC_BASE_URL);

export { client };
