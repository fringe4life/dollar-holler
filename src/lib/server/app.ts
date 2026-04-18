import { dev } from "$app/environment";
import { apiErrorBody } from "$lib/server/api-response-schemas";
import { betterAuthPlugin } from "$lib/server/auth-plugin";
import { clientsRoutes } from "$lib/server/routes/clients";
import { invoicesRoutes, lineItemsRoutes } from "$lib/server/routes/invoices";
import { settingsRoutes } from "$lib/server/routes/settings";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia, status } from "elysia";
import type { OpenAPIV3 } from "openapi-types";

import { ENV } from "varlock/env";
import {
  getBetterAuthOpenApiComponents,
  getBetterAuthOpenApiPaths,
} from "./better-auth-openapi";

const openApiEnabled = dev || ENV.OPENAPI_ENABLE === true;

const betterAuthOpenApi = openApiEnabled
  ? await Promise.all([
      getBetterAuthOpenApiPaths(),
      getBetterAuthOpenApiComponents(),
    ])
  : undefined;
// Create Elysia app with all routes
export const app = new Elysia({ prefix: "/api" })
  .use(
    cors({
      origin: ENV.PUBLIC_BASE_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(
    openapi({
      enabled: openApiEnabled,
      documentation: {
        info: {
          title: "Dollar Holler API",
          version: "0.0.1",
          description:
            "Application API and Better Auth endpoints. Use session cookies from the browser or Bearer tokens where supported.",
        },
        tags: [
          {
            name: "Clients",
            description: "Client records, lists, and picker options",
          },
          { name: "Invoices", description: "Invoices and pagination" },
          { name: "Line items", description: "Invoice line items" },
          { name: "Settings", description: "Per-user application settings" },
          {
            name: "Better Auth",
            description: "Authentication and session endpoints",
          },
        ],
        ...(betterAuthOpenApi
          ? {
              paths: betterAuthOpenApi[0] as OpenAPIV3.PathsObject,
              components: betterAuthOpenApi[1] as OpenAPIV3.ComponentsObject,
            }
          : {}),
      },
    })
  )
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
