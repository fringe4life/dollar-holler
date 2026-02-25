import adapter from "@sveltejs/adapter-vercel";
import type { Config } from "@sveltejs/kit";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config: Config = {
  extensions: [".svelte"],
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    alias: { $utils: "./src/utils" },
  },
  compilerOptions: {
    experimental: {
      async: true,
    },
  },
};

export default config;
