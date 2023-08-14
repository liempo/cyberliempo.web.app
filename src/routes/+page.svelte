<script lang="ts">
	import '../glitch.css'
	import { Canvas } from '@threlte/core'
	import Outrun from '../scenes/Outrun.svelte'
</script>

<div class="flex flex-col justify-center items-center h-screen">
	<background class="absolute inset-0 bg-background -z-10">
		<Canvas>
			<Outrun />
		</Canvas>
	</background>

	<section class="mb-5">
		<div class="text-center font-bios">
			<span class="text-3xl text-gray-400"> Hello world, I'm </span>
			<span class="text-7xl text-accent drop-shadow-xl glitch layers" data-text="LIEMPO"
				>LIEMPO</span
			>
		</div>
	</section>
</div>
