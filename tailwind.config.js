/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				bios: ['Bios']
			},
			colors: {
				// - Cyberpunk 2077
				background: '#01012b',
				primary: '#ff2a6d',
				secondary: '#05d9e8',
				accent: '#005678',
				extra: '#d1f7ff'
			}
		}
	},
	plugins: []
}
