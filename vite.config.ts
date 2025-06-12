import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import devToolsJson from 'vite-plugin-devtools-json'

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devToolsJson()]
});
