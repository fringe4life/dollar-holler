import { apiErrorBody } from "$lib/server/api-response-schemas";
import { betterAuthPlugin } from "$lib/server/auth-plugin";
import { clientsRoutes } from "$lib/server/routes/clients";
import { invoicesRoutes, lineItemsRoutes } from "$lib/server/routes/invoices";
import { settingsRoutes } from "$lib/server/routes/settings";
import { Elysia, status } from "elysia";

// Create Elysia app with all routes
const app = new Elysia({ prefix: "/api" })
  .use(betterAuthPlugin)
  .use(clientsRoutes)
  .use(invoicesRoutes)
  .use(lineItemsRoutes)
  .use(settingsRoutes)
  .onError(({ code, error }) => {
    if (code === "VALIDATION") {
      return status(400, apiErrorBody(error.message));
    }
    if (code === "NOT_FOUND") {
      return status(404, apiErrorBody("Not found"));
    }
    return status(
      500,
      apiErrorBody(
        error instanceof Error ? error.message : "Internal server error"
      )
    );
  });

type RequestHandler = (v: { request: Request }) => Response | Promise<Response>;

export const fallback: RequestHandler = ({ request }) => app.handle(request);

export type App = typeof app;
