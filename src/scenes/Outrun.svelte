<script lang="ts">
	import * as THREE from 'three'
	import { T } from '@threlte/core'
	import { OrbitControls } from '@threlte/extras'
	import { getZFromImageDataPoint, loadHeightMap } from './outrun'

	const terrainSize = 30
	const geometries = []
	const positions = []

	let heightMap: ImageData | null = null
	loadHeightMap('images/heightmap.png').then((res) => {
		const canvas = document.createElement('canvas')
		canvas.width = res.width
		canvas.height = res.height
		const ctx = canvas.getContext('2d')
		ctx.drawImage(res, 0, 0)
		heightMap = ctx.getImageData(0, 0, res.width, res.height)
	})
</script>

<T.Mesh>
	<T.DirectionalLight color={0x2dd7ff} intensity={0.85} position={[15, 1, 5]} />
	<T.DirectionalLight color={0x2dd7ff} intensity={0.85} position={[-15, 1, 5]} />

	{#if heightMap}
		{#each ['normal', 'inverted'] as type}
			<T.PlaneGeometry
				args={[terrainSize, terrainSize, terrainSize, terrainSize]}
				rotation={[-Math.PI / 2, 0, 0]}
				on:create={({ ref, cleanup }) => {
					// Get the geometry data
					const refPositions = ref.attributes.position.array
					const refUvMapping = ref.attributes.uv.array

					// // update each vertex position's z value according to the value we extracted from the heightmap image
					for (let index = 0; index < refUvMapping.length / 2; index++) {
						let vertexU = refUvMapping[index * 2]
						let vertexV = refUvMapping[index * 2 + 1]

						// Update the z positions according to the heightmap
						let terrainHeight = getZFromImageDataPoint(
							heightMap,
							type === 'normal' ? vertexU : 1 - vertexU,
							vertexV,
							heightMap.width,
							heightMap.height
						)
						refPositions[index * 3 + 2] = terrainHeight
					}

					// Skew the plane geometry
					const shearMatrix = new THREE.Matrix4()
					shearMatrix.makeShear(-0.5, 0, 0, 0, 0, 0)
					ref.applyMatrix4(shearMatrix)

					// Update the cached geometry data
					geometries.push(ref)
					positions.push(refPositions)

					console.log({
						heightMap,
						refPositions,
						refUvMapping
					})
				}}
			/>
		{/each}
	{/if}

	<T.MeshStandardMaterial metalness={0.2} roughness={0.7} color={0xffffff} emissive={0x000098} />
</T.Mesh>

<T.PerspectiveCamera
	makeDefault
	fov={70}
	near={1}
	far={120}
	position={[0, 0, 2.4]}
	aspect={window.innerWidth / window.innerHeight}
>
	<OrbitControls />
</T.PerspectiveCamera>
