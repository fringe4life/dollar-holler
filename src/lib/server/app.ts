import { Elysia, status } from "elysia";
import { auth } from "$lib/auth.server";
import { openApiPlugin } from "$lib/server/plugins/openapi-plugin";
import { clientsRoutes } from "$lib/server/routes/clients";
import { invoicesRoutes, lineItemsRoutes } from "$lib/server/routes/invoices";
import { settingsRoutes } from "$lib/server/routes/settings";
import { apiErrorBody } from "$lib/server/utils/api-error-body";
import { BadRequestError, UnauthorizedError } from "./utils/errors";

// Create Elysia app with all routes
export const app = new Elysia({ prefix: "/api" })
  .use(openApiPlugin)
  .error({
    UNAUTHORIZED: UnauthorizedError,
    BAD_REQUEST: BadRequestError,
  })
  .mount(auth.handler)
  .use(clientsRoutes)
  .use(invoicesRoutes)
  .use(lineItemsRoutes)
  .use(settingsRoutes)
  .onError(({ code, error }) => {
    switch (code) {
      case "VALIDATION":
        return status(400, apiErrorBody(error.message));
      case "BAD_REQUEST":
        return status(error.status, apiErrorBody(error.message));
      case "UNAUTHORIZED":
        return status(error.status, apiErrorBody(error.message));
      case "NOT_FOUND":
        return status(error.status, apiErrorBody(error.message || "Not found"));
      case "INTERNAL_SERVER_ERROR":
        return status(error.status, apiErrorBody(error.message));
      default:
        return status(
          500,
          apiErrorBody(
            error instanceof Error ? error.message : "Internal server error"
          )
        );
    }
  });
