import { treaty } from "@elysiajs/eden/treaty2";
import { PUBLIC_BASE_URL } from "$env/static/public";
import type { App } from "../routes/api/[...slugs]/+server";
export const apiClient = treaty<App>(PUBLIC_BASE_URL || "localhost:5173").api;
