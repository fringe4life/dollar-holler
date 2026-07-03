import { treaty } from "@elysiajs/eden/treaty2";
import { ENV } from "varlock/env";
import type { App } from "../routes/api/[...slugs]/+server";
export const apiClient = treaty<App>(
  ENV.PUBLIC_BASE_URL || "localhost:5173"
).api;
