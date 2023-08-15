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
				// background: '#461E52',
				// primary: '#DD517F',
				// secondary: '#E68E36',
				// accent: '#556DC8',
				// extra: '#7998EE'

				// - Outrun 1984
				background: '#FF68A8',
				primary: '#64CFF7',
				secondary: '#F7E752',
				accent: '#CA7CD8',
				extra: '#3968CB'
			}
		}
	},
	plugins: []
}
