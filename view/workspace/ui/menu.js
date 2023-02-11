const LengthInputHTML = `<input type="text" value="20"><select><option selected="px">px</option><option>cm</option><option>mm</option><option>em</option></select>`;

function createMenu(ws, name, n) {
    if (name == 'button') {
        buttonMenu(ws);
    }
    else if (name == 'title') {
        titlesmenu(ws);
    }
    else if (name == 'box') {
        boxmenu(ws);
    }
    else if (name == 'states') {
        statesmenu(ws);
    }
    else if (name == 'components') {
        componentmenu(ws);
    }
    else if (name == 'style') {
        stylemenu(ws);
    }
    else if (name == 'edit functor') {
        functoreditmenu(ws, n);
    }
    else if (name == 'input text') {
        uiMenus('input text', ws);
    }
    else if (name == 'library') {
        compLib(ws);
    }
    else if (name == 'route') {
        routeMenu(ws);
    }
    else if (name == 'database') {
        databaseMenu(ws);
    }
}

class AddComponent extends HTMLElement {
    connectedCallback() {
        this.render();
        this.updateref();
        this.addEventListener('mousedown', this.onmousedown);
    }

    updateref() {
        for (let refselector of this.refs) {
            let ref = document.querySelector(refselector);
            if (ref) {
                ref.addEventListener('mousemove', (e) => this.render());
                ref.addEventListener('keydown', (e) => this.render());
                ref.addEventListener('change', (e) => this.render());
                ref.addEventListener('keyup', (e) => this.render());
            }
        }
        this.render();
    }

    render() {
        let usingStates = new Array();
        if (!this.refs) return;
        for (let refselector of this.refs) {
            let ref = document.querySelector(refselector);
            if (ref) {
                usingStates = usingStates.concat(ref.usingStates);
            }
        }

        this.innerHTML = '';
        for (let t of this.template) {
            t.embody();
            this.appendChild(t.elem);
        }
    }

    onmousedown(e) {
        window.movingElement = this;
        window.isClicked = 'place';
    }
}
window.customElements.define('add-component', AddComponent);

let applyScaling = scaledWrapper => {
    // let scaledContent = scaledWrapper.children[0];
    // scaledContent.style.display = 'none';
    // scaledContent.style.transform = 'scale(1, 1)';
    
    // let { width: cw, height: ch } = scaledContent.getBoundingClientRect();
    // let { width: ww, height: wh } = scaledWrapper.getBoundingClientRect();
    // let scaleAmtX = ((20-2) / cw);
    // let scaleAmtY = ((20-2) / ch);
    // scaledContent.style.transform = `scaleX(${scaleAmtY}) scaleY(${scaleAmtY})`;
};

class LengthInput extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<input type="text" value="${this.defaultValue ?? 50}">
        <select class="measure">
            <option selected="px">px</option>
            <option>cm</option>
            <option>mm</option>
            <option>em</option>
        </select>`;
        if (this.then) {
            this.then.render();
        }
    }

    get val() {
        if (this.children[0]) {
            return this.children[0].value + this.children[1].value;
        }
        else {
            return '0px';
        }
    }
}
window.customElements.define('length-input', LengthInput);

class cec {
    constructor(tagName) {
        this.elem = document.createElement(tagName);
    }
    addClass(classname) {
        this.elem.classList.add(classname);
        return this;
    }
    setId(id) {
        this.elem.setAttribute('id', id);
        return this;
    }
    attr(name, val) {
        this.elem.setAttribute(name, val);
        return this;
    }
    text(val) {
        this.elem.innerText = val;
        return this;
    }
    html(val) {
        this.elem.innerHTML = val;
        return this;
    }
    opts(l, selected) {
        this.elem.innerHTML = l.map(e=>`<option${e===selected?' selected="selected"':''}>${e}</option>`).join('');
        return this;
    }
    then(ac) {
        this.elem.then = ac;
        return this;
    }
    defaultVal(d) {
        this.elem.defaultText = d;
        return this;
    }
    length() {
        this.elem.lengthInput = true;
        return this;
    }
    set(name, val) {
        this.elem[name] = val;
        return this;
    }
}

function make(t) {
    if (t == 'text') return (new cec('input')).attr('type', 'text')
    return new cec(t);
}

function addChilds(parent, l) {
    for (let e of l) {
        parent.appendChild(e);
    }
}

function wstitle(t) {
    return make('span').addClass('title').text(t).elem;
}

let wse = {
    label: t => make('label').text(t),
    br: () => make('br').elem
}

function addc(refs, template) {
    return make('add-component').set('refs', refs).set('template', template).elem;
}

class ElementComponent {
    constructor(tag, updates, childs) {
        this.updates = updates;
        this.childs = childs;
        this.tag = tag;
    }

    embody() {
        if (this.tag[0] == '@') {
            let refinfo = this.tag.substring(1).split('/');
            let refelem = document.querySelector(refinfo[0]);
            if (refelem) {
                this.elem = document.createElement(refelem[refinfo[1]]);
            }
            else {
                this.elem = document.createElement('h1');
            }
        }
        else {
            this.elem = document.createElement(this.tag);
        }
        
        let depstates = [];
        for (let [property, ref] of this.updates) {
            if (ref[0] == '@') {
                let refinfo = ref.substring(1).split('/');
                let refelem = document.querySelector(refinfo[0]);
                if (refelem) {
                    const us = refelem.usingStates;
                    depstates = depstates.concat(us);
                    if (us.length > 0) {
                        this.elem.setAttribute(`updateforstate-${us[0]}`, property);
                    }
                    let ua = refelem.usingAttrs;
                    if (ua) {
                        this.elem.setAttribute(`attributeSlot-${ua}`, property);
                    }
                    
                    if (property[0] == ':') {
                        this.elem.setAttribute(property.substring(1), refelem[refinfo[1]]);
                    }
                    else if (property[0] == '#') {
                        this.elem.style[property.substring(1)] = refelem[refinfo[1]];
                    }
                    else {
                        this.elem[property] = refelem[refinfo[1]];
                    }
                }
            }
            else {
                if (property[0] == ':') {
                    this.elem.setAttribute(property.substring(1), ref);
                }
                else if (property[0] == '#') {
                    this.elem.style[property.substring(1)] = ref;
                }
                else {
                    this.elem[property] = ref;
                }
            }
        }
        if (this.childs !== undefined) {
            addChilds(this.elem, this.childs.map(e => { e.embody(); return e.elem; }));
        }
        this.elem.classList.add('natural');
        this.elem.setAttribute('depstates', depstates);
    }
}

class CheckBoxOptions extends HTMLElement {
    connectedCallback() {
        this.options = this.options ?? ['Value'];
        this.inputs = [];
        for (const option of this.options) {
            let x = Math.floor(1000 * Math.random());
            this.appendChild(wse.label(option).attr('for', 'bo' + x).elem);
            let i = make('input').attr('type', 'checkbox').setId('bo' + x).elem;
            this.inputs[option] = i;
            this.appendChild(i);
            this.appendChild(wse.br());
        }
    }

    get val() {
        if (this.inputs) {
            let ret = [];
            for (const i in this.inputs) {
                if (this.inputs[i].checked) {
                    ret.push(i);
                }
            }
            return ret.join(' ');
        }
    }

    get usingStates() {
        return [];
    }
}
window.customElements.define('checkbox-options', CheckBoxOptions);