import { treaty } from "@elysiajs/eden/treaty2";
import type { App } from "../routes/api/[...slugs]/+server";

export const apiClient = treaty<App>("localhost:5173").api;
