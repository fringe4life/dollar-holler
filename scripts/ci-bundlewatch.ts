/**
 * Expand BundleWatch globs with Bun.Glob, then call the BundleWatch API.
 *
 * ponytail: bundlewatch@1.1 depends on glob@^7, which throws on cwd paths that
 * contain spaces (this repo’s local checkout). GitHub Actions runners do not.
 * Expanding here keeps local + CI green without forking BundleWatch.
 *
 * @see https://bundlewatch.io/guide/using-bundlewatch
 */
import bundlewatch, { type FileConfig } from "bundlewatch";
import config from "../bundlewatch.config.ts";

const rules = config.files;
if (!Array.isArray(rules) || rules.length === 0) {
  throw new Error("bundlewatch.config.ts: files must be a non-empty array");
}

const expanded: FileConfig[] = [];

for (const rule of rules) {
  if (typeof rule.path !== "string" || rule.path.length === 0) {
    throw new Error(
      "bundlewatch.config.ts: each file rule needs a non-empty path"
    );
  }
  const pattern = rule.path.replace(/^\.\//, "");
  const matches = [...new Bun.Glob(pattern).scanSync()];
  if (matches.length === 0) {
    // Keep the original pattern so BundleWatch reports "no matching file"
    expanded.push(rule);
    continue;
  }
  for (const match of matches) {
    const path = match.startsWith("./") ? match : `./${match}`;
    expanded.push({ ...rule, path });
  }
}

const result = await bundlewatch({
  ...config,
  files: expanded,
});

if (result.url) {
  console.log(`Result breakdown at: ${result.url}`);
}

if (result.status === "fail") {
  process.exit(1);
}
