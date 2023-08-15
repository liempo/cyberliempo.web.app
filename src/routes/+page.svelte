<script lang="ts">
	import '../glitch.css'
	import { Canvas } from '@threlte/core'
	import Synthwave from '../scenes/synthwave.svelte'
</script>

<div class="flex flex-col justify-start items-center h-screen p-24">
	<background class="absolute inset-0 bg-background -z-10">
		<Canvas rendererParameters={{ antialias: true, logarithmicDepthBuffer: true }}>
			<Synthwave />
		</Canvas>
	</background>

	<section class="mb-12">
		<div class="text-center font-bios">
			<p class="text-3xl text-secondary mr-8">Liempo Presets</p>
			<p class="text-7xl text-primary drop-shadow-xl glitch layers" data-text="driftrunner">
				driftrunner
			</p>
		</div>
	</section>
</div>
