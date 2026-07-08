import { openapi } from "@elysiajs/openapi";
import type { OpenAPIV3 } from "openapi-types";
import { dev } from "$app/env";
import {
  getBetterAuthOpenApiComponents,
  getBetterAuthOpenApiPaths,
} from "$lib/server/utils/better-auth-openapi";

const enabled = dev ?? false;

const betterAuthOpenApi = enabled
  ? await Promise.all([
      getBetterAuthOpenApiPaths(),
      getBetterAuthOpenApiComponents(),
    ])
  : undefined;

/** OpenAPI / Scalar docs for the Elysia API; Better Auth paths merged when `enabled` (dev). */
export const openApiPlugin = openapi({
  documentation: {
    info: {
      description:
        "Application API and Better Auth endpoints. Use session cookies from the browser or Bearer tokens where supported.",
      title: "Dollar Holler API",
      version: "0.0.1",
    },
    tags: [
      {
        description: "Client records, lists, and picker options",
        name: "Clients",
      },
      { description: "Invoices and pagination", name: "Invoices" },
      { description: "Invoice line items", name: "Line items" },
      { description: "Per-user application settings", name: "Settings" },
      {
        description: "Authentication and session endpoints",
        name: "Better Auth",
      },
    ],
    ...(betterAuthOpenApi
      ? {
          components: {
            ...(betterAuthOpenApi[1] as OpenAPIV3.ComponentsObject),
            securitySchemes: {
              ...(betterAuthOpenApi[1] as OpenAPIV3.ComponentsObject)
                .securitySchemes,
              /** Better Auth session token; use Authorize in Scalar/Swagger with a token from sign-in (`set-auth-token`). */
              betterAuthSession: {
                scheme: "bearer",
                type: "http",
              },
            },
          },
          paths: betterAuthOpenApi[0] as OpenAPIV3.PathsObject,
        }
      : {}),
  },
  enabled,
});
