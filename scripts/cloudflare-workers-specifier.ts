import fs from "node:fs";
import path from "node:path";

export const CLOUDFLARE_WORKERS = "cloudflare:workers";
export const SERVER_OUTPUT_DIR = path.resolve(".svelte-kit/output/server");

const quotedCloudflareWorkers = [
  `"${CLOUDFLARE_WORKERS}"`,
  `'${CLOUDFLARE_WORKERS}'`,
  `\`${CLOUDFLARE_WORKERS}\``,
] as const;

/** Adapter stub is `file://.../virtual-cloudflare-workers.js?<uuid>`. */
const VIRTUAL_STUB_URL_RE =
  /file:\/\/[^"'`\s]*virtual-cloudflare-workers\.js(?:\?[^"'`\s]*)?/g;

export const rewriteCloudflareWorkersSpecifier = (
  code: string,
  stub: string
): string => {
  const replacement = JSON.stringify(stub);
  let next = code;
  for (const quoted of quotedCloudflareWorkers) {
    next = next.replaceAll(quoted, replacement);
  }
  return next;
};

export const restoreCloudflareWorkersSpecifier = (
  code: string,
  stub?: string
): string => {
  let next = code;
  if (stub) {
    next = next.replaceAll(
      JSON.stringify(stub),
      JSON.stringify(CLOUDFLARE_WORKERS)
    );
    next = next.replaceAll(stub, CLOUDFLARE_WORKERS);
  }
  return next.replaceAll(VIRTUAL_STUB_URL_RE, CLOUDFLARE_WORKERS);
};

const visitJsFiles = (directory: string, onFile: (full: string) => void) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visitJsFiles(full, onFile);
      continue;
    }
    if (entry.name.endsWith(".js")) {
      onFile(full);
    }
  }
};

const transformJsFilesInDir = (
  directory: string,
  transform: (contents: string) => string
) => {
  if (!fs.existsSync(directory)) {
    return;
  }
  visitJsFiles(directory, (full) => {
    const contents = fs.readFileSync(full, "utf8");
    const next = transform(contents);
    if (next !== contents) {
      fs.writeFileSync(full, next);
    }
  });
};

export const stubCloudflareWorkersInDir = (directory: string, stub: string) => {
  transformJsFilesInDir(directory, (contents) =>
    rewriteCloudflareWorkersSpecifier(contents, stub)
  );
};

export const restoreCloudflareWorkersInDir = (
  directory: string,
  stub?: string
) => {
  transformJsFilesInDir(directory, (contents) =>
    restoreCloudflareWorkersSpecifier(contents, stub)
  );
};
