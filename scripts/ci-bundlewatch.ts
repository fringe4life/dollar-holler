/**
 * Expand BundleWatch globs with Bun.Glob, then call the BundleWatch API.
 *
 * ponytail: bundlewatch@1.1 depends on glob@^7, which throws on cwd paths that
 * contain spaces (this repo’s local checkout). GitHub Actions runners do not.
 * Expanding here keeps local + CI green without forking BundleWatch.
 *
 * @see https://bundlewatch.io/guide/using-bundlewatch
 */
import bundlewatch, {
  type BundlewatchConfig,
  type FileConfig,
} from "bundlewatch";
import config from "../bundlewatch.config.mjs";

const base = config as BundlewatchConfig;
const rules = base.files ?? [];
const expanded: FileConfig[] = [];

for (const rule of rules) {
  const pattern = rule.path.replace(/^\.\//, "");
  const matches = [...new Bun.Glob(pattern).scanSync()];
  if (matches.length === 0) {
    // Keep the original pattern so BundleWatch reports "no matching file"
    expanded.push(rule);
    continue;
  }
  for (const match of matches) {
    const path = match.startsWith("./") ? match : `./${match}`;
    expanded.push({
      path,
      maxSize: rule.maxSize,
      compression: rule.compression,
    });
  }
}

const result = await bundlewatch({
  ...base,
  files: expanded,
});

if (result.url) {
  console.log(`Result breakdown at: ${result.url}`);
}

if (result.status === "fail") {
  process.exit(1);
}
