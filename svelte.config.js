import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const config = {
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    alias: { $utils: './src/utils' }
  }
}

export default config
