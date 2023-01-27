function topLeftDrag(me, evt) {
    let wsb = document.querySelector('wsbody');
    const mx = evt.clientX;
    const my = evt.clientY;
    drawCanvas();
    const cell = getCell(mx, my);

    let mom = wsb;
    if (me.temp) {
        mom = findMom(me, wsb, mx, my) ?? mom;
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
                savePaddings(me.mom);
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
                loadPaddings(me);
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
                else if (cell[1] >= sibCell[1] && cell[1] + mh <= sibCell[1] + Math.round(sibRect.height) / cellSpacing) {
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
            loadPaddings(me);
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
    me.temp.style.left = cell[0] * cellSpacing + wsbr.left + 'px';
    me.temp.style.top = cell[1] * cellSpacing + wsbr.top - 18 + 'px';
}

function topLeftDrop(me, evt) {
    let wsb = document.querySelector('wsbody');
    for (let k of wsb.querySelectorAll('*')) {
        k.style.opacity = '1';
    }
    if (me.mom) {
        let dummy = me.mom.querySelector('.dummy');
        if (dummy) {
            let { elem } = getEmbodiedElem(me);
            me.mom.insertBefore(elem, dummy);
            dummy.remove();
            if (me.temp) {
                me.temp.remove();
            }
            me.temp = undefined;
            me.mom = undefined;
            return;
        }
        else if (me.idsib) {
            if (getComputedStyle(me.idsib).display == 'block') {
                if (me.idsib.previousSibling) {
                    if (me.idsib.previousSibling.tagName != 'BR') {
                        me.idsib.insertAdjacentHTML('beforebegin', '<br>');
                    }
                }
            }
            me.idsib.style.display = 'inline-block';
            let { tempRect, elem } = getEmbodiedElem(me);
            let ir = me.idsib.getBoundingClientRect();
            elem.style.display = 'inline-block';
            elem.style.marginLeft = Math.max(0, tempRect.left - piv[0]) + 'px';
            // elem.style.marginTop = parseInt(me.idsib.style.marginTop.replace('px', '')) + tempRect.top - me.idsib.getBoundingClientRect().top + 'px';
            elem.style.marginBottom = ir.bottom - tempRect.bottom + 'px';
            me.idsib.insertAdjacentElement('afterend', elem);
            if (me.temp) {
                me.temp.remove();
            }
            me.temp = undefined;
            me.mom = undefined;
            return;
        }
        else if (me.upsib) {
            let { tempRect, elem } = getEmbodiedElem(me);
            elem.style.marginLeft = tempRect.left - piv[0] + 'px';
            elem.style.marginTop = tempRect.top - piv[1] + 'px';
            me.upsib.insertAdjacentElement('afterend', elem);
            if (me.temp) {
                me.temp.remove();
            }
            me.temp = undefined;
            me.mom = undefined;
            return;
        }
        else {
            me.temp = undefined;
            me.mom = undefined;
            return;
        }
        
        if (me.temp) {
            let { tempRect, elem } = getEmbodiedElem(me);
            wsb.insertBefore(elem, me.temp);
            elem.style.marginLeft = tempRect.left - piv[0] + 'px';
            elem.style.marginTop = tempRect.top - piv[1] + 'px';
            me.temp.remove();
        }
    }
    me.temp = undefined;
    me.mom = undefined;
}