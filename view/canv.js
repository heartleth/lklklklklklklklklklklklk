const cellSpacing = 30;
let ctx;

function drawCanvas() {
    let canvas = document.querySelector('canvas');
    const wsrect = document.querySelector('#workspace').getBoundingClientRect();
    ctx = canvas.getContext('2d');;
    canvas.height = wsrect.height;
    canvas.width = wsrect.width;
    canvas.style.top = wsrect.top - 18 + 'px';
    ctx.lineWidth = 0.4;
    ctx.strokeStyle = '#86baeb';
    ctx.beginPath();
    for (let i = cellSpacing; i < wsrect.width; i += cellSpacing) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, wsrect.height);
    }
    for (let i = cellSpacing; i < wsrect.height; i += cellSpacing) {
        ctx.moveTo(0, i);
        ctx.lineTo(wsrect.width, i);
    }
    ctx.stroke();
}

function getCell(x, y) {
    let canvasRect = document.querySelector('canvas').getBoundingClientRect();
    return [
        Math.floor(Math.round(x - canvasRect.left) / cellSpacing),
        Math.floor(Math.round(y - canvasRect.top) / cellSpacing)
    ];
}

function drawBox(x, y, w, h, col = '#77e', momRect) {
    let canvasRect = document.querySelector('canvas').getBoundingClientRect();
    const ct = canvasRect.top;
    const cl = canvasRect.left;
    ctx.lineWidth = 5;
    ctx.strokeStyle = col;
    ctx.strokeRect(cellSpacing * x, cellSpacing * y, cellSpacing * w, cellSpacing * h);
    if (placeAnchor[0] == 't') {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#99f';
        ctx.beginPath();
        const boundary = momRect ? momRect.top - canvasRect.top : 0;
        ctx.moveTo((x+w/2) *  cellSpacing, boundary);
        ctx.lineTo((x+w/2) *  cellSpacing, y * cellSpacing);
        ctx.lineTo((x+w/2) *  cellSpacing + 8, y * cellSpacing - 8);
        ctx.moveTo((x+w/2) *  cellSpacing, y * cellSpacing);
        ctx.lineTo((x+w/2) *  cellSpacing - 8, y * cellSpacing - 8);
        ctx.stroke();
    }
    if (placeAnchor[1] == 'l') {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#99f';
        ctx.beginPath();
        const boundary = momRect ? momRect.left - canvasRect.left : 0;
        ctx.moveTo(boundary, (y+h/2) * cellSpacing);
        ctx.lineTo(x * cellSpacing, (y+h/2) * cellSpacing);
        ctx.lineTo(x * cellSpacing - 8, (y+h/2) * cellSpacing + 8);
        ctx.moveTo(x * cellSpacing, (y+h/2) * cellSpacing);
        ctx.lineTo(x * cellSpacing - 8, (y+h/2) * cellSpacing - 8);
        ctx.stroke();
    }
}

let ws = document.querySelector('#workspace');
ws.addEventListener('DOMContentLoaded', drawCanvas);
ws.addEventListener('mousemove', drawCanvas);
ws.addEventListener('scroll', drawCanvas);
ws.addEventListener('resize', drawCanvas);

window.addEventListener('DOMContentLoaded', drawCanvas);
window.addEventListener('mousemove', drawCanvas);
window.addEventListener('resize', drawCanvas);