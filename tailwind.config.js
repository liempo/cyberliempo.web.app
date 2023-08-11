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
			},
			animation: {
				cursor: 'cursor .6s linear infinite alternate',
				type: 'type 1.8s ease-out .8s 1 normal both',
				'type-reverse': 'type 1.8s ease-out 0s infinite alternate-reverse both'
			}
		}
	},
	plugins: []
}
