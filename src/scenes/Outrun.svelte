<script lang="ts">
	import { T } from '@threlte/core'
	import { Grid, interactivity } from '@threlte/extras'
	import { tweened } from 'svelte/motion'
	import { linear } from 'svelte/easing'

	interactivity()
	const position = tweened(0, { easing: linear, duration: 500 })
	$: {
		const minValue = -10
		const newValue = $position - 1
		if (newValue < minValue) {
			position.set($position + minValue * -1, { duration: 0.01 })
		} else {
			position.set(newValue)
		}
		console.log($position)
	}
</script>

<Grid
	axes="xzy"
	cellColor={'#F73D93'}
	cellSize={1}
	infiniteGrid={true}
	cellThickness={1.4}
	sectionColor={'#F73D93'}
	sectionSize={5}
	sectionThickness={1.6}
	fadeDistance={100}
	fadeStrength={1.0}
	gridSize={[1, 1]}
/>

<T.PerspectiveCamera
	makeDefault
	position={[0, 1, $position]}
	rotation={[0, 0, 0]}
	fov={36}
	target={[0, 0, 0]}
/>
