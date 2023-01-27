function topMiddleDrag(me, evt) {
    let wsb = document.querySelector('wsbody');
    const mx = evt.clientX;
    const my = evt.clientY;
    drawCanvas();
    const cell = getCell(mx, my);

    let mom = wsb;
    if (me.temp) {
        const ms = [...me.temp.querySelectorAll('.natural')];
        for (let box of wsb.querySelectorAll('.natural')) {
            if (me.temp == box || ms.includes(box)) continue;
            let rect = box.getBoundingClientRect();
            if (!(rect.x > mx || rect.x + rect.width < mx || rect.y > my || rect.y + rect.height < my)) {
                mom = box;
            }
            else {
                box.style.opacity = '1';
            }
        }
    }
    
    const mw = me.children[0].getBoundingClientRect().width / cellSpacing;
    const mh = me.children[0].getBoundingClientRect().height / cellSpacing;
    if (mom) {
        const momRect = mom.getBoundingClientRect();
        let momCell = getCell(momRect.left, momRect.top);
        // momCell[1] += 1;
        if ([...mom.children].filter(e=>!e.classList.contains('dummy')).length == 0) {
            piv = [momRect.left, momRect.top];
            drawBox(momCell[0], momCell[1], momRect.width / cellSpacing, momRect.height / cellSpacing, '#e79');
            mom.style.opacity = '0.8';
            drawBox(cell[0], cell[1], mw, mh, '#77e', mom.getBoundingClientRect());
            if (!mom.padds) {
                me.mom = mom;
                me.mom.padds = [
                    mom.style.paddingBottom,
                    mom.style.paddingRight,
                    mom.style.paddingLeft,
                    mom.style.paddingTop
                ];
            }
            mom.style.paddingLeft = mom.style.paddingRight = (cell[0] - momCell[0]) * cellSpacing + 'px';
            mom.style.paddingTop = mom.style.paddingBottom = (cell[1] - momCell[1]) * cellSpacing + 'px';
            cm = true;
            if (mom.childNodes.length == 0) {
                mom.innerHTML = `<div class="dummy" style="background: yellow; opacity:0.9; width: ${mw*cellSpacing}px; height: ${mh*cellSpacing}"></div>`;
            }
            me.upsib = undefined;
        }
        else {
            if (mom != me.mom && me.mom) {
                if (me.mom.padds && cm) {
                    me.mom.style.paddingBottom = me.mom.padds[0];
                    me.mom.style.paddingRight = me.mom.padds[1];
                    me.mom.style.paddingLeft = me.mom.padds[2];
                    me.mom.style.paddingTop = me.mom.padds[3];
                    me.mom.padds = undefined;
                }
            }
            cm = false;
            mom.padds = undefined;
            // mom.style.opacity = '0.4';
            let idsib = undefined;
            let upsib = undefined;
            let downsib = undefined;
            for (let sib of mom.children) {
                if (sib == me.temp) continue;
                let sibRect = sib.getBoundingClientRect();
                let sibCell = getCell(sibRect.left, sibRect.top);
                if (my + mh * cellSpacing <= sibRect.top) {
                    downsib = downsib ?? sib;
                }
                else if (my > sibRect.bottom) {
                    upsib = sib;
                }
                else if (cell[1] == sibCell[1]) {
                    idsib = sib;
                }
                else {
                    
                }
            }
            me.idsib = idsib;
            me.upsib = upsib;
            me.downsib = downsib;
            const canvRect = document.querySelector('canvas').getBoundingClientRect();
            if (idsib) {
                drawBox(momCell[0], momCell[1], momRect.width / cellSpacing, momRect.height / cellSpacing, '#e79');
                piv = [
                    idsib.getBoundingClientRect().right,
                    cell[1] * cellSpacing + canvRect.top
                ];
                drawBox(cell[0], cell[1], mw, mh, '#77e', { left: piv[0], top: piv[1] });
            }
            else if (upsib) {
                drawBox(momCell[0], momCell[1], momRect.width / cellSpacing, momRect.height / cellSpacing, '#e79');
                piv = [
                    momRect.left + parseFloat(getComputedStyle(mom).paddingLeft.replace('px', '')),
                    upsib.getBoundingClientRect().bottom
                ];
                drawBox(cell[0], cell[1], mw, mh, '#77e', { left: piv[0], top: piv[1] });
            }
            else {
                me.upsib = undefined;
            }
        }
        me.mom = mom;
    }

    if (mom == wsb) {
        const canvRect = document.querySelector('canvas').getBoundingClientRect();
        wsb.querySelectorAll('.dummy').forEach(e=>e.remove());
        if (me.mom) {
            if (me.mom.padds && cm) {
                me.mom.style.paddingBottom = me.mom.padds[0];
                me.mom.style.paddingRight = me.mom.padds[1];
                me.mom.style.paddingLeft = me.mom.padds[2];
                me.mom.style.paddingTop = me.mom.padds[3];
                me.mom.padds = undefined;
            }
        }
        me.mom = mom;
        if ([...mom.children].filter(e=>!e.classList.contains('dummy')).length == 0) {
            drawBox(cell[0], cell[1], mw, mh);
        }
    }
    
    if (!me.temp) {
        let dcs = getComputedStyle(me.children[0]);
        me.temp = document.createElement('div');
        me.temp.style.position = 'absolute';
        me.temp.innerHTML = me.innerHTML;
        wsb.appendChild(me.temp);
    }

    const wsbr = wsb.getBoundingClientRect();
    me.temp.style.left = cell[0] * cellSpacing + wsbr.left - 0 + 'px';
    me.temp.style.top = cell[1] * cellSpacing + wsbr.top - 18 + 'px';
}