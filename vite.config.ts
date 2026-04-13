import { varlockVitePlugin } from "@varlock/vite-integration";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
// Chrome DevTools workspace (com.chrome.devtools.json); not the same as Vite 8's optional @vitejs/devtools
// (build analysis UI, build-only for now — see https://devtools.vite.dev/guide). No migration required.
import devToolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  plugins: [
    varlockVitePlugin({ ssrInjectMode: "auto-load" }),
    tailwindcss(),
    sveltekit(),
    devToolsJson(),
  ],
  preview: {
    port: 5173,
  },
  build: {
    rolldownOptions: {
      output: { minify: { compress: { dropConsole: true } } },
    },
  },
});
