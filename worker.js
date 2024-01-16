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
	    [x, y] = ijtoxy(i, j, region, width, height);
	    let [cx, cy] = [x, y];
	    k = 0;
	    do {
		x2 = x**2;
		y2 = y**2;
		newX = x2 - y2 + cx;
		newY = (2 * x * y) + cy;
		[x, y] = [newX, newY]
		k += 1;
	    } while (k < maxIterations - 1 && x2 + y2 < 4)
	    u = 1 - (k / maxIterations);
	    pixelArray[i + j * width] = u;
	}
    }
    return pixelArray;
}

function ijtoxy(i, j, region, width, height) {
    [xMin, xMax, yMin, yMax] = region;
    xSize = xMax - xMin;
    ySize = yMax - yMin;
    xScaling = xSize / width;
    yScaling = ySize / height;
    x = i * xScaling + xMin;
    y = j * yScaling + yMin;
    return [x, y];
}
