/**
 *
 * original reference: https://gist.github.com/jawdatls/465d82f2158e1c4ce161
 * This function lets you get the greyscale color value from a specific point in an image
 * In this scenario, we pass in a displacement map as imageData,
 * and u/v values which gets translated to a certain point on the image
 * getting either one of r/g/b value as the displacement value is the same
 * since the image is supposed to be black and white
 * note that the direction of v axis in texture data is the inverse of the y axis in image data
 *
 * @param {object} imageData the color data of the displacement map image to be passed in
 * @param {number} u the x position [0,1] of the target pixel
 * @param {number} v the y position [0,1] of the target pixel
 * @param {number} cvWidth the width of the heightmap image in canvas
 * @param {number} cvHeight the height of the heightmap image in canvas
 * @returns {number} height value of the requested point within [0,5]
 */

export function getZFromImageDataPoint(
	imageData: ImageData,
	u: number,
	v: number,
	cvWidth: number,
	cvHeight: number
): number {
	const mapWidth = cvWidth
	const mapHeight = cvHeight
	const displacementScale = 5
	var x = Math.round(u * (mapWidth - 1))
	var y = Math.round((1 - v) * (mapHeight - 1))
	var index = (y * imageData.width + x) * 4
	var red = imageData.data[index]
	return (red / 255) * displacementScale
}

/**
 * This loadHeightMap function returns a Promise that is resolved when the height map (image) finishes loading
 * if you use it with await, it returns the loaded image object
 * @param {string} path image file path
 * @returns a Promise that resolves with the value assigned as the loaded image
 */
export const loadHeightMap = (path: string) => {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.crossOrigin = 'Anonymous' // to avoid CORS if used with Canvas
		img.src = path
		img.onload = () => {
			resolve(img)
		}
		img.onerror = (e) => {
			reject(e)
		}
	})
}

/**
 *
 * @param {string} hex hex string with or without # prefix
 * @param {bool} forShaders if true, r,g,b components will be in 0..1 range
 * @returns an object with r,g,b components
 */
export const hexToRgb = (hex: string, forShaders = false) => {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	if (forShaders) {
		return result
			? {
					r: parseInt(result[1], 16) / 255,
					g: parseInt(result[2], 16) / 255,
					b: parseInt(result[3], 16) / 255
			  }
			: null
	}
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
		  }
		: null
}

export const vertexShader = `
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        vUv = uv;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
      }
  `

export const fragmentShader = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      #define PI 3.14159265359
      #define TWO_PI 6.28318530718
      
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform vec3 color_main;
      uniform vec3 color_accent;
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        vec2 st = gl_FragCoord.xy/u_resolution.xy;
        float x = vPos.y;
        float osc = ceil(sin((3. - (x - u_time) / 1.5) * 5.) / 2. + 0.4 - floor((3. - x / 1.5) * 5. / TWO_PI) / 10.);
        vec3 color = mix(color_accent, color_main, smoothstep(0.2, 1., vUv.y));
        gl_FragColor = vec4(color, osc);
      }
  `
