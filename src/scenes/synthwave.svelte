<script lang="ts">
	import * as THREE from 'three'
	import { T } from '@threlte/core'

	import { OrbitControls } from '@threlte/extras'
	import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
	import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
	import { Line2 } from 'three/examples/jsm/lines/Line2'

	import {
		vertexShader,
		fragmentShader,
		getZFromImageDataPoint,
		loadHeightMap,
		hexToRgb
	} from '$lib'

	// @ts-ignore
	import tailwindConfig from 'tailwind.config.js'
	const colors = tailwindConfig.theme.extend.colors

	const props: {
		terrainWidth: number
		terrainHeight: number
		tileCount: number
		speed: number
	} = {
		terrainWidth: 30,
		terrainHeight: 30,
		tileCount: 6,
		speed: 1
	}

	let terrain: {
		planes: THREE.PlaneGeometry[]
		positions: number[][]
		lines: LineGeometry[]
	} = {
		planes: [],
		positions: [],
		lines: []
	}

	let movement: [x: number, y: number, z: number][] = [
		[0, -1.5, 0],
		[0, -1.5, -props.terrainHeight],
		[0, -1.5, -props.terrainHeight * 2],
		[0, -1.5, -props.terrainHeight * 3],
		[0, -1.5, -props.terrainHeight * 4],
		[0, -1.5, -props.terrainHeight * 5]
	]

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

			terrain.planes.push(geometry)
			terrain.positions.push(Array.from(planePositions))

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

						linePositions.push(terrain.positions[i][mappedIndex * 3])
						linePositions.push(terrain.positions[i][mappedIndex * 3 + 1])
						linePositions.push(terrain.positions[i][mappedIndex * 3 + 2])
					}
				}
			}

			lineGeometry.setPositions(linePositions)
			terrain.lines.push(lineGeometry)
			terrain = terrain
		}

		for (let index = 0; index <= props.terrainWidth; index++) {
			let bottomOffset = (props.terrainWidth + 1) * props.terrainHeight
			terrain.positions[1][(bottomOffset + index) * 3 + 2] = terrain.positions[0][index * 3 + 2]
			terrain.positions[0][(bottomOffset + index) * 3 + 2] = terrain.positions[1][index * 3 + 2]
		}
	})

	const animate = () => {
		if (movement.length <= 0) return
		const interval = 1 / 60
		for (let index = 0; index < props.tileCount; index++) {
			movement[index][2] += props.speed * interval
			if (movement[index][2] >= props.terrainHeight) {
				movement[index][2] -= props.tileCount * props.terrainHeight
			}
		}
		requestAnimationFrame(animate)
	}
	requestAnimationFrame(animate)
</script>

<T.PerspectiveCamera
	makeDefault
	fov={70}
	near={1}
	far={120}
	position={[0, 0, 2.4]}
	aspect={window.innerWidth / window.innerHeight}
/>

<T.DirectionalLight position={[30, 1, 5]} intensity={0.85} color={colors.accent} />
<T.DirectionalLight position={[-30, 1, 5]} intensity={0.85} color={colors.accent} />

<T.Mesh position={[0, 5, -100]}>
	<T.SphereGeometry args={[30, 64, 64]} />
	<T.ShaderMaterial
		{vertexShader}
		{fragmentShader}
		uniforms={{
			u_time: { value: 0.0 },
			u_mouse: {
				value: {
					x: 0.0,
					y: 0.0
				}
			},
			u_resolution: {
				value: {
					x: window.innerWidth * window.devicePixelRatio,
					y: window.innerHeight * window.devicePixelRatio
				}
			},
			color_main: {
				value: hexToRgb(colors.primary, true)
			},
			color_accent: {
				value: hexToRgb(colors.secondary, true)
			}
		}}
	/>
</T.Mesh>

{#if isHeightMapLoaded}
	{#each { length: props.tileCount } as _, i}
		<T.Mesh
			rotation={[-Math.PI / 2, 0, 0]}
			position={movement[i]}
			geometry={terrain.planes[i % 2]}
			material={new THREE.MeshStandardMaterial({
				color: 'white',
				emissive: 'bkack',
				metalness: 0.2,
				roughness: 0.8,
				flatShading: true
			})}
		/>
		<T
			is={Line2}
			rotation={[-Math.PI / 2, 0, 0]}
			position={movement[i]}
			geometry={terrain.lines[i % 2]}
			material={new LineMaterial({
				color: colors.extra,
				linewidth: 0.04,
				alphaToCoverage: false,
				worldUnits: true
			})}
		/>
	{/each}
{/if}
