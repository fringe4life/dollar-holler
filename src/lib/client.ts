// client.ts
import { treaty } from "@elysiajs/eden";
import type { App } from "../routes/api/[...slugs]/+server";

const client = treaty<App>("localhost:5173");

export { client };
