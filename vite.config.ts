import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	ssr: {
		noExternal: ['three']
	},
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'tailwind.config.js': 'tailwind.config.js'
		}
	},
	optimizeDeps: {
		include: ['tailwind.config.js']
	}
})
