<script lang="ts">
	import * as THREE from 'three'
	import { T } from '@threlte/core'
	import { OrbitControls } from '@threlte/extras'

	import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
	import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
	import { Line2 } from 'three/examples/jsm/lines/Line2'

	import { getZFromImageDataPoint, loadHeightMap } from './outrun'

	const terrainWidth = 30
	const terrainHeight = 30

	let planes = []
	let planePositions = []
	let lines = []
	let linePositions = []

	let heightMap: ImageData | null = null
	loadHeightMap('images/heightmap.png').then((res) => {
		const canvas = document.createElement('canvas')
		canvas.width = res.width
		canvas.height = res.height
		const ctx = canvas.getContext('2d')
		ctx.drawImage(res, 0, 0)
		heightMap = ctx.getImageData(0, 0, res.width, res.height)
	})

	$: if (planes.length == 2) {
		for (let index = 0; index <= terrainWidth; index++) {
			let bottomOffset = (terrainWidth + 1) * terrainHeight
			planePositions[1][(bottomOffset + index) * 3 + 2] = planePositions[0][index * 3 + 2]
			planePositions[0][(bottomOffset + index) * 3 + 2] = planePositions[1][index * 3 + 2]
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
	{#each ['normal', 'inverted'] as type}
		<T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
			<T.PlaneGeometry
				args={[terrainWidth, terrainHeight, terrainWidth, terrainHeight]}
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

					planes = [...planes, ref]
					planePositions = [...planePositions, refPositions]

					cleanup(() => {
						planes.splice(geometries.indexOf(ref), 1)
						planePositions.splice(positions.indexOf(refPositions), 1)
					})
				}}
			/>

			<T.MeshStandardMaterial
				metalness={0.2}
				roughness={0.7}
				emissive={new THREE.Color(0x000098)}
				color={new THREE.Color(0xffffff)}
				flatShading
			/>
		</T.Mesh>

		<T
			is={Line2}
			position={[0, -1.5, 0]}
			rotation={[-Math.PI / 2, 0, 0]}
			geometry={(() => {
				let geometry = new LineGeometry()
				if (planePositions.length == 0) {
					return geometry
				}
				for (let row = 0; row < terrainHeight; row++) {
					let isEvenRow = row % 2 == 0
					for (
						let col = isEvenRow ? 0 : terrainWidth - 1;
						isEvenRow ? col < terrainWidth : col >= 0;
						isEvenRow ? col++ : col--
					) {
						for (
							let point = isEvenRow ? 0 : 3;
							isEvenRow ? point < 4 : point >= 0;
							isEvenRow ? point++ : point--
						) {
							let mappedIndex
							let rowOffset = row * (terrainWidth + 1)
							if (point < 2) {
								mappedIndex = rowOffset + col + point
							} else {
								mappedIndex = rowOffset + col + point + terrainWidth - 1
							}
							linePositions.push(planePositions[type == 'normal' ? 0 : 1][mappedIndex * 3])
							linePositions.push(planePositions[type == 'normal' ? 0 : 1][mappedIndex * 3 + 1])
							linePositions.push(planePositions[type == 'normal' ? 0 : 1][mappedIndex * 3 + 2])
						}
					}
				}
				geometry.setPositions(linePositions)
				lines.push(geometry)
				return geometry
			})()}
			material={new LineMaterial({
				color: 0xcee4ff,
				linewidth: 0.04,
				alphaToCoverage: false,
				worldUnits: true
			})}
		/>
	{/each}
{/if}
