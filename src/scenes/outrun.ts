/**
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
 * This loadImage function returns a Promise that is resolved when the image finishes loading
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
