import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// import adapter from "svelte-adapter-bun";
/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    experimental: {
      instrumentation: {
        server: true,
      },
      tracing: {
        server: true,
      },
    },
    alias: {
      $features: "./src/lib/features",
      $lib: "./src/lib",
      "styled-system": "./styled-system",
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
