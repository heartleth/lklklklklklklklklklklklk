const cellSpacing = 20;
let ctx;
let recc = [0, 0];

function drawCanvas() {
    let wse = document.querySelector('#workspace');
    let canvas = document.querySelector('canvas');
    let wsrect = wse.getBoundingClientRect();
    let wsrect2 = wsrect;
    if (window.srce) {
        if (window.srce.classList.contains('natural')) {
            let me = window.srce;
            wsrect2 = me.getBoundingClientRect();
        }
    }
    ctx = canvas.getContext('2d');;
    canvas.height = wsrect.height;
    canvas.width = wsrect.width;
    canvas.style.top = wsrect.top - 18 + 'px';
    ctx.lineWidth = 0.4;
    ctx.strokeStyle = '#86baeb';
    ctx.beginPath();
    let sx = wsrect2.left - wsrect.left;
    let sy = wsrect2.top - wsrect.top;
    if (window.srce) {
        if (wse == window.srce || wse.contains(window.srce)) {
            for (let i = cellSpacing + sx; i < wsrect2.width + sx; i += cellSpacing) {
                ctx.moveTo(i, sy);
                ctx.lineTo(i, sy + wsrect2.height);
            }
            for (let i = cellSpacing + sy; i < wsrect2.height + sy; i += cellSpacing) {
                ctx.moveTo(sx, i);
                ctx.lineTo(sx + wsrect2.width, i);
            }
        }
    }
    ctx.stroke();
    drawResizes(canvas, ctx);
}

function getCell(x, y, noround, mom) {
    let canvasRect = (mom ?? document.querySelector('canvas')).getBoundingClientRect();
    // if (window.isClicked == 'place') {
    //     let me = window.movingElement;
    //     let mrect = me.getBoundingClientRect();
    //     return [
    //         Math.round(Math.round(x - mrect.left) / cellSpacing),
    //         Math.round(Math.round(y - mrect.top) / cellSpacing)
    //     ];
    // }
    if (noround) {
        return [
            Math.round(x - canvasRect.left) / cellSpacing,
            Math.round(y - canvasRect.top) / cellSpacing
        ];
    }
    return [
        Math.round(Math.round(x - canvasRect.left) / cellSpacing),
        Math.round(Math.round(y - canvasRect.top) / cellSpacing)
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

function drawResizes(canvas, ctx) {
    const canvasRect = canvas.getBoundingClientRect();
    let wsb = document.querySelector('wsbody');
    for (let div of wsb.querySelectorAll('.natural')) {
        drawResizeOne(div, ctx, canvasRect);
    }
}

function drawResizeOne(div, ctx, canvasRect) {
    if (div.classList.contains('dummy')) return;
    if (div.tagName == 'BR') return;
    const divRect = div.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(50, 50, 255, 0.5)';
    ctx.font = '12px Consolas';
    let tw = 0;
    if (div.id.length) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillText('#' + div.id, divRect.left - canvasRect.left, divRect.top - canvasRect.top - 15 + 12);
        tw = ctx.measureText('#' + div.id).width + 2;
        // ctx.strokeRect(divRect.left - canvasRect.left, divRect.top - canvasRect.top-15, tw, 15);
    }
    if (!isInRect(...recc, {
        top: divRect.top -  15,
        left: divRect.left - 10,
        right: divRect.right + 10,
        bottom: divRect.bottom + 10
    })) {
        return;
    }
    ctx.strokeRect(divRect.left - canvasRect.left, divRect.top - canvasRect.top, divRect.width, divRect.height);
    ctx.fillStyle = 'rgba(100, 145, 255)';
    ctx.fillRect(divRect.left + tw - canvasRect.left, divRect.top - canvasRect.top-15, 31, 15);
    ctx.fillRect(divRect.left + tw - canvasRect.left + 35, divRect.top - canvasRect.top-15, 31, 15);
    ctx.fillRect(divRect.left + tw - canvasRect.left + 70, divRect.top - canvasRect.top-15, 37, 15);
    ctx.font = '13px Consolas';
    ctx.fillStyle = 'white';
    ctx.fillText('edit', divRect.left + tw - canvasRect.left + 2, divRect.top - canvasRect.top - 3);
    ctx.fillText('code', divRect.left + tw - canvasRect.left + 35, divRect.top - canvasRect.top - 3);
    ctx.fillText('style', divRect.left + tw - canvasRect.left + 70, divRect.top - canvasRect.top - 3);
    // ctx.beginPath();
    // ctx.moveTo(divRect.left + tw - canvasRect.left + 7.5, divRect.top - canvasRect.top-15 + 3);
    // ctx.lineTo(divRect.left + tw - canvasRect.left + 7.5, divRect.top - canvasRect.top-15 + 12);
    // ctx.moveTo(divRect.left + tw - canvasRect.left + 3, divRect.top - canvasRect.top-15 + 7.5);
    // ctx.lineTo(divRect.left + tw - canvasRect.left + 12, divRect.top - canvasRect.top-15 + 7.5);
    // ctx.stroke();
    const tl = [divRect.left - canvasRect.left - 4, divRect.top - canvasRect.top - 4];
    
    const wh = [8, 8]
    const divH = divRect.height;
    const divW = divRect.width;
    let fns = (a, b) => {
        ctx.fillRect(tl[0]+a, tl[1]+b, ...wh);
        ctx.strokeRect(tl[0]+a, tl[1]+b, ...wh);
    };
    
    ctx.strokeStyle = 'rgba(100, 145, 255, 0.3)'
    if (div.style.marginTop) {
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(tl[0]+divW/2+4, tl[1], ...wh);
        ctx.lineTo(tl[0]+divW/2+4, tl[1]-lpx(div.style.marginTop)+4, ...wh);
        ctx.stroke();
    }
    if (div.style.marginBottom) {
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(tl[0]+divW/2+4, tl[1]+divH, ...wh);
        ctx.lineTo(tl[0]+divW/2+4, tl[1]+divH+lpx(div.style.marginBottom)+4, ...wh);
        ctx.stroke();
    }
    if (div.style.marginLeft) {
        // ctx.lineWidth = divH;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(tl[0], tl[1]+divH/2+4, ...wh);
        ctx.lineTo(tl[0]-lpx(div.style.marginLeft)+4, tl[1]+divH/2+4, ...wh);
        ctx.stroke();
    }
    if (div.style.marginRight) {
        // ctx.lineWidth = divH;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(tl[0]+divW, tl[1]+divH/2+4, ...wh);
        ctx.lineTo(tl[0]+divW+lpx(div.style.marginRight)+4, tl[1]+divH/2+4, ...wh);
        ctx.stroke();
    }
    ctx.lineWidth = 2;
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'blue'
    fns(divW/2, 2);
    fns(divW/2, divH-2);
    fns(2, divH/2);
    fns(divW-2, divH/2);

    // fns(2, 2);
    // fns(divW-2, divH-2);
    // fns(2, divH-2);
    // fns(divW-2, 2);
}

window.addEventListener('mousedown', (e) => {
    let canvas = document.querySelector('canvas');
    const canvasRect = canvas.getBoundingClientRect();
    let mx = e.clientX;
    let my = e.clientY;
    if (isInRect(mx, my, canvasRect)) {
        let ctx = canvas.getContext('2d');
        let wsb = document.querySelector('wsbody');
        for (let div of wsb.querySelectorAll('*')) {
            const divRect = div.getBoundingClientRect();
            const tl = [divRect.left - canvasRect.left - 4, divRect.top - canvasRect.top - 4];
            const divH = divRect.height;
            const divW = divRect.width;
            const wh = [8, 8];
            let tw = div.id ? ctx.measureText('#' + div.id).width + 2 : 0;
            const rects = [
                { top:tl[1]+divH/2, bottom:tl[1]+divH/2+wh[1], left:tl[0]+2, right:tl[0]+2+wh[0] },
                { top:tl[1]+2, bottom:tl[1]+2+wh[1], left:tl[0]+divW/2, right:tl[0]+divW/2+wh[0] },
                { top:tl[1]+divH/2, bottom:tl[1]+divH/2+wh[1], left:tl[0]+divW-2, right:tl[0]+divW-2+wh[0] },
                { top:tl[1]+divH-2, bottom:tl[1]+divH-2+wh[1], left:tl[0]+divW/2, right:tl[0]+divW/2+wh[0] },

                // { top:tl[1]+divH-2, bottom:tl[1]+divH-2+wh[1], left:tl[0]+divW-2, right:tl[0]+divW-2+wh[0] },
                // { top:tl[1]+divH-2, bottom:tl[1]+divH-2+wh[1], left:tl[0]+divW-2, right:tl[0]+divW-2+wh[0] }

                {
                    left: divRect.left + tw - canvasRect.left,
                    top: divRect.top - canvasRect.top - 15,
                    right: divRect.left + tw - canvasRect.left + 33,
                    bottom: divRect.top - canvasRect.top
                },
                {
                    left: divRect.left + tw - canvasRect.left + 35,
                    top: divRect.top - canvasRect.top - 15,
                    right: divRect.left + tw - canvasRect.left + 68,
                    bottom: divRect.top - canvasRect.top
                }
            ];
            for (let i = 0; i < 4; i++) {
                if (isInRect(mx - canvasRect.left, my - canvasRect.top, rects[i])) {
                    ctx.fillStyle = 'rgba(50, 50, 255, 0.5)';
                    ctx.fillRect(rects[i].left, rects[i].top, ...wh);
                    
                    window.resizing = {
                        element: div,
                        direction: [
                            'left', 'top', 'right', 'bottom'
                        ][i],
                        drawOriginal: [divRect.left - canvasRect.left, divRect.top - canvasRect.top, divRect.width, divRect.height],
                        begin: [mx, my],
                        originalStyle: JSON.parse(JSON.stringify(div.style)),
                        original: JSON.parse(JSON.stringify(getComputedStyle(div))),
                        ctx
                    };
                }
            }
            if (isInRect(mx - canvasRect.left, my - canvasRect.top, rects[4])) {
                if (div.tagName == 'DIV') {
                    openMenu('box', undefined, div);
                }
                else if (div.tagName == 'BUTTON') {
                    openMenu('button', undefined, div);
                }
                else if (div.tagName[0] == 'H') {
                    openMenu('title', undefined, div);
                }
                else if (div.tagName == 'TEXTAREA') {
                    openMenu('text field', undefined, div);
                }
            }
            else if (isInRect(mx - canvasRect.left, my - canvasRect.top, rects[5])) {
                if (!div.id) {
                    div.id = 'e' + Math.floor(Math.random() * 99);
                }
                window.ojf = { element: div };
            }
            // else if (isInRect(mx - canvasRect.left, my - canvasRect.top, rects[5])) {
                
            // }
            // divRect.left + tw - canvasRect.left + 35, divRect.top - canvasRect.top - 3

            // if (isInRect(mx - canvasRect.left, my - canvasRect.top, {
            //     top: tl[1],
            //     bottom: tl[1]+8,
            //     left: tl[0],
            //     right: tl[0]+8,
            // })) {
            //     if (!div.style.marginRight && div.style.marginLeft) {
            //         div.style.marginRight = div.style.marginLeft;
            //         div.style.width = 'auto';
            //     }
            //     else if (div.style.marginRight && div.style.marginLeft) {
            //         div.style.marginRight = div.style.marginLeft = 'auto';
            //         div.style.width = 'fit-content';
            //     }
            // }
        }
    }
});

function isInRect(x, y, rect) {
    return (rect.left < x && x < rect.right) && (rect.top < y && y < rect.bottom);
}

function lpx(px) {
    return parseFloat(px.replace('px', ''));
}