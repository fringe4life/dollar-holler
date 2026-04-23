import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { varlockVitePlugin } from "@varlock/vite-integration";
// Chrome DevTools workspace (com.chrome.devtools.json); not the same as Vite 8's optional @vitejs/devtools
// (build analysis UI, build-only for now — see https://devtools.vite.dev/guide). No migration required.
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import devToolsJson from "vite-plugin-devtools-json";
export default defineConfig({
  plugins: [
    visualizer({
      filename: "stats.html", // written next to project root by default
      gzipSize: true,
      brotliSize: true,
      template: "treemap", // or "sunburst" / "network"
    }),
    tailwindcss(),
    devToolsJson(),
    varlockVitePlugin({
      ssrInjectMode: "resolved-env",
      ssrEdgeRuntime: true,
    }),
    sveltekit(),
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
