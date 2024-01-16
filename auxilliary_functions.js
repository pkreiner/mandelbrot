function hslToRgb(hsl) {
    [h, s, l] = hsl;
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
	  l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
}

function rgbToHsl(rgb) {
    [r, g, b] = rgb;
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
	  ? l === r
	  ? (g - b) / s
	  : l === g
	  ? 2 + (b - r) / s
	  : 4 + (r - g) / s
	  : 0;
    return [
	60 * h < 0 ? 60 * h + 360 : 60 * h,
	100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
	(100 * (2 * l - s)) / 2,
    ];
};

function hexToRgb(hex) {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    return [r, g, b];
}

function zipWith(f, arr1, arr2) {
    return arr1.map((element, index) => f(element, arr2[index]));
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

// divide the range [0, top) into n pieces, returning
// a list of pairs [start, end)
function divideInterval(top, n) {
    let firstN = [...Array(n).keys()];
    let breakpoints = firstN.map(i => Math.floor(top / n) * i);
    breakpoints = breakpoints.concat([top]);
    let pairs = firstN.map(i => [breakpoints[i], breakpoints[i + 1]]);
    return pairs;
}
