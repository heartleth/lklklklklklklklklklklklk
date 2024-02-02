let insertDepth = 1;

class AddMenu extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<label>${this.getAttribute('name')}</label>`;
        this.addEventListener('mousedown', this.onclick);
        this.name = this.getAttribute('name');
    }

    onclick(e) {
        if (this.name == 'action') {
            openMenu('edit functor', [...Object.keys(window.actions)][0], undefined, undefined);
        }
        else {
            openMenu(this.name);
        }
    }
}
customElements.define('add-menu', AddMenu);

class DragMenu extends HTMLElement {
    connectedCallback() {
        this.box = this.parentElement;
        this.addEventListener('mousedown', this.onmousedown);
        this.addEventListener('mouseup', this.onmouseup);
        this.isClicked = 0;
    }

    static get observedAttributes() {
        return ['close'];
    }
    
    attributeChangedCallback() {
        if (this.getAttribute('close') == 'true') {
            let bt = document.createElement('button');
            bt.addEventListener('click', (c) => {
                if (this.parentElement.fixdiv !== undefined) {
                    this.parentElement.fixdiv.remove();
                }
                resizeMenu(0, 0, false, false);
                this.parentElement.remove();
                save();
            });
            this.appendChild(bt);
        }
    }

    onmousedown(e) {
        let a = this.getClientRects()[0].x - 4;
        let b = this.getClientRects()[0].y - 4;
        this.offset = [a - e.clientX, b - e.clientY];
        this.isClicked = 1;
        window.movingElement = this;
        window.isClicked = 1;
    }
}
customElements.define('drag-menu', DragMenu);

class SpanMenu extends HTMLElement {
    connectedCallback() {
        this.innerHTML += `<div></div>`;
        this.box = this.parentElement;
        this.addEventListener('mousedown', this.onmousedown);
        this.addEventListener('mouseup', this.onmouseup);
        this.isClicked = 0;
    }

    onmousedown(e) {
        const clientRect = this.getClientRects()[0];
        let a = clientRect.x - 4;
        let b = clientRect.y - 4;
        this.offset = b - e.clientY;
        window.isClicked = 2;
        this.isClicked = 2;
        if (a + clientRect.width - e.clientX < -2) {
            window.isClicked = 3;
            this.isClicked = 3;
        }
        window.movingElement = this;
    }
}
customElements.define('span-menu', SpanMenu);

class SomeMenu extends HTMLElement {
    connectedCallback() {
        this.style.zIndex = '1';
        this.classList.add('draggablemenu');
        let dm = document.createElement('drag-menu');
        dm.setAttribute('close', true);
        this.appendChild(dm);
        this.ws = document.createElement('div');
        this.ws.classList.add('menuws');
        this.appendChild(this.ws);
        createMenu(this.ws, this.getAttribute('name'), this.actionName, this.editing, this.dsn);
        this.appendChild(document.createElement('span-menu'));
        this.addEventListener('mousedown', this.onmousedown);
        if (!this.style.height) {
            this.style.height = '250px'
            this.style.right = 'unset';
            this.style.width = '280px';
            this.style.left = '100px';
            this.style.top = '50px';
        }
        save();
    }

    onmousedown(e) {
        [...this.parentElement.children].forEach(c=>c.style.zIndex=0);
        this.style.zIndex = 1;
    }
}
customElements.define('some-menu', SomeMenu);

function openMenu(menuname, actionName, editing, dsn, rect) {
    let k = document.createElement('some-menu');
    k.setAttribute('name', menuname);
    k.editing = editing;
    k.dsn = dsn;
    if (actionName) {
        k.actionName = actionName;
    }
    document.getElementById('menus').appendChild(k);
    if (rect) {
        k.style.top = rect.top + 'px';
        k.style.left = rect.right + 'px';
    }
    return k;
}

window.onload = (e) => {
    load();
}

function setDStyle(d, dcs) {
    for (let st of dcs) {
        d.style[st] = dcs[st];
    }
    d.style.width = d.style.minWidth = d.style.minHeight = d.style.height = '20px';
    d.style.margin = d.style.padding = '0px';
    d.style.marginInline = '0px';
    d.style.marginBlock = '0px';
    d.style.textAlign = 'left';
    d.style.fontSize = '1em';
}

window.addEventListener('mousemove', (e)=>{
    window.srce = e.srcElement;
    recc = [e.clientX, e.clientY];
    if (!!this.isClicked) {
        let me = this.movingElement;
        if (this.isClicked == 1) {
            const boxRect = me.box.getClientRects()[0];
            let centerx = window.innerWidth / 2
            let left = me.offset[0] + e.clientX;
            if (left < centerx) {
                left = Math.max(0, left);
                if (left <= 8) {
                    if (me.box.fixdiv === undefined) {
                        fixMenu('left', boxRect, me.box);
                    }
                    me.box.style.right = 'unset';
                    me.box.style.left = '0px';
                }
                else {
                    me.box.style.left = left + 'px';
                    me.box.style.right = 'unset';
                    if (me.box.fixdiv !== undefined) {
                        me.box.fixdiv.remove();
                        me.box.fixdiv = undefined;
                    }
                }
            }
            else {
                const boxRect = me.box.getClientRects()[0];
                let right = window.innerWidth - left - boxRect.width;
                right = Math.max(0, right);
                if (right <= 8) {
                    if (me.box.fixdiv === undefined) {
                        fixMenu('right', boxRect, me.box);
                    }
                    me.box.style.right = '0px';
                    me.box.style.left = 'unset';
                }
                else {
                    me.box.style.right = right + 'px';
                    me.box.style.left = 'unset';
                    if (me.box.fixdiv !== undefined) {
                        me.box.fixdiv.remove();
                        me.box.fixdiv = undefined;
                    }
                }
            }
            let top = me.offset[1] + e.clientY;
            top = (top > 8) * top;
            me.box.style.top = Math.max(18, top) + 'px';
        }
        else if (this.isClicked == 2) {
            const boxRect = me.box.getClientRects()[0];
            let cnty = boxRect.y;
            me.box.style.height = Math.max(e.clientY - cnty, 180) + 'px';
            // me.box.fixdiv.style.height = e.clientY - cnty + 8 + 'px';
            resizeMenu(0, 0, false, false);
        }
        else if (this.isClicked == 3) {
            const boxRect = me.box.getClientRects()[0];
            if (me.box.fixdiv !== undefined) {
                if (boxRect.x != 0) {
                    return false;
                }
            }
            let cntx = boxRect.x;
            let width = e.clientX - cntx;
            width = Math.max(164, width)
            if (me.box.style.left == 'unset') {
                let nbr = me.box.getClientRects()[0];
                me.box.style.right = window.innerWidth - nbr.x - width - 8 + 'px';
                me.box.style.width = width + 'px';
            }
            else {
                me.box.style.width = width + 'px';
            }
            let cnty = boxRect.y;
            let height = e.clientY - cnty;
            me.box.style.height = Math.max(height, 180) + 'px';
            if (me.box.fixdiv !== undefined) {
                me.box.fixdiv.style.height = e.clientY - cnty + 8 + 'px';
                me.box.fixdiv.style.width = me.box.style.width;
                if (boxRect.x == 0) {
                    resizeMenu(me.box.style.width, 0, true, false);
                }
            }
        }
        else if (this.isClicked == 'place') {
            dragToPlace(me, e);
        }
        else if (this.isClicked == 'set') {
            dragToSet(me, e);
        }
    }
    else if (this.resizing) {
        let { ctx, element, direction, begin, original, drawOriginal, originalStyle, ow } = this.resizing;
        const distX = Math.round((e.clientX - begin[0]) / cellSpacing) * cellSpacing;
        const distY = Math.round((e.clientY - begin[1]) / cellSpacing) * cellSpacing;
        ctx.strokeStyle = 'rgba(255, 101, 110, 0.9)';
        ctx.strokeRect(...drawOriginal);
        if (direction == 'top') {
            if (element.tagName != 'IMG') {
                element.style.minHeight = lpx(original.minHeight) - distY + 'px';
            }
            else {
                element.height = drawOriginal[3] - distY;
                element.style.height = drawOriginal[3] - distY + 'px';
            }
            if (isLen(originalStyle.marginBottom)) {
                // element.style.marginBottom = parseFloat(original.marginBottom) - distY + 'px';
            }
            else if (isLen(originalStyle.marginTop)) {
                element.style.marginTop = Math.max(0, lpx(original.marginTop) + distY) + 'px';
            }
        }
        else if (direction == 'left') {
            if (element.tagName == 'IMG') {
                element.style.marginLeft = Math.max(0, lpx(original.marginLeft) + distX) + 'px';
                element.width = drawOriginal[2] - distX;
                element.style.width = drawOriginal[2] - distX + 'px';
            }
            else if (!isLen(originalStyle.marginLeft)) {
                element.style.minWidth = lpx(original.minWidth) - distX * 2 + 'px';
            }
            else {
                element.style.marginLeft = Math.max(0, lpx(original.marginLeft) + distX) + 'px';
                element.style.minWidth = lpx(original.minWidth) - distX + 'px';
            }
        }
        else if (direction == 'right' && isLen(originalStyle.minWidth)) {
            if (isLen(originalStyle.marginRight)) {
                element.style.marginRight = Math.max(0, lpx(original.marginRight) - distX) + 'px';
                element.style.minWidth = '10px';
            }
            else if (!isLen(originalStyle.marginLeft)) {
                element.style.minWidth = lpx(original.minWidth) + 2 * distX + 'px';
            }
            else {
                element.style.minWidth = lpx(original.minWidth) + distX + 'px';
            }
        }
        else if (direction == 'right' && element.tagName[0] == 'H' && element.tagName.length == 2) {
            let ow = Math.round((lpx(original.minWidth) ?? lpx(original.width)) / cellSpacing) * cellSpacing;
            element.style.maxWidth = ow + distX + 'px';
            element.style.minWidth = ow + distX + 'px';
            element.style.width = element.style.minWidth;
        }
        else if (direction == 'right' && element.tagName == 'IMG') {
            let ow = Math.round((lpx(original.width)) / cellSpacing) * cellSpacing;
            element.style.width = ow + distX + 'px';
        }
        else if (direction == 'bottom' && isLen(originalStyle.minHeight)) {
            if (isLen(originalStyle.marginBottom)) {
                element.style.marginBottom = Math.max(0, lpx(original.marginBottom) - distY) + 'px';
            }
            element.style.minHeight = lpx(original.minHeight) + distY + 'px';
        }
        else if (direction == 'bottom' && isLen(originalStyle.height)) {
            if (isLen(originalStyle.marginBottom)) {
                element.style.marginBottom = Math.max(0, lpx(original.marginBottom) - distY) + 'px';
            }
            element.style.height = lpx(original.height) + distY + 'px';
        }
    }
    else if (this.ojf) {
        let menus = document.getElementById('menus');
        for (let menu of menus.children) {
            if (menu.getAttribute('name') == 'edit functor') {
                if (isInRect(...recc, menu.children[1].getClientRects()[0])) {
                    menu.children[1].children[0].elemToBlock(this.ojf);
                    this.ojf = false;
                }
            }
        }
    }
    return false;
});

function isLen(l) {
    if (l) {
        return l != 'auto';
    }
    else {
        return false;
    }
}

window.addEventListener('mouseup', (e) => {
    drawCanvas();
    let k = 0;
    if (window.isClicked == 1) {
        resizeMenu(0, 0, false, false);
    }
    else if (window.isClicked == 'place') {
        dropToPlace(window.movingElement, e);
    }
    else if (window.isClicked == 'set') {
        dropToSet(window.movingElement, e);
    }
    if (window.isClicked) {
        save();
    }
    if (window.resizing) {
        save();
    }
    this.movingElement = undefined;
    this.isClicked = false;
    this.resizing = false;
    this.isOut = false;
    this.ojf = false;
    
    if (window.undo.length == 0) {
        window.undo.push({ ...localStorage });
        window.redo = [];
    }
    else {
        if (JSON.stringify(window.undo[window.undo.length - 1]) != JSON.stringify({ ...localStorage })) {
            window.undo.push({ ...localStorage });
            window.redo = [];
            if (window.undo.length > 15) {
                window.undo.shift();
            }
        }
    }
    return false;
});

function fixMenu(position, rect, box) {
    if (position == 'left') {
        let left = document.getElementById('wsleft');
        let div = document.createElement('div');
        div.style.height = rect.height + 8 + 'px';
        div.style.width = rect.width - 8 + 'px';
        div.formenu = box;
        box.fixdiv = div;
        left.appendChild(div);
        resizeMenu(rect.width - 8 + 'px', 0, true, false);
    }
    else if (position == 'right') {
        let right = document.getElementById('wsright');
        let div = document.createElement('div');
        div.style.height = rect.height + 8 + 'px';
        div.style.width = rect.width - 8 + 'px';
        div.formenu = box;
        box.fixdiv = div;
        right.appendChild(div);
        resizeMenu(0, rect.width - 8 + 'px', false, true);
    }
}

function resizeMenu(llw, rlw, awl, awr) {
    let left = document.getElementById('wsleft');
    [...left.children].forEach(c=>{
        if (awl) {
            c.formenu.style.width = c.style.width = llw;
        }
        let { x, y } = c.getClientRects()[0];
        c.formenu.style.left = x + 'px';
        c.formenu.style.top = y + 'px';
    });

    let right = document.getElementById('wsright');
    [...right.children].forEach(c=>{
        if (awr) {
            c.formenu.style.width = c.style.width = rlw;
        }
        let { x, y } = c.getClientRects()[0];
        c.formenu.style.left = x + 'px';
        c.formenu.style.top = y + 'px';
    });
}

window.onkeydown = (k) => {
    if (document.activeElement == document.body) {
        let wsbody = document.querySelector('wsbody');
        if (k.key == 'o') {
            [...wsbody.querySelectorAll('*')].forEach(k=>{
                k.classList.add('outline');
            });
        }
        if (k.key == 'Backspace') {
            if (!window.isBack) {
                [...wsbody.querySelectorAll('*')].forEach(h => {
                    if (h.parentElement.tagName == 'USER-BUILT-COMPONENT') {
                        return;
                    }
                    let rect = h.getClientRects()[0];
                    let closeButton = document.createElement('button');
                    h.classList.add('outline');
                    closeButton.classList.add('close');
                    closeButton.innerHTML = '-';
                    h.closeButton = closeButton;
                    closeButton.onclick = (e) => {
                        h.querySelectorAll('*').forEach(e=>{
                            if (e.closeButton) {
                                e.closeButton.onclick();
                            }
                            else {
                                e.remove();
                            }
                        });
                        closeButton.remove();
                        h.remove();
                        save();
                        drawCanvas();
                    };
                    closeButton.style.left = rect.x + rect.width - 20 + 'px';
                    closeButton.style.top = rect.y + 'px';
                    document.body.appendChild(closeButton);
                });
            }
            window.isBack = true;
        }
        if (k.key == 'y' && k.ctrlKey) {
            redof();
        }
        else if (k.key == 'z' && k.ctrlKey) {
            undof();
        }
    }
};

window.onkeyup = (k) => {
    if (k.key == 'Backspace') {
        window.isBack = false;
        document.querySelectorAll('button.close').forEach(e=>e.remove());
        document.querySelectorAll('.outline').forEach(e=>e.classList.remove('outline'));
    }
    if (k.key == 'o') {
        document.querySelectorAll('.outline').forEach(e=>e.classList.remove('outline'));
    }
};

let bos = () => {
    resizeMenu(0, 0, 0 ,0);
    return true;
};

document.getElementById('wsright').addEventListener('scroll', bos);
document.getElementById('wsleft').addEventListener('scroll', bos);
document.getElementById('reset').addEventListener('click', () => {
    if (require) {
        let electron = require('electron');
        let tables = localStorage.getItem('tables');
        if (tables === null || tables == 'null') tables = '{}';
        electron.ipcRenderer.send('DBInitDatabase', Object.keys(JSON.parse(tables)));
        electron.ipcRenderer.once('OKDBInitDatabase', (e) => {
            localStorage.clear();
            location.href = location.href.split('#')[0];
        });
    }
    else {
        localStorage.clear();
        location.href = location.href.split('#')[0];
    }
});

document.getElementById('wsff').addEventListener('scroll', () => {
    [...document.querySelector('wsbody').querySelectorAll('*')].forEach(h=>{
        if (h.closeButton) {
            let rect = h.getClientRects()[0];
            h.closeButton.style.left = rect.x + rect.width - 20 + 'px';
            h.closeButton.style.top = rect.y + 'px';
        }
    });
});

document.getElementById('toPage').addEventListener('click', () => {
    let wsb = document.querySelector('wsbody');
    save();
    wsb.innerHTML = localStorage.getItem(getPage() + 'page');
    wsb.setAttribute('mode', 'Page');
});

document.getElementById('makeServer').addEventListener('click', (e) => {
    e.preventDefault();
    if (require) {
        let electron = require('electron');
        let wsb = document.querySelector('wsbody');
        wsb.setAttribute('mode', 'Page');
        electron.ipcRenderer.send('makeServer',
            wsb.innerHTML,
            window.builtComponents,
            window.actions,
            window.states,
            { ...localStorage }
        );
    }
});

function saveAsFile() {
    save();
    if (require) {
        let electron = require('electron');
        electron.ipcRenderer.send('saveAsFile', { ...localStorage });
        electron.ipcRenderer.once('savedPath', (e, path) => {
            if (path) {
                localStorage.setItem('saveFilePath', path);
            }
        })
    }
}

document.getElementById('saveAsFile').addEventListener('click', () => saveAsFile());

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key == 's') {
        e.preventDefault();
        saveAsFile();
    }
})

document.getElementById('loadFromFile').addEventListener('click', () => {
    if (require) {
        let electron = require('electron');
        electron.ipcRenderer.send('loadFile', { ...localStorage });
        electron.ipcRenderer.once('loadedLS', (e, lc) => {
            localStorage.clear();
            for (let k in lc) {
                localStorage.setItem(k, lc[k]);
            }
            location.reload();
        });
    }
});

document.getElementById('help').addEventListener('click', () => {
    if (require) {
        let electron = require('electron');
        electron.shell.openExternal('https://heartleth.github.io/lklklklklklklklklklklklk/docs');
    }
});

document.getElementById('appearance').addEventListener('click', () => {
    let canv = document.querySelector('canvas');
    if (canv.style.display == 'none') {
        canv.style.display = 'block';
    }
    else if (canv.style.display == 'block') {
        canv.style.display = 'none';
    }
});

function undof() {
    if (window.undo.length > 0) {
        window.redo.push({ ...localStorage });
        let wu = window.undo[window.undo.length - 1];
        localStorage.clear();
        for (let key in wu) {
            localStorage.setItem(key, wu[key]);
        }
        window.undo.pop();
        if (window.undo.length == 0) {
            window.undo.push({ ...localStorage });
        }
        document.getElementById('menus').innerHTML = '';
        load();
    }
}

function redof() {
    if (window.redo.length > 0) {
        window.undo.push({ ...localStorage });
        let wu = window.redo[window.redo.length - 1];
        localStorage.clear();
        for (let key in wu) {
            localStorage.setItem(key, wu[key]);
        }
        window.redo.pop();
        document.getElementById('menus').innerHTML = '';    
        load();
    }
}

document.getElementById('undo').addEventListener('click', undof);
document.getElementById('redo').addEventListener('click', redof);