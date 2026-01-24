import { betterAuthPlugin } from "$lib/elysia/auth-plugin";
import { clientsRoutes } from "$lib/elysia/routes/clients";
import { invoicesRoutes, lineItemsRoutes } from "$lib/elysia/routes/invoices";
import { settingsRoutes } from "$lib/elysia/routes/settings";
import { Elysia } from "elysia";

// Create Elysia app with all routes
const app = new Elysia({ prefix: "/api" })
  .use(betterAuthPlugin)
  .use(clientsRoutes)
  .use(invoicesRoutes)
  .use(lineItemsRoutes)
  .use(settingsRoutes)
  .onError(({ code, error, set }) => {
    // Handle errors consistently
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: error.message };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not found" };
    }
    set.status = 500;
    return { error: (error as Error).message || "Internal server error" };
  });

type RequestHandler = (v: { request: Request }) => Response | Promise<Response>;

export const fallback: RequestHandler = ({ request }) => app.handle(request);

export type App = typeof app;
