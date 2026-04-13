import { auth } from "$lib/auth";

type OpenApiDoc = Awaited<ReturnType<typeof auth.api.generateOpenAPISchema>>;

let cached: OpenApiDoc | undefined;

async function loadSchema(): Promise<OpenApiDoc> {
  cached ??= await auth.api.generateOpenAPISchema();
  return cached;
}

/** Public URL prefix for Better Auth (default base path). */
const BETTER_AUTH_PATH_PREFIX = "/api/auth";

/**
 * Better Auth paths from `generateOpenAPISchema`, keyed by full path (e.g. `/api/auth/sign-in`).
 * Each operation is tagged `Better Auth` for Scalar grouping.
 */
export async function getBetterAuthOpenApiPaths(): Promise<
  NonNullable<OpenApiDoc["paths"]>
> {
  const { paths } = await loadSchema();
  const out: Record<string, unknown> = Object.create(null);
  for (const path of Object.keys(paths)) {
    const key = `${BETTER_AUTH_PATH_PREFIX}${path}`;
    const pathItem = paths[path];
    out[key] = pathItem;
    if (pathItem && typeof pathItem === "object") {
      for (const method of Object.keys(pathItem)) {
        const op = (pathItem as Record<string, unknown>)[method];
        if (op && typeof op === "object") {
          (op as { tags: string[] }).tags = ["Better Auth"];
        }
      }
    }
  }
  return out as NonNullable<OpenApiDoc["paths"]>;
}

export async function getBetterAuthOpenApiComponents(): Promise<
  OpenApiDoc["components"]
> {
  const { components } = await loadSchema();
  return components;
}
