<script lang="ts">
	import '../glitch.css'
	import { Canvas } from '@threlte/core'
	import Synthwave from '../scenes/synthwave.svelte'
	import Postprocessing from '../scenes/postprocessing.svelte'
</script>

<div class="flex flex-col justify-start items-center h-full p-24">
	<background class="absolute inset-0 -z-10">
		<Canvas rendererParameters={{ antialias: true, logarithmicDepthBuffer: true }}>
			<Synthwave />
			<Postprocessing />
		</Canvas>
	</background>

	<section class="mb-12">
		<div class="text-center font-bios">
			<p class="md:text-3xl text-secondary">Liempo Presets</p>
			<p
				class="text-2xl md:text-7xl text-primary drop-shadow-xl glitch layers"
				data-text="driftrunner"
			>
				driftrunner
			</p>
		</div>
	</section>
</div>
