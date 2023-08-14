/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				bios: ['Bios']
			},
			colors: {
				background: '#16003B',
				accent: '#F73D93'
			}
		}
	},
	plugins: []
}
