let insertDepth = 1;

class AddMenu extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<label>${this.getAttribute('name')}</label>`;
        this.addEventListener('mousedown', this.onclick);
        this.name = this.getAttribute('name');
    }

    onclick(e) {
        openMenu(this.name);
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
        createMenu(this.ws, this.getAttribute('name'), this.actionName);
        this.appendChild(document.createElement('span-menu'));
        this.addEventListener('mousedown', this.onmousedown);
        if (!this.style.height) {
            this.style.height = '250px'
            this.style.right = 'unset';
            this.style.width = '240px';
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

function openMenu(menuname, actionName) {
    let k = document.createElement('some-menu');
    k.setAttribute('name', menuname);
    if (actionName) {
        k.actionName = actionName;
    }
    document.getElementById('menus').appendChild(k);
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
            me.box.fixdiv.style.height = e.clientY - cnty + 8 + 'px';
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
    }
    return false;
});

window.addEventListener('mouseup', (e) => {
    let k = 0;
    if (window.isClicked == 1) {
        resizeMenu(0, 0, false, false);
    }
    else if (window.isClicked == 'place') {
        dropToPlace(window.movingElement, e);
    }
    // else if (window.isClicked == 'place') {
    //     document.querySelectorAll('[temp]').forEach(ne=>{
    //         let rect = ne.getBoundingClientRect();
    //         if (!(rect.x > e.clientX || rect.x + rect.width < e.clientX || rect.y > e.clientY || rect.y + rect.height < e.clientY)) {
    //             k = ne;
    //         }
    //     });
    //     document.querySelectorAll('.outline').forEach(e=>e.classList.remove('outline'));
    // }
    // document.querySelectorAll('[temp]').forEach(e=>{
    //     if (e==k) {
    //         e.removeAttribute('temp');
    //         e.removeAttribute('t2');
    //         e.children[0].style.transform = 'unset';
    //         e.parentElement.insertBefore(e.children[0], e);
    //         e.remove();
    //     }
    //     else {
    //         e.remove()
    //     }
    // });
    if (window.isClicked) {
        save();
    }
    this.movingElement = undefined;
    this.isClicked = false;
    this.isOut = false;
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
                [...wsbody.querySelectorAll('*')].forEach(h=>{
                    let rect = h.getClientRects()[0];
                    let closeButton = document.createElement('button');
                    h.classList.add('outline');
                    closeButton.classList.add('close');
                    closeButton.innerHTML = '-';
                    h.closeButton = closeButton;
                    closeButton.onclick = (e) => {
                        h.querySelectorAll('*').forEach(e=>e.closeButton.onclick());
                        closeButton.remove();
                        h.remove();
                        save();
                    };
                    closeButton.style.left = rect.x + rect.width - 20 + 'px';
                    closeButton.style.top = rect.y + 'px';
                    document.body.appendChild(closeButton);
                });
            }
            window.isBack = true;
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

async function save() {
    setTimeout(()=>{
        let mode = document.querySelector('wsbody').getAttribute('mode');
        if (mode != 'Page') {
            window.builtComponents[mode].html = document.querySelector('wsbody').innerHTML;
        }
        else {
            localStorage.setItem('page', document.querySelector('wsbody').innerHTML);
        }
        localStorage.setItem('components', JSON.stringify(window.builtComponents));
        localStorage.setItem('states', JSON.stringify(window.states));
        localStorage.setItem('actions', JSON.stringify(window.actions));
        localStorage.setItem('menus', JSON.stringify([...document.getElementById('menus').children].map(e=>{
            let { top, left, right, width, height } = e.style;
            let an = e.actionName;
            let type = e.getAttribute('name');
            let x = 0;
            if (e.fixdiv !== undefined) {
                x = e.fixdiv.parentElement.id.substring(2);
            }
            return [top, left, right, width, height, type, x, an];
        })));
    },0);
}

async function load() {
    window.builtComponents = {};
    for (let k of Object.keys(defaultBuiltComponents)) {
        window.builtComponents[k] = defaultBuiltComponents[k];
    }
    if (localStorage.getItem('states')) {
        window.builtComponents = JSON.parse(localStorage.getItem('components'));
        
        for (let bc of Object.keys(window.builtComponents)) {
            if (!window.builtComponents[bc]) {
                continue;
            }
            let attrs = window.builtComponents[bc].attributes;
            blockmap['ComponentCreate' + bc] = {
                html: 'Create ' + bc + ' ' + attrs.map(e=>e+':?T'),
                category: 'ui',
                isArgs: true,
                exp: (e) => `#${e}`,
                exec: ((stc, local, ...params) => {
                    return make('user-built-component').set('attrs', params).set('componentName', bc).elem;
                })
            };
        }
        window.actions = JSON.parse(localStorage.getItem('actions'));
        window.states = JSON.parse(localStorage.getItem('states'));
        document.querySelector('wsbody').innerHTML = localStorage.getItem('page');
        let menus = JSON.parse(localStorage.getItem('menus'));
        let d = document.getElementById('menus');
        for (let m of menus) {
            let [top, left, right, width, height, type, fix, an] = m;
            let e = document.createElement('some-menu');
            e.setAttribute('name', type);
            e.style.height = height;
            e.style.width = width;
            e.style.right = right;
            e.style.left = left;
            e.actionName = an;
            e.style.top = top;
            if (fix) {
                let fd = document.createElement('div');
                fd.formenu = e;
                e.fixdiv = fd;
                document.querySelector('#ws' + fix).appendChild(fd);
                fd.style.height = parseFloat(height.substring(0, height.length - 2)) + 8 + 'px';
                fd.style.width = parseFloat(width.substring(0, width.length - 2)) + 'px';
            }
            d.appendChild(e);
        }
        document.querySelectorAll('.outline').forEach(e=>e.classList.remove('outline'));
    }
    else {
        window.states = {};
    }
}

let bos = () => {
    resizeMenu(0, 0, 0 ,0);
    return true;
};

document.getElementById('wsright').addEventListener('scroll', bos);
document.getElementById('wsleft').addEventListener('scroll', bos);
document.getElementById('reset').addEventListener('click', () => {
    localStorage.clear();
    location.href += '';
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
    wsb.innerHTML = localStorage.getItem('page');
    wsb.setAttribute('mode', 'Page');
});