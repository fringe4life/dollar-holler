import { describe, expect, it } from "bun:test";
import {
  CLOUDFLARE_WORKERS,
  restoreCloudflareWorkersSpecifier,
  rewriteCloudflareWorkersSpecifier,
} from "./cloudflare-workers-specifier.ts";

const STUB =
  "file:///workspace/node_modules/.bun/@sveltejs+adapter-cloudflare@8.0.0+test/node_modules/@sveltejs/adapter-cloudflare/src/virtual-cloudflare-workers.js?test-id";

describe("rewriteCloudflareWorkersSpecifier", () => {
  it("rewrites double, single, and backtick specifiers to the adapter stub", () => {
    expect(
      rewriteCloudflareWorkersSpecifier(
        `import { env } from "${CLOUDFLARE_WORKERS}";`,
        STUB
      )
    ).toBe(`import { env } from ${JSON.stringify(STUB)};`);
    expect(
      rewriteCloudflareWorkersSpecifier(
        `import { waitUntil } from '${CLOUDFLARE_WORKERS}';`,
        STUB
      )
    ).toBe(`import { waitUntil } from ${JSON.stringify(STUB)};`);
    expect(
      rewriteCloudflareWorkersSpecifier(
        `import { env } from \`${CLOUDFLARE_WORKERS}\`;`,
        STUB
      )
    ).toBe(`import { env } from ${JSON.stringify(STUB)};`);
  });
});

describe("restoreCloudflareWorkersSpecifier", () => {
  it("restores a quoted file:// stub from vite preview / generateBundle", () => {
    const code = `import {env} from ${JSON.stringify(STUB)};`;
    expect(restoreCloudflareWorkersSpecifier(code, STUB)).toBe(
      `import {env} from "${CLOUDFLARE_WORKERS}";`
    );
  });

  it("restores without the stub uuid after a new preview process", () => {
    const code = `import {waitUntil} from"${STUB}";`;
    expect(restoreCloudflareWorkersSpecifier(code)).toBe(
      `import {waitUntil} from"${CLOUDFLARE_WORKERS}";`
    );
  });

  it("is idempotent on protocol imports wrangler can bundle", () => {
    const code = `import { env } from "${CLOUDFLARE_WORKERS}";`;
    expect(restoreCloudflareWorkersSpecifier(code, STUB)).toBe(code);
    expect(restoreCloudflareWorkersSpecifier(code)).toBe(code);
  });
});
