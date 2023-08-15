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

	$: if (geometries.length == 2) {
		for (let index = 0; index <= terrainSize; index++) {
			let bottomOffset = (terrainSize + 1) * terrainSize
			positions[1][(bottomOffset + index) * 3 + 2] = positions[0][index * 3 + 2]
			positions[0][(bottomOffset + index) * 3 + 2] = positions[1][index * 3 + 2]
		}
	}
</script>

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

<T.DirectionalLight position={[15, 1, 5]} intensity={0.85} />
<T.DirectionalLight position={[-15, 1, 5]} intensity={0.85} />

{#if heightMap}
	<T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
		{#each ['normal', 'inverted'] as type}
			<T.PlaneGeometry
				args={[terrainSize, terrainSize, terrainSize, terrainSize]}
				on:create={({ ref, cleanup }) => {
					// Get the geometry data
					const refPositions = ref.attributes.position.array
					const refUvMapping = ref.attributes.uv.array

					// Update each vertex position's z value according to the heightmap
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

					cleanup(() => {
						geometries.splice(geometries.indexOf(ref), 1)
						positions.splice(positions.indexOf(refPositions), 1)
					})
				}}
			/>
		{/each}

		<T.MeshStandardMaterial
			metalness={0.2}
			roughness={0.7}
			emissive={new THREE.Color(0x000098)}
			color={new THREE.Color(0xffffff)}
			flatShading
		/>
	</T.Mesh>
{/if}
