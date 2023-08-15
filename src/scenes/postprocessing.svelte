<script lang="ts">
	import * as THREE from 'three'
	import { useThrelte, useRender } from '@threlte/core'

	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
	import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

	// @ts-ignore
	import tailwind from 'tailwind.config.js'
	const colors = tailwind.theme.extend.colors

	const { camera, scene, renderer, size } = useThrelte()
	const composer = new EffectComposer(renderer)

	scene.background = new THREE.Color(colors.background)
	const setupEffectComposer = (camera: THREE.Camera) => {
		const pass = new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight - window.innerWidth / 4),
			0.5, // strength
			0.2, // radius
			0.4 // threshold
		)
		composer.addPass(new RenderPass(scene, camera))
		composer.addPass(pass)
	}

	$: setupEffectComposer($camera)
	$: composer.setSize($size.width, $size.height)

	useRender((_, delta) => {
		composer.render(delta)
	})
</script>
