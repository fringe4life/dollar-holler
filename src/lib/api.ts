import { treaty } from "@elysiajs/eden/treaty2";
// import { PUBLIC_BASE_URL } from "$env/static/public";
import type { App } from "../routes/api/[...slugs]/+server";
import { ENV } from "varlock/env";

export const apiClient = treaty<App>(ENV.PUBLIC_BASE_URL).api;
// code for server version
// import { treaty } from "@elysiajs/eden/treaty2";

// const apiServer = treaty(ENV.PUBLIC_BASE_URL).api;

// export { apiServer };
