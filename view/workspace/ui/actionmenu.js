let itmb = 0;
let mzi = 0;

window.actions = {};
window.locals = {};

class ActionInput extends HTMLElement {
    connectedCallback() {
        this.actionName = this.actionName ?? '';
        this.render();
    }

    render() {
        this.innerHTML = '';
        this.actionNameInput = make('select').addClass('fullStateName').elem;
        this.actionNameInput.innerHTML = Object.keys(window.actions).filter(t=>t.length&&t[0]!='_').map(t=>`<option>${t}</option>`).join('');
        this.appendChild(this.actionNameInput);
        let newActionNameInput = make('text').addClass('newStateName').elem;
        this.appendChild(newActionNameInput);
        let makeNewAction = make('button').addClass('newstate').html('+').elem;
        makeNewAction.addEventListener('click', () => {
            window.actions[newActionNameInput.value] = {
                code: []
            };
            document.querySelectorAll('action-input>select.fullStateName').forEach(e=>{
                if (e == this.actionNameInput) {
                    e.innerHTML = Object.keys(window.actions).filter(t=>t.length&&t[0]!='_').map(t=>`<option${t===newActionNameInput.value?' selected="selected"':''}>${t}</option>`).join('');
                }
                else {
                    e.innerHTML = Object.keys(window.actions).filter(t=>t.length&&t[0]!='_').map(t=>`<option${t===e.value?' selected="selected"':''}>${t}</option>`).join('');
                }
                e.dispatchEvent(new Event('change'));
            });
            save();
        });
        let removeAction = make('button').addClass('newstate').html('-').elem;
        removeAction.addEventListener('click', () => {
            if (this.actionNameInput.value) {
                if (this.actionNameInput.value.length) {
                    delete window.actions[this.actionNameInput.value];
                    document.querySelectorAll('select.stateName').forEach(e=>{
                        e.innerHTML = Object.keys(window.states).filter(t=>t.length&&t[0]!='_').map(t=>`<option>${t}</option>`).join('');
                    });
                }
            }
        });
        this.appendChild(makeNewAction);
        this.appendChild(removeAction);
        this.appendChild(make('line').elem);
        this.fe = make('function-edit').attr('actionName', this.actionNameInput.value).elem;
        this.appendChild(this.fe);
        this.actionNameInput.addEventListener('change', () => {
            this.fe.actionName = this.actionNameInput.value;
            this.fe.render();
        });
    }
    
    hide() {
        this.classList.add('hide');
    }

    show() {
        this.classList.remove('hide');
        this.render();
    }
    
    get usingStates() {
        return [];
    }

    get functor() {
        return `callfunctionwithus('${this.actionNameInput.value}')`;
    }
}

function callfunctionwithus(c) {
    let stc = [];
    let bp = getPage();
    let local = (Math.random() + 1).toString(36).substring(7);
    window.locals[local] = {};
    actfunctioncode(stc, local, window.actions[c].code);
    let ap = getPage();
    if (bp == ap) {
        updateState(stc);
    }
    else {
        location.reload();
    }
}

function actfunctioncode(stc, local, codes) {
    for (let code of codes) {
        if (blockmap[code.name].category == 'control') {
            const child = {
                run: (stc, local) => code.child ? actfunctioncode(stc, local, code.child):''
            };
            blockmap[code.name].exec(stc, local, child, ...code.params);
        }
        else {
            blockmap[code.name].exec(stc, local, ...code.params);
        }
    }
}

class FunctionEdit extends HTMLElement {
    connectedCallback() {
        this.actionName = this.getAttribute('actionName');
        this.render();
    }

    render() {
        this.innerHTML = '';
        let rawCode = make('div').addClass('useStatesList').elem;
        rawCode.innerText = JSON.stringify(window.actions[this.actionName]);
        rawCode.reload = () => {rawCode.innerText = JSON.stringify(window.actions[this.actionName]);};
        this.appendChild(rawCode);
        let openEdit = make('div').addClass('openActionEditor').html('Open Editor').elem;
        openEdit.addEventListener('click', () => {
            openMenu('edit functor', this.actionName);
            rawCode.innerText = JSON.stringify(window.actions[this.actionName]);
        });
        this.appendChild(openEdit);
    }

    getList() {
        return window.actions[this.actionName].useState;
    }

    static get observedAttributes() {
        return ['actionName'];
    }
    
    attributeChangedCallback() {
        this.actionName = this.getAttribute('actionName');
        this.render();
    }
}

window.customElements.define('action-input', ActionInput);
window.customElements.define('function-edit', FunctionEdit);

function functoreditmenu(ws, funcName) {
    ws.classList.add('functionEdit');
    if (!ws.parentElement.style.height) {
        ws.parentElement.style.top = '100px';
        ws.parentElement.style.height = '500px';
        ws.parentElement.style.width = '400px';
        ws.parentElement.style.left = '20px';
    }
    let funceditwin = make('function-edit-window').attr('actionName', funcName).elem;
    ws.appendChild(funceditwin);
}

class FunctionEditWindow extends HTMLElement {
    connectedCallback() {
        this.init();
    }
    
    init() {
        this.actionName = this.getAttribute('actionName');
        if (this.actionName) {
            let rect = this.getBoundingClientRect();
            if (window.actions[this.actionName].code) {
                this.start = make('function-edit-block').addClass('start').html('Event start: ' + this.actionName).elem;
                this.start.style.left = '10px';
                this.start.style.top = '45px';
                this.appendChild(this.start);
                this.loadCode(this.start, window.actions[this.actionName].code);
            }
            else {
                this.starts = {};
                let i = 0;
                for (let k of Object.keys(window.actions[this.actionName])) {
                    let start = make('function-edit-block').addClass('start').html(k).elem;
                    start.style.left = '10px';
                    start.style.top = 45 + 60 * i + 'px';
                    this.appendChild(start);
                    this.starts[k] = (start);
                    this.loadCode(start, window.actions[this.actionName][k].code, k);
                    i += 1;
                }
            }
            this.blockNav = make('div').addClass('blockNav').elem;
            this.hideAddBlocks = make('button').text('-').addClass('newstate').elem;
            this.addBlocks = make('div').elem;
            this.hideAddBlocks.addEventListener('click', () => {
                if (this.hideAddBlocks.innerText == '-') {
                    this.hideAddBlocks.style.bottom = '20px';
                    this.addBlocks.style.display = 'none';
                    this.blockNav.style.display = 'none';
                    this.hideAddBlocks.innerText = '+';
                }
                else if (this.hideAddBlocks.innerText == '+') {
                    this.hideAddBlocks.style.bottom = '210px';
                    this.addBlocks.style.display = 'block';
                    this.blockNav.style.display = 'flex';
                    this.hideAddBlocks.innerText = '-';
                }
            });
            this.hideAddBlocks.click();
            this.appendChild(this.hideAddBlocks);
            this.appendChild(this.blockNav);
            registerBlocks(this);
            this.appendChild(this.addBlocks);
            this.addEventListener('mousemove', this.onmousemove);
            this.addEventListener('mouseup', this.onmouseup);
        }
    }

    loadCode(t, codes, vk) {
        let tail = t ?? this.start;
        for (let code of codes) {
            tail = make('function-edit-block')
                .html(parseBlock(blockmap[code.name].html))
                .addClass(blockmap[code.name].category)
                .set('up', tail)
                .set('name', code.name)
                .set('params', code.params).elem;
            tail.name = code.name;
            
            this.appendChild(tail);
            if (code.child) {
                let c = make('function-edit-block')
                    .html(parseBlock(blockmap[code.child[0].name].html))
                    .addClass(blockmap[code.child[0].name].category)
                    .set('parent', tail)
                    .set('name', code.child[0].name)
                    .set('params', code.child[0].params).elem;
                this.appendChild(c);

                let i = 0;
                for (let param of code.child[0].params) {
                    if (c.children[i].tagName == 'SMALL-VALUE') {
                        c.children[i].setValue(param);
                        let k = c.children[i];
                        c.children[i].addEventListener('change', () => {
                            window.actions[this.actionName].code[i] = k.val;
                        });
                        i += 1;
                    }
                }

                tail.child = c;
                if (code.child.length > 1) {
                    this.loadCode(c, code.child.slice(1));
                }
                tail.render(undefined, undefined, true);
            }
            
            if (vk) {
                let i = 0;
                for (let param of code.params) {
                    if (tail.children[i].tagName == 'SMALL-VALUE') {
                        tail.children[i].setValue(param, true);
                        let k = tail.children[i];
                        tail.children[i].addEventListener('change', () => {
                            window.actions[this.actionName][vk].code[i] = k.val;
                        });
                        i += 1;
                    }
                }
            }
            else {
                let i = 0;
                for (let param of code.params) {
                    if (tail.children[i].tagName == 'SMALL-VALUE') {
                        tail.children[i].setValue(param, true);
                        let k = tail.children[i];
                        tail.children[i].addEventListener('change', () => {
                            window.actions[this.actionName].code[i] = k.val;
                        });
                        i += 1;
                    }
                }
            }
        }
    }

    registerBlock(block) {
        let cb = block.make().elem;
        this.addBlocks.appendChild(cb);
        cb.addEventListener('mousedown', () => {
            let k = block.make().elem;
            this.appendChild(k);
            k.offset = [-10, -10];
            this.movingElement = k;
        });
    }
    
    onmousemove(e) {
        if (this.movingElement) {
            let me = this.movingElement;
            let boxRect = this.getBoundingClientRect();
            if (me.classList.contains('args')) {
                if (me.template) {
                    let tx = e.clientX + me.offset[0];
                    let ty = e.clientY + me.offset[1];
                    let bx = me.getBoundingClientRect().left;
                    let by = me.getBoundingClientRect().top;
                    if (Math.hypot(tx - bx, ty - by) > 10) {
                        me.template.expression = null;
                        me.template.render();
                        me.template = null;
                    }
                    me.render();
                }
                else {
                    let px = e.clientX + me.offset[0] + 9;
                    let py = e.clientY + me.offset[1] + 22;
                    me.style.left = Math.min(Math.max(9, px - boxRect.left), this.clientHeight-80-me.clientHeight) + 'px';
                    me.style.top =  Math.min(Math.max(22, py - boxRect.top), this.clientHeight-80-me.clientHeight) + 'px';
                    let mx = me.getBoundingClientRect().left;
                    let my = me.getBoundingClientRect().top;
                    let ups = [...this.querySelectorAll('function-edit-block>small-value')].filter(e=>{
                        if (e.tagName == 'DIV') {
                            return false;
                        }
                        let tx = e.getBoundingClientRect().left;
                        let ty = e.getBoundingClientRect().top;
                        return Math.hypot(tx - mx, ty - my) < 10;
                    });

                    if (ups.length) {
                        if (ups[0] == me.children[0]) {
                            return;
                        }
                        let tx = ups[0].getBoundingClientRect().left;
                        let ty = ups[0].getBoundingClientRect().top;
                        me.style.left = tx - boxRect.left + 9 + 'px';
                        me.style.top = ty - boxRect.top + 21 + 'px';
                        for (let c of me.children) {
                            if (c.tagName == 'SMALL-VALUE') {
                                c.relocate(this.style.zIndex);
                            }
                        }
                        me.template = ups[0];
                        ups[0].setExpression(me);
                        ups[0].style.width = me.getBoundingClientRect().width + 'px';
                    }
                    me.render();
                }
            }
            else if (me.up || me.parent) {
                let tx = e.clientX + me.offset[0];
                let ty = e.clientY + me.offset[1];
                let bx = me.getBoundingClientRect().left;
                let by = me.getBoundingClientRect().top;
                if (Math.hypot(tx - bx, ty - by) > 5) {
                    itmb = true;
                    if (me.parent) {
                        me.parent.child = null;
                        me.parent.style.height = 'unset';
                        me.parent = null;
                    }
                    if (me.up) {
                        me.up.down = null;
                        me.up = null;
                    }
                    me.render();
                    itmb = false;
                }
            }
            else {
                let px = e.clientX + me.offset[0] + 9;
                let py = e.clientY + me.offset[1] + 22;
                me.style.left = Math.min(Math.max(9, px - boxRect.left), this.clientHeight-80-me.clientHeight) + 'px';
                me.style.top =  Math.min(Math.max(22, py - boxRect.top), this.clientHeight-80-me.clientHeight) + 'px';
                for (let c of me.children) {
                    if (c.tagName == 'SMALL-VALUE') {
                        c.relocate(me.style.zIndex);
                    }
                }
                let mx = me.getBoundingClientRect().left;
                let my = me.getBoundingClientRect().top;
                if (me.classList.contains('start')) {
                    me.render([], 1);
                    return;
                }
                let ups = [...this.children].filter(e=>{
                    if (e.tagName == 'div' || e.classList.contains('args')) {
                        return false;
                    }
                    if (e.classList.contains('control')) {
                        let tx = e.getBoundingClientRect().left;
                        let ty = e.getBoundingClientRect().bottom;
                        let tx2 = e.getBoundingClientRect().left + 8;
                        let ty2 = e.getBoundingClientRect().top + 22;
                        return Math.hypot(tx - mx, ty - my) < 5 || Math.hypot(tx2 - mx, ty2 - my) < 5;
                    }
                    let tx = e.getBoundingClientRect().left;
                    let ty = e.getBoundingClientRect().bottom;
                    return Math.hypot(tx - mx, ty - my) < 5;
                });

                if (ups.length) {
                    itmb = true;
                    if (ups[0].classList.contains('control')) {
                        let tx2 = ups[0].getBoundingClientRect().left + 8;
                        let ty2 = ups[0].getBoundingClientRect().top + 22;
                        if (Math.hypot(tx2 - mx, ty2 - my) < 5) {
                            if (me.familyTree().includes(ups[0])) {
                                return;
                            }
                            
                            if (!ups[0].child) {
                                ups[0].child = me;
                                me.parent = ups[0];
                            }
                            else {
                                let c = ups[0].child;
                                ups[0].child = me;
                                me.down = c;
                                c.up = me;
                            }
                            me.parent = ups[0];
                            ups[0].render([], 1);
                            me.render([], 1);
                            return;
                        }
                    }
                    let k = me.down;
                    let dk = me;
                    while (k) {
                        if (k === ups[0]) {
                            return;
                        }
                        dk = k;
                        k = k.down;
                    }

                    if (me.familyTree().includes(ups[0])) {
                        return;
                    }
                    
                    if (ups[0].down) {
                        ups[0].down.up = dk;
                        dk.down = ups[0].down;
                        ups[0].down = me;
                        me.up = ups[0];
                    }
                    else {
                        ups[0].down = me;
                        me.up = ups[0];
                    }
                    ups[0].render([], 1);
                    let u = me;
                    while (u) {
                        if (u.parent) {
                            u.parent.render([], 1);
                            u = u.parent;
                        }
                        else {
                            u = u.up;
                        }
                    }
                    itmb = false;
                }
                else {
                    itmb = true
                    me.render([], 1);
                    itmb = false;
                }
            }
        }
    }

    onmouseup() {
        this.movingElement = undefined;
        this.saveCode();
    }

    saveCode() {
        if (this.start) {
            if (this.start.down) {
                window.actions[this.actionName].code = this.start.down.makeCode();
                console.log(isServerAction(window.actions[this.actionName].code));
            }
            else {
                window.actions[this.actionName].code = [];
            }
            this.start.render();
            document.querySelectorAll('function-edit > .useStatesList').forEach(e=>e.reload());
            save();
        }
        else {
            for (let k of Object.keys(window.actions[this.actionName])) {
                const start = this.starts[k];
                if (start.down) {
                    window.actions[this.actionName][k].code = start.down.makeCode();
                }
                else {
                    window.actions[this.actionName][k].code = [];
                }
                start.render();
                document.querySelectorAll('function-edit > .useStatesList').forEach(e=>e.reload());
                save();
            }
        }
    }
}

class FunctionEditBlock extends HTMLElement {
    connectedCallback() {
        if (this.parentElement.tagName == 'FUNCTION-EDIT-WINDOW' && !this.classList.contains('args')) {
            if (!this.up) {
                this.up = null;
            }
            else {
                this.up.down = this;
            }
            if (this.classList.contains('control')) {
                this.appendChild(make('div').elem);
            }
            itmb = true;
            this.render([], undefined, true);
            itmb = false;
            this.addEventListener('click', this.onclick);
            this.addEventListener('mousedown', this.onmousedown);
        }
        if (this.parentElement.tagName == 'FUNCTION-EDIT-WINDOW') {
            this.addEventListener('mousedown', this.onmousedown);
            
            if (this.params) {
                let i = 0
                for (let c of this.children) {
                    if (c.tagName == 'SMALL-VALUE') {
                        c.setValue(this.params[i], true);
                        c.render(this.style.zIndex, true);
                        i += 1;
                    }
                }
            }
            [...this.children].forEach(e=>e.addEventListener('change', ()=>{
                this.parentElement.saveCode();
            }))
        }
    }

    onmousedown(e) {
        this.style.zIndex = mzi + 1;
        if (this.child) {
            this.child.style.zIndex = this.style.zIndex + 1;
            itmb = true;

            this.child.render([], undefined, true);
            itmb = false;
            mzi += 1;
        }
        mzi += 1;
        let boxRect = this.parentElement.getBoundingClientRect();
        if (this.up) {
            this.offset = [
                this.getBoundingClientRect().x - e.clientX,
                this.getBoundingClientRect().y - e.clientY
            ];
            this.parentElement.movingElement = this;
        }
        else {
            this.offset = [
                this.getBoundingClientRect().x - e.clientX,
                this.getBoundingClientRect().y - e.clientY
            ];
            this.parentElement.movingElement = this;
        }
    }

    onclick(e) {
        if (this.classList.contains('args')) {
            e.stopPropagation();
        }
        if (e.shiftKey && !this.classList.contains('start')) {
            let p = this.parentElement;
            this.removeBlock();
            p.saveCode();
        }
        if (e.ctrlKey && this.classList.contains('start')) {
            save();
            if (this.down) {
                let stc = [];
                let local = (Math.random() + 1).toString(36).substring(7);
                window.locals[local] = {};
                this.down.run(stc, local);
                updateState(stc);
            }
        }
    }
    
    removeBlock() {
        if (this.up) {
            this.up.down = null;
            this.up = null;
        }
        if (this.parent) {
            this.parent.child = null;
            this.parent = null;
        }
        if (this.child) {
            this.child.removeBlock();
            this.child = null;
        }
        if (this.down) {
            this.down.removeBlock();
            this.down = null;
        }
        this.remove();
    }

    run(stc, local) {
        if (!this.classList.contains('control')) {
            blockmap[this.name].exec(stc, local, ...([...this.children].map(e=>e.val)));
            if (this.down) {
                this.down.run(stc, local);
            }
        }
        else {
            blockmap[this.name].exec(stc, local, this.child, ...([...this.children].map(e=>e.val)));
            if (this.down) {
                this.down.run(stc, local);
            }
        }
    }
    
    render(l=[], b, start) {
        if (this.classList.contains('args')) {
            let i = 0;
            for (let c of this.children) {
                if (c.tagName == 'SMALL-VALUE') {
                    c.relocate(this.style.zIndex);
                    i += 1;
                }
            }
            return;
        }

        let ret = 0;
        let i = 0;
        for (let c of this.children) {
            if (c.tagName == 'SMALL-VALUE') {
                c.relocate(this.style.zIndex);
                i += 1;
            }
        }
        if (this.up) {
            if (!this.up.down) {
                this.up.down = this;
            }
            let rect = this.parentElement.getBoundingClientRect();
            this.style.top = this.up.getClientRects()[0].bottom - rect.top + 22 + 'px';
            this.style.left = this.up.getClientRects()[0].left - rect.left + 9 + 'px';
        }
        if (this.child) {
            if (l.concat([this]).includes(this.child)) {
                this.child = null;
                if (ret) {
                    return ret;
                }
                return this.getBoundingClientRect().height;
            }
            
            this.child.style.left = parseFloat(this.style.left.replace('px', '')) + 9 + 'px';
            this.child.style.top = parseFloat(this.style.top.replace('px', '')) + 23.3 + 'px';
            this.child.style.zIndex = this.style.zIndex + 1;
            let c = this.child.render(l.concat([this]), undefined, start);
            this.style.height = c + 30 + 'px';
            ret = c + 30;
        }
        else {
            this.style.height = '20px';
        }
        if (this.down) {
            if (l.concat([this]).includes(this.down)) {
                this.down = null;
                if (ret) {
                    return ret;
                }
                return this.getBoundingClientRect().height;
            }
            this.down.style.zIndex = this.style.zIndex;
            let h = this.down.render(l.concat([this]), undefined, start);
            ret = this.getBoundingClientRect().height + h;
        }
        if (ret) {
            return ret;
        }
        return this.getBoundingClientRect().height;
    }

    familyTree() {
        let ret = [this];
        if (this.child) {
            ret = ret.concat(this.child.familyTree());
        }
        if (this.down) {
            ret = ret.concat(this.down.familyTree());
        }
        return ret;
    }

    makeCode() {
        let ret = [{
            name: this.name,
            params: [...this.children].map(e=>e.val)
        }];
        if (this.child) {
            ret[0].child = this.child.makeCode();
        }
        if (this.down) {
            ret = ret.concat(this.down.makeCode());
        }
        return ret;
    }

    get val() {
        if (this.classList.contains('args')) {
            return {
                name: this.name,
                params: [...this.children].map(e=>e.val)
            };
        }
    }
}

class BlockCreator {
    constructor(category, name, contents, isArgs) {
        this.category = category;
        this.contente = contents;
        this.isArgs = isArgs;
        this.name = name;
    }
    make() {
        if (this.isArgs) {
            return make('function-edit-block')
                .addClass(this.category)
                .addClass('args')
                .set('name', this.name)
                .html(parseBlock(this.contente));    
        }
        return make('function-edit-block')
            .addClass(this.category)
            .set('name', this.name)
            .html(parseBlock(this.contente));
    }
}

window.customElements.define('function-edit-block', FunctionEditBlock);
window.customElements.define('function-edit-window', FunctionEditWindow);

class SmallValue extends HTMLElement {
    connectedCallback() {
        this.value = this.value ?? '';
        this.render();
        this.m = 0;
    }

    setValue(v, k) {
        this.m = 0;
        this.value = v;
        if (v.substring) {
            if (v.startsWith('#Local:')) {
                this.value = v.substring(7);
                this.m = 2;
            }
            else if (v.startsWith('#State:')) {
                this.value = v.substring(7);
                this.m = 1;
            }
        }
        else {
            if (this.expression) {
                this.expression.remove();
            }
            let code = blockmap[this.name];
            let k = make('function-edit-block')
                .html(parseBlock(blockmap[v.name].html))
                .addClass(blockmap[v.name].category)
                .addClass('args')
                .set('template', this)
                .set('name', v.name)
                .set('params', v.params).elem;
            this.setExpression(k);
            this.parentElement.parentElement.appendChild(k);
        }
        // if (k) {
        this.render();
        // }
    }
    
    setExpression(exp) {
        this.expression = exp;
    }
    
    relocate(z) {
        if (this.expression) {
            this.innerHTML = '';
            this.expression.style.zIndex = z + 1;
            let boxRect = this.parentElement.parentElement.getBoundingClientRect();
            let tx = this.getBoundingClientRect().left;
            let ty = this.getBoundingClientRect().top;
            this.expression.style.left = tx - boxRect.left + 10 + 'px';
            this.expression.style.top = ty - boxRect.top + 10 + 'px';
            this.expression.params = this.value.params;
            this.expression.render();
            this.style.width = this.expression.getBoundingClientRect().width + 'px';
        }
    }

    render(z) {
        this.m = this.m ?? 0;
        this.innerHTML = '';
        
        if (this.expression) {
            this.expression.style.zIndex = z + 1;
            let boxRect = this.parentElement.parentElement.getBoundingClientRect();
            let tx = this.getBoundingClientRect().left;
            let ty = this.getBoundingClientRect().top;
            this.expression.style.left = tx - boxRect.left + 9 + 'px';
            this.expression.style.top = ty - boxRect.top + 10 + 'px';
            // this.style.width = this.expression.render(z + 1) + 'px';
            this.expression.params = this.value.params;
            this.expression.render();
            this.style.width = this.expression.getBoundingClientRect().width + 'px';
            return;
        }

        this.style.width = 'initial';
        if (this.getAttribute('mode') == 'select') {
            this.style.display = 'inline-block';
            let i = make('select')
                .html(this.getAttribute('between').split(',').map(t=>`<option${t==this.value?' selected="selected"':''}>${t}</option>`).join(''))
                .addClass('blockCodeSelectBetween')
                .elem;
            i.addEventListener('change', e => {
                this.dispatchEvent(new Event('change'));
            });
            i.onclick = e=>e.stopPropagation();
            i.onmousedown = e=>e.stopPropagation();
            this.appendChild(i);
        }
        else if (this.getAttribute('mode') == 'state') {
            this.style.display = 'inline-block';
            let i = make('select')
                .addClass('stateName')
                .html(Object.keys(window.states).filter(t=>t.length&&t[0]!='_').map(t=>`<option${t==this.value?' selected="selected"':''}>${t}</option>`).join(''))
                .elem;
            i.addEventListener('change', e => {
                this.dispatchEvent(new Event('change'));
            });
            i.onclick = e=>e.stopPropagation();
            i.onmousedown = e=>e.stopPropagation();
            this.appendChild(i);
        }
        else if (this.getAttribute('mode') == 'href') {
            this.style.display = 'inline-block';
            let links = localStorage.getItem('route');
            if (links) {
                links = links.split(',')
            }
            else {
                if (!links || links.length == 0) {
                    localStorage.setItem('route', '/');
                }
                links = '/'.split(',')
            }
            let i = make('select')
                .addClass('stateName')
                .html(links.filter(t=>t.length&&t[0]!='_').map(t=>`<option${t==this.value?' selected="selected"':''}>${t}</option>`).join(''))
                .elem;
            i.addEventListener('change', e => {
                this.dispatchEvent(new Event('change'));
            });
            i.onclick = e=>e.stopPropagation();
            i.onmousedown = e=>e.stopPropagation();
            this.appendChild(i);
        }
        else if (this.getAttribute('mode') == 'string') {
            this.style.display = 'inline-block';
            let i = make('text').elem;
            i.value = this.value;
            i.addEventListener('change', e => {
                this.dispatchEvent(new Event('change'));
            });
            i.onclick = e=>e.stopPropagation();
            i.onmousedown = e=>e.stopPropagation();
            this.appendChild(i);
        }
        else {
            let c = make('button').elem;
            this.appendChild(c);
            c.addEventListener('click', ()=>{
                this.m += 1;
                this.m = this.m % 3;
                this.render();
            });
            
            if (this.m == 0) {
                c.classList.add('m0');
                let i = make('text').elem;
                i.value = this.value;
                i.addEventListener('change', e => {
                    this.dispatchEvent(new Event('change'));
                });
                i.onclick = e=>e.stopPropagation();
                i.onmousedown = e=>e.stopPropagation();
                this.appendChild(i);
            }
            else if (this.m == 1) {
                c.classList.add('m1');
                let i = make('select')
                    .addClass('stateName')
                    .html(Object.keys(window.states).filter(t=>t.length&&t[0]!='_').map(t=>`<option>${t}</option>`).join(''))
                    .elem;
                i.addEventListener('change', e => {
                    this.dispatchEvent(new Event('change'));
                });
                i.onclick = e=>e.stopPropagation();
                i.onmousedown = e=>e.stopPropagation();
                this.appendChild(i);
            }
            else if (this.m == 2) {
                c.classList.add('m2');
                let i = make('text').elem;
                i.value = this.value;
                i.addEventListener('change', e => {
                    this.dispatchEvent(new Event('change'));
                });
                i.onclick = e=>e.stopPropagation();
                i.onmousedown = e=>e.stopPropagation();
                this.appendChild(i);
            }
        }
    }
    
    get val() {
        if (this.expression) {
            return this.expression.val;
        }
        if (this.children[0]) {
            if (!this.getAttribute('mode') && this.m == 0) {
                return this.children[1].value;
            }
            else if (this.m == 1) {
                return '#State:' + this.children[1].value;
            }
            else if (this.m == 2) {
                return '#Local:' + this.children[1].value;
            }
            return this.children[0].value;
        }
        else {
            return '';
        }
    }
}

window.customElements.define('small-value', SmallValue);

function parseBlock(s) {
    return s
        .replace(/\?L/g, '<small-value mode="href"></small-value>')
        .replace(/\?\{[^}]+\}/g, (s) => `<small-value mode="select" between="${s.substring(2, s.length - 1)}"></small-value>`)
        .replace(/\?T/g, '<small-value mode="string"></small-value>')
        .replace(/\?/g, '<small-value></small-value>')
        .replace(/%/g, '<small-value mode="state"></small-value>');
}