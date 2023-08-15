<script lang="ts">
	import * as THREE from 'three'
	import { T } from '@threlte/core'
	import { OrbitControls } from '@threlte/extras'

	import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
	import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
	import { Line2 } from 'three/examples/jsm/lines/Line2'

	import { getZFromImageDataPoint, loadHeightMap } from '$lib'

	const props: {
		terrainWidth: number
		terrainHeight: number
		tileCount: number
	} = {
		terrainWidth: 30,
		terrainHeight: 30,
		tileCount: 6
	}

	let state: {
		planes: THREE.PlaneGeometry[]
		positions: number[][]
		lines: LineGeometry[]
	} = {
		planes: [],
		positions: [],
		lines: []
	}

	let isHeightMapLoaded = false
	loadHeightMap('images/heightmap.png').then((res: any) => {
		// Get height map from image data
		const canvas = document.createElement('canvas')
		canvas.width = res.width
		canvas.height = res.height
		const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!
		ctx.drawImage(res, 0, 0)
		const heightMap = ctx.getImageData(0, 0, res.width, res.height)
		isHeightMapLoaded = true

		// Generate terrain (normal and inverted) with loaded height map
		const types = ['normal', 'inverted']
		for (const [i, type] of types.entries()) {
			// MARK: - Plane Geometry
			const geometry = new THREE.PlaneGeometry(
				props.terrainWidth,
				props.terrainHeight,
				props.terrainWidth,
				props.terrainHeight
			)

			const planePositions = geometry.attributes.position.array
			const planeUvMapping = geometry.attributes.uv.array

			// Update each vertex position's z value according to the heightmap
			for (let index = 0; index < planeUvMapping.length / 2; index++) {
				let vertexU = planeUvMapping[index * 2]
				let vertexV = planeUvMapping[index * 2 + 1]

				// Update the z positions according to the heightmap
				let terrainHeight = getZFromImageDataPoint(
					heightMap,
					type == 'normal' ? vertexU : 1 - vertexU,
					vertexV,
					heightMap.width,
					heightMap.height
				)
				planePositions[index * 3 + 2] = terrainHeight
			}

			// Skew the plane geometry
			const shearMatrix = new THREE.Matrix4()
			shearMatrix.makeShear(-0.5, 0, 0, 0, 0, 0)
			geometry.applyMatrix4(shearMatrix)

			state.planes.push(geometry)
			state.positions.push(Array.from(planePositions))

			// MARK: - Line Geometry
			const lineGeometry = new LineGeometry()
			const linePositions: number[] = []
			// This is a specific way to map line points to corresponding vertices of the planeGeometry
			for (let row = 0; row < props.terrainHeight; row++) {
				let isEvenRow = row % 2 == 0
				for (
					let col = isEvenRow ? 0 : props.terrainWidth - 1;
					isEvenRow ? col < props.terrainWidth : col >= 0;
					isEvenRow ? col++ : col--
				) {
					for (
						let point = isEvenRow ? 0 : 3;
						isEvenRow ? point < 4 : point >= 0;
						isEvenRow ? point++ : point--
					) {
						let mappedIndex
						let rowOffset = row * (props.terrainWidth + 1)
						if (point < 2) {
							mappedIndex = rowOffset + col + point
						} else {
							mappedIndex = rowOffset + col + point + props.terrainWidth - 1
						}

						linePositions.push(state.positions[i][mappedIndex * 3])
						linePositions.push(state.positions[i][mappedIndex * 3 + 1])
						linePositions.push(state.positions[i][mappedIndex * 3 + 2])
					}
				}
			}

			lineGeometry.setPositions(linePositions)
			state.lines.push(lineGeometry)
			state = state
		}

		for (let index = 0; index <= props.terrainWidth; index++) {
			let bottomOffset = (props.terrainWidth + 1) * props.terrainHeight
			state.positions[1][(bottomOffset + index) * 3 + 2] = state.positions[0][index * 3 + 2]
			state.positions[0][(bottomOffset + index) * 3 + 2] = state.positions[1][index * 3 + 2]
		}
	})
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

<T.DirectionalLight position={[60, 1, 5]} intensity={0.5} />
<T.DirectionalLight position={[-60, 1, 5]} intensity={0.5} />

{#if isHeightMapLoaded}
	{#each { length: props.tileCount } as _, i}
		<T.Mesh
			args={[
				state.planes[i % 2],
				new THREE.MeshStandardMaterial({
					color: new THREE.Color(0xffffff),
					emissive: new THREE.Color(0x000098),
					metalness: 0.2,
					roughness: 0.7,
					flatShading: true
				})
			]}
			rotation={[-Math.PI / 2, 0, 0]}
			position={[0, -1.5, -props.terrainHeight * i]}
		/>
		<T
			is={Line2}
			args={[
				state.lines[i % 2],
				new LineMaterial({
					color: 0xcee4ff,
					linewidth: 0.04,
					alphaToCoverage: false,
					worldUnits: true
				})
			]}
			rotation={[-Math.PI / 2, 0, 0]}
			position={[0, -1.5, -props.terrainHeight * i]}
		/>
	{/each}
{/if}
