const mainCanvas = document.getElementById('mandelbrotCanvas');
const mainCtx = mainCanvas.getContext('2d');
const secondCanvas = document.getElementById('rectangleCanvas');
const sndCtx = secondCanvas.getContext('2d');
const mainImageData = mainCtx.createImageData(mainCanvas.width, mainCanvas.height);
const width = mainImageData.width;
const height = mainImageData.height;
const sndImageData = sndCtx.createImageData(width, height);

const threshold = 10**6
const threshold2 = threshold**2

const red = [255, 0, 0];
const blue = [0, 0, 255];

function zipWith(f, arr1, arr2) {
    return arr1.map((element, index) => f(element, arr2[index]));
}

function setPixel(imageData, x, y, r, g, b, a) {
    var index = (x + y * width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

// Turns a u in [0, 1) to a [r, g, b] gray color
function grey(u) {
    v = Math.floor(u * 256);
    return [v, v, v];
}
// Turns a u in [0, 1] to a color between color1 and color2
function spectrum(color1, color2, u) {
    return zipWith((c1, c2) => Math.floor((1 - u) * c1 + u * c2), color1, color2);
}

function ijtoxy(i, j, region) {
    [xMin, xMax, yMin, yMax] = region;
    xSize = xMax - xMin;
    ySize = yMax - yMin;
    xScaling = xSize / width;
    yScaling = ySize / height;
    x = i * xScaling + xMin;
    y = j * yScaling + yMin;
    return [x, y];
}

[xMin, xMax] = [-2.5, 0.5];
[yMin, yMax] = [-1.5, 1.5];
region = [xMin, xMax, yMin, yMax];
function drawMandelbrot(region) {
    max_iterations = 200;
    for(let i = 0; i < width; i++) {
	for (let j = 0; j < height; j++) {
	    [x, y] = ijtoxy(i, j, region);
	    let [cx, cy] = [x, y];
	    k = 0;
	    do {
		x2 = x**2;
		y2 = y**2;
		newX = x2 - y2 + cx;
		newY = (2 * x * y) + cy;
		[x, y] = [newX, newY]
		k += 1;
	    } while (k < max_iterations - 1 && x2 + y2 < 4)
	    // small # of iterations -> very outside the set = white
	    // max # of iterations -> inside the set = black
	    u = k / max_iterations;
	    color = spectrum(blue, red, u);
	    let [r, g, b] = color;
	    setPixel(mainImageData, i, j, r, g, b, 255);
	}
    }
    mainCtx.putImageData(mainImageData, 0, 0);
}
drawMandelbrot(region);

function drawRectOutline(ctx, topLeft, lowerRight) {
    [x1, y1] = topLeft;
    [x2, y2] = lowerRight;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1, y2);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2, y1);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = 'gray';
    ctx.strokeWidth = 5;
    ctx.stroke();
}

function updateRegionAndRedraw(newRegion) {
    region = newRegion;
    drawMandelbrot(region);
}

let isDragging = false;
let dragStart = null;
document.getElementById('canvasContainer').addEventListener('mousedown', (event) => {
    isDragging = true;
    dragStart = [event.clientX, event.clientY];
});
document.getElementById('canvasContainer').addEventListener('mouseup', (event) => {
    isDragging = false;
    dragEnd = [event.clientX, event.clientY];
    console.log('dragged from ', dragStart, ' to ', dragEnd);
    [i1, j1] = dragStart;
    [x1, y1] = ijtoxy(i1, j1, region);
    [i2, j2] = dragEnd;
    [x2, y2] = ijtoxy(i2, j2, region);
    newRegion = [x1, x2, y1, y2];
    updateRegionAndRedraw(newRegion);
    console.log('New Region: x: [', x1, ', ', x2, '], y: [', y1, ', ', y2, ']');
    sndCtx.clearRect(0, 0, width, height);
});
document.getElementById('canvasContainer').addEventListener('mousemove', (event) => {
    if (isDragging) {
	currentPos = [event.clientX, event.clientY];
	sndCtx.clearRect(0, 0, width, height);
	drawRectOutline(sndCtx, dragStart, currentPos);
    }
});
