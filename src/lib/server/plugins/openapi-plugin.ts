import { openapi } from "@elysiajs/openapi";
import type { OpenAPIV3 } from "openapi-types";
import { dev } from "$app/environment";
import {
  getBetterAuthOpenApiComponents,
  getBetterAuthOpenApiPaths,
} from "$lib/server/utils/better-auth-openapi";

const enabled = dev;

const betterAuthOpenApi = enabled
  ? await Promise.all([
      getBetterAuthOpenApiPaths(),
      getBetterAuthOpenApiComponents(),
    ])
  : undefined;

/** OpenAPI / Scalar docs for the Elysia API; Better Auth paths merged when `enabled` (dev). */
export const openApiPlugin = openapi({
  enabled,
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
          components: {
            ...(betterAuthOpenApi[1] as OpenAPIV3.ComponentsObject),
            securitySchemes: {
              ...(betterAuthOpenApi[1] as OpenAPIV3.ComponentsObject)
                .securitySchemes,
              /** Better Auth session token; use Authorize in Scalar/Swagger with a token from sign-in (`set-auth-token`). */
              betterAuthSession: {
                type: "http",
                scheme: "bearer",
              },
            },
          },
        }
      : {}),
  },
});
