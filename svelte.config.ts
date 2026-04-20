import adapter from "@sveltejs/adapter-vercel";
import type { Config } from "@sveltejs/kit";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
const config: Config = {
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    alias: { $utils: "./src/utils" },
    typescript: {
      config: (config) => ({
        ...config,
        include: [...config.include, "./drizzle.config.ts"],
      }),
    },
  },
  compilerOptions: {
    experimental: {
      async: true,
    },
    runes: ({ filename }) =>
      filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
  },
};

export default config;
