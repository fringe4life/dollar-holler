import adapter from "@sveltejs/adapter-vercel";
import type { Config } from "@sveltejs/kit";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config: Config = {
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    alias: {
      $features: "./src/lib/features",
      $lib: "./src/lib",
      "styled-system": "./styled-system/*",
    },
    typescript: {
      config: (config) => ({
        ...config,
        include: [
          ...config.include,
          "./drizzle.config.ts",
          "../styled-system/*",
        ],
      }),
    },
  },
  compilerOptions: {
    experimental: {
      async: true,
    },
    runes: ({ filename }) =>
      // biome-ignore lint/performance/useTopLevelRegex: we need to split the filename by / or \
      filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
  },
};

export default config;
