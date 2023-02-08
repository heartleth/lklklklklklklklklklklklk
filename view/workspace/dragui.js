let placeAnchor = 'tl';

let piv = [0, 0];
let cm = false;

function dragToPlace(me, evt) {
    if (placeAnchor == 'tl') {
        topLeftDrag(me, evt);
    }
    else if (placeAnchor == 'tm') {
        topMiddleDrag(me, evt);
    }
}

function dropToPlace(me, evt) {
    if (placeAnchor == 'tl') {
        topLeftDrop(me, evt);
    }
}

function findMom(me, wsb, mx, my) {
    let mom = undefined;
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
    return mom;
}

function savePaddings(mom) {
    mom.padds = [
        mom.style.paddingBottom,
        mom.style.paddingRight,
        mom.style.paddingLeft,
        mom.style.paddingTop
    ];
}

function loadPaddings(me, mom) {
    if (me.mom.padds) {
        me.mom.style.paddingBottom = me.mom.padds[0];
        me.mom.style.paddingRight = me.mom.padds[1];
        me.mom.style.paddingLeft = me.mom.padds[2];
        me.mom.style.paddingTop = me.mom.padds[3];
        me.mom.padds = undefined;
    }
}

function getEmbodiedElem(me) {
    let tempRect = me.temp.getBoundingClientRect();
    me.template[0].embody();
    let elem = me.template[0].elem;
    return { elem, tempRect };
}