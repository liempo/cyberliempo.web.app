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
				background: '#051C2C',
				primary: '#E93CAC',
				secondary: '#00BCE1',
				accent: '#1E22AA',
				extra: '#6f58fc'

				// Syntwave
				// background: '#0D0D0D',
				// primary: '#FF00FF',
				// secondary: '#00FFFF',
				// accent: '#FF0000',
				// extra: '#FF00FF'
			}
		}
	},
	plugins: []
}
