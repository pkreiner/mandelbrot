import { hslToRgb, rgbToHsl, hexToRgb, zipWith, drawRectOutline, divideInterval,
	 interpolate, interpolatePath, interpolatePathHsl, setPixel, ijtoxy
} from './auxiliary_functions.js'

onmessage = function(e) {
    const data = e.data;
    let pixelArray = calculateMandelbrot(data.region, data.maxIterations, data.width, data.height,
					 data.startHeight, data.endHeight);
    postMessage(pixelArray);
};

// this worker will calculate a subset of the pixelArray, from startHeight to endHeight.
// it will leave the rest of its array unset, at 0.
function calculateMandelbrot(region, maxIterations, width, height, startHeight, endHeight) {
    const totalPixels = width * height;
    let pixelArray = new Float64Array(totalPixels);
    for (let j = startHeight; j < endHeight; j++) {
	for (let i = 0; i < width; i++) {
	    let [x, y] = ijtoxy(i, j, region, width, height);
	    let [cx, cy] = [x, y];
	    let k = 0;
	    let x2, y2;
	    do {
		x2 = x**2;
		y2 = y**2;
		let newX = x2 - y2 + cx;
		let newY = (2 * x * y) + cy;
		[x, y] = [newX, newY]
		k += 1;
	    } while (k < maxIterations - 1 && x2 + y2 < 4)
	    let u = 1 - (k / maxIterations);
	    pixelArray[i + j * width] = u;
	}
    }
    return pixelArray;
}
