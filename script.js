const mainCanvas = document.getElementById('mandelbrotCanvas');
const mainCtx = mainCanvas.getContext('2d');
const secondCanvas = document.getElementById('rectangleCanvas');
const sndCtx = secondCanvas.getContext('2d');
const mainImageData = mainCtx.createImageData(mainCanvas.width, mainCanvas.height);
const width = mainImageData.width;
const height = mainImageData.height;
const totalPixels = width * height;
const sndImageData = sndCtx.createImageData(width, height);



const black = [0, 0, 0]
const white = [255, 255, 255]
const red = [255, 0, 0];
const blue = [0, 0, 255];
const green = [0, 255, 0];
const teal = [0, 255, 255];
const hslBlack = [0, 0, 0];
const hslWhite = [0, 0, 100];
const hslRed = [0, 100, 50];
const hslGreen = [120, 100, 50];
const hslBlue = [240, 100, 50];
const hslTeal = [180, 100, 50];

const tealToWhite = (u) => interpolate(teal, white, u);
const blackToWhite = (u) => interpolate(black, white, u);

const colorSchemes = {
    'tealToWhite' : tealToWhite,
    'blackToWhite' : blackToWhite
}

// Options
let normalizeColors = true;
let colorScheme = blackToWhite;


function setPixel(imageData, x, y, r, g, b, a) {
    var index = (x + y * width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

// Turns a u in [0, 1] to a color between color1 and color2
function interpolate(color1, color2, u) {
    return zipWith((c1, c2) => Math.floor((1 - u) * c1 + u * c2), color1, color2);
}

function interpolatePath(colors, u) {
    n = colors.length - 1;
    k = Math.floor((u * n) % n);
    [prevColor, nextColor] = [colors[k], colors[k+1]];
    v = (u - (k / n)) * n;
    return interpolate(prevColor, nextColor, v);
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
pixelArray = new Float64Array(totalPixels);
function calculateMandelbrot(region) {
    // This function populates the 'pixelArray' with values in [0, 1).
    // 0 means inside the mandelbrot set, 1 means outside.
    max_iterations = 200;
    [u_min, u_max] = [1, 0];
    for (let i = 0; i < width; i++) {
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
	    u = 1 - (k / max_iterations);
	    pixelArray[i + j * width] = u;
	}
    }    
}

function drawPixelArray() {
    // colorScheme is a function [0, 1) -> [r, g, b].
    let u_min = 1, u_max = 0, u_scaling;
    if (normalizeColors) {
	[u_min, u_max] = [1, 0];
	for (let i = 0; i < width; i++) {
	    for (let j = 0; j < height; j++) {
		let u = pixelArray[i + j * width];
		[u_min, u_max] = [Math.min(u_min, u), Math.max(u_max, u)];
		if (u_min > u_max) {
		}
	    }
	}
	u_scaling = 1 / (u_max - u_min);
    }
    for (let i = 0; i < width; i++) {
	for (let j = 0; j < height; j++) {
	    let u = pixelArray[i + j * width];
	    let v;
	    if (normalizeColors) {
		v = (u - u_min) * u_scaling;
	    } else {
		v = u;
	    }
	    if (Math.random() < 0.0001) {
	    }
	    let color = colorScheme(v);
	    let [r, g, b] = color;
	    setPixel(mainImageData, i, j, r, g, b, 255);
	}
    }
    mainCtx.putImageData(mainImageData, 0, 0);
}

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
    calculateMandelbrot(region);
    drawPixelArray();
}

// Turns an (i, j) pixel coordinate pair relative to the viewport,
// to one relative to the canvas.
function correctForCanvasOffset(point) {
    let rect = mainCanvas.getBoundingClientRect();
    [i, j] = point;
    return [Math.round(i - rect.left), Math.round(j - rect.top)];
}

function drawInstructions() {
    mainCtx.font = '20px Arial';
    mainCtx.fillText('(Zoom in by selecting a region)', 20, 20);
}


let isDragging = false;
let dragStart = null;
let dragEnd = null;

window.onload = function() {
    const normalizeColorsCheckbox = document.getElementById('normalizeColorsCheckbox');
    normalizeColorsCheckbox.checked = normalizeColors;

    calculateMandelbrot(region);    
    drawPixelArray();
    drawInstructions();    
}

document.getElementById('canvasContainer').addEventListener('mousedown', (event) => {
    isDragging = true;
    dragStart = correctForCanvasOffset([event.clientX, event.clientY]);
    console.log(`mouse down at (${event.clientX}, ${event.clientY})`);
});
document.getElementById('canvasContainer').addEventListener('mouseup', (event) => {
    isDragging = false;
    // relying on 'dragEnd' to have been updated in the mousemove listener
    if (dragEnd !== null && dragStart[0] != dragEnd[0] && dragStart[1] != dragEnd[1]) {
	console.log('dragged from ', dragStart, ' to ', dragEnd);
	[i1, j1] = dragStart;
	[x1, y1] = ijtoxy(i1, j1, region);
	[i2, j2] = dragEnd;
	[x2, y2] = ijtoxy(i2, j2, region);
	newRegion = [x1, x2, y1, y2];
	updateRegionAndRedraw(newRegion);
	console.log('New Region: x: [', x1, ', ', x2, '], y: [', y1, ', ', y2, ']');
	sndCtx.clearRect(0, 0, width, height);	
    }
    
});
document.getElementById('canvasContainer').addEventListener('mousemove', (event) => {
    if (isDragging) {
	mousePos = correctForCanvasOffset([event.clientX, event.clientY]);
	// Restrict the selection region to be square, by using the shorter side of its rectangle
	[xDelta, yDelta] = [mousePos[0] - dragStart[0], mousePos[1] - dragStart[1]];
	if (Math.abs(xDelta) < Math.abs(yDelta)) {
	    dragEnd = [mousePos[0], dragStart[1] + Math.sign(yDelta) * Math.abs(xDelta)];
	} else {
	    dragEnd = [dragStart[0] + Math.sign(xDelta) * Math.abs(yDelta), mousePos[1]];
	}
	sndCtx.clearRect(0, 0, width, height);
	drawRectOutline(sndCtx, dragStart, dragEnd);
    }
});

document.getElementById('normalizeColorsCheckbox').addEventListener('change', (event) => {
    if (event.target.checked) {
	normalizeColors = true;
	drawPixelArray();
    } else {
	normalizeColors = false;
	drawPixelArray();
    }
});

let numCustomColors = 2;
document.getElementById('colorSchemeSelector').addEventListener('change', (event) => {
    value = event.target.value;
    if (value == 'custom') {
	for (let i=1; i <= numCustomColors; i++) {
	    selector = document.getElementById(`color-input-${i}`);
	    selector.style.display = 'block';
	}
    } else {
	for (let i=1; i <= numCustomColors; i++) {
	    selector = document.getElementById(`color-input-${i}`);
	    selector.style.display = 'none';
	}
	colorScheme = colorSchemes[event.target.value];
	drawPixelArray();
    }
});
