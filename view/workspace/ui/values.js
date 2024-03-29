window.states = {};
window.imageHist = [];

class ValueInput extends HTMLElement {
    connectedCallback() {
        this.mode = this.mode ?? 'Text';
        this.render();
        this.defaultState = '';
        this.defaultAttr = '';
        if (this.then) {
            this.then.render();
        }
    }

    applyState(stateName) {
        this.mode = 'State';
        this.defaultState = stateName;
    }

    applyAttr(attrName) {
        this.mode = 'Attr';
        this.defaultAttr = attrName;
    }

    hide() {
        this.classList.add('hide');
    }

    show() {
        this.classList.remove('hide');
        this.render();
    }
    
    render() {
        this.innerHTML = '';
        let modeSelect = null;
        if (!this.onlyState && !this.onlyText && (this.mode != 'Image')) {
            modeSelect = make('select').opts(['Text', 'State', 'Attr']).elem;
            modeSelect.addEventListener('change', v => {
                this.mode = modeSelect.value;
                this.render();
            });
            this.appendChild(modeSelect);
        }
        
        if (this.mode == 'Image') {
            let t2 = 'b' + Math.floor(1000 * Math.random());
            // let lbl = make('div').html('Select image').attr('for', t2).elem;
            let lbl = make('div').html('Select image').elem;
            let histImages = make('select').attr('type', 'select').opts(window.imageHist).elem;
            let ipt = make('input').attr('type', 'hidden').attr('name', t2).elem;
            let fpp = make('p').elem;
            histImages.style.display = 'block';
            histImages.style.width = 'calc(100% - 10px)';
            histImages.style.margin = '4px';
            this.appendChild(lbl);
            this.appendChild(histImages);
            this.appendChild(ipt);
            this.appendChild(fpp);
            this.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            this.addEventListener('drop', (e) => {
                e.preventDefault();
                console.log('File(s) dropped');
                if (e.dataTransfer.items) {
                    [...e.dataTransfer.items].forEach((item, i) => {
                        if (item.kind === 'file') {
                            const file = item.getAsFile();
                            if (/(png|jpe?g|webp|gif|svg)$/.test(file.name)) {
                                ipt.value = fpp.innerText = file.path;
                            }
                        }
                    });
                }
                else {
                    [...e.dataTransfer.files].forEach((file, i) => {
                        if (/(png|jpe?g|webp|gif|svg)$/.test(file.name)) {
                            ipt.value = fpp.innerText = file.path;
                        }
                    });
                }
            });
            histImages.addEventListener('change', () => {
                if (histImages.value) {
                    ipt.value = fpp.innerText = histImages.value;
                }
            });
            lbl.addEventListener('click', () => {
                if (window.require) {
                    let electron = require('electron');
                    electron.ipcRenderer.send('SelectImage');
                    electron.ipcRenderer.once('retf', (e, f) => {
                        if (f) {
                            ipt.value = fpp.innerText = f;
                            if (!window.imageHist.includes(f)) {
                                Window.imageHist.reverse();
                                window.imageHist.push(f);
                                Window.imageHist.reverse();
                            }
                        }
                    });
                }
            });
        }
        else if (this.mode == 'Text') {
            if (modeSelect) {
                modeSelect.children[0].selected = 'selected';
                this.appendChild(make('br').elem);
            }
            if (this.lengthInput) {
                this.appendChild(make('length-input').set('defaultValue', this.defaultText ?? '').elem);
            }
            else {
                this.appendChild(make('text').set('value', this.defaultText ?? '').elem);
            }
        }
        else if (this.mode == 'State') {
            if (!this.onlyState) {
                modeSelect.children[1].selected = 'selected';
            }
            let statenameInput = make('select').addClass(this.onlyState ? 'fullStateName' : 'stateName').elem;
            statenameInput.innerHTML = Object.keys(window.states).filter(t=>t.length&&t[0]!='_').map(t=>`<option${t===this.defaultState?' selected="selected"':''}>${t}</option>`).join('');
            this.appendChild(statenameInput);
            let newStatenameInput = make('text').addClass('newStateName').elem;
            this.appendChild(newStatenameInput);
            let makeNewState = make('button').addClass('newstate').html('+').elem;
            makeNewState.addEventListener('click', () => {
                window.states[newStatenameInput.value] = 0;
                window.states['__default__' + newStatenameInput.value] = 0;
                document.querySelectorAll('select.stateName, select.fullStateName').forEach(e=>{
                    if (e.parentElement.tagName == 'ACTION-INPUT') return;
                    if (e == statenameInput) {
                        e.innerHTML = Object.keys(window.states).filter(t=>t.length&&t[0]!='_').map(t=>`<option${t===newStatenameInput.value?' selected="selected"':''}>${t}</option>`).join('');
                    }
                    else {
                        e.innerHTML = Object.keys(window.states).filter(t=>t.length&&t[0]!='_').map(t=>`<option${t===e.value?' selected="selected"':''}>${t}</option>`).join('');
                    }
                    e.dispatchEvent(new Event('change'));
                });
            });
            let removeState = make('button').addClass('newstate').html('-').elem;
            removeState.addEventListener('click', () => {
                if (statenameInput.value) {
                    if (statenameInput.value.length) {
                        delete window.states[statenameInput.value];
                        document.querySelectorAll('select.stateName, select.fullStateName').forEach(e=>{
                            e.innerHTML = Object.keys(window.states).filter(t=>t.length&&t[0]!='_').map(t=>`<option>${t}</option>`).join('');
                        });
                    }
                }
            });
            this.appendChild(makeNewState);           
            this.appendChild(removeState);
            this.appendChild(make('line').elem);
            this.appendChild(wse.label('Default').elem);
            let defaultInput = make('text').addClass('valuedefault').elem;
            defaultInput.addEventListener('change', () => {
                window.states[statenameInput.value] = defaultInput.value;
                window.states['__default__' + statenameInput.value] = defaultInput.value;
                updateState(['__default__' + statenameInput.value]);
            });
            defaultInput.setAttribute('updateforstate-__default__' + statenameInput.value, 'value');
            this.appendChild(defaultInput);
            let initButton = make('button').addClass('initbutton').text('Init').elem;
            initButton.addEventListener('click', () => {
                window.states[statenameInput.value] = defaultInput.value;
                updateState([statenameInput.value]);
            });
            this.appendChild(wse.br());
            this.appendChild(initButton);
            let preview = make('span').attr('updateforstate-' + statenameInput.value, 'innerHTML').elem;
            statenameInput.addEventListener('change', () => {
                preview.removeAttribute(preview.attributes[0]);
                preview.setAttribute('updateforstate-' + statenameInput.value, 'innerHTML');
                defaultInput.removeAttribute([...defaultInput.attributes].filter(e=>e[0]=='_')[0]);
                defaultInput.setAttribute('updateforstate-__default__' + statenameInput.value, 'value');
                updateState(['__default__' + statenameInput.value, statenameInput.value]);
            })
            this.appendChild(preview);
            updateState(['__default__' + statenameInput.value, statenameInput.value]);
        }
        else if (this.mode == 'Attr') {
            modeSelect.children[2].selected = 'selected';
            let mode = document.querySelector('wsbody').getAttribute('mode');
            if (mode != 'Page') {
                this.appendChild(make('select').opts(window.builtComponents[mode].attributes, this.defaultAttr).addClass('useStates').elem);
            }
        }
    }
    
    get val() {
        if (this.listInput) {
            let k = 0;
            if (this.children[2]) {
                k = this.children[2].value;
            }
            else if (this.children[0]) {
                k = this.children[0].value;
            }
            return [...k.split(',')].map(e => '<li>' + e + '</li>').join('');
        }
        if (this.mode == 'Image') {
            if (this.children[2]) {
                return this.children[2].value || 'https://raw.githubusercontent.com/heartleth/lklklklklklklklklklklklk/main/icon/icon.png';
            }
        }
        else if (this.mode == 'Text') {
            if (this.children[2]) {
                return this.lengthInput ? this.children[2].val : this.children[2].value;
            }
            else if (this.children[0]) {
                return this.lengthInput ? this.children[0].val : this.children[0].value;
            }
        }
        else if (this.mode == 'State') {
            if (this.children[1]) {
                if (window.states[this.children[1].value] === undefined) {
                    window.states[this.children[1].value] = this.children[4].value;
                }
                return window.states[this.children[1].value] ?? this.children[4].value;
            }
        }
        else if (this.mode == 'Attr') {
            if (this.children[1]) {
                return '{' + this.children[1].value + '}';
                // return eval(this.children[4].value);
            }
        }
    }

    get cells() {
        return parseFloat(this.val) * cellSpacing + 'px';
    }

    get functor() {
        if (this.mode == 'Value') {
            if (this.children[4]) {
                let f = this.children[4].value;
                if (window.states) {
                    for (let i of Object.keys(window.states)) {
                        if (i.length > 0) {
                            f = f.replace(new RegExp(i, 'g'), `window.states.` + i);
                        }
                    }
                    let useState = this.children[1].value.split(',').map(t=>t.trim());
                    return f + ';updateState(' + JSON.stringify(useState).replace(/"/g, "'") + ');';
                }
            }
        }
    }

    get usingStates() {
        if (this.mode == 'State') {
            if (this.children[1]) {
                return [this.children[1].value];
            }
        }
        return [];
    }

    get usingAttrs() {
        return this.mode == 'Attr' ? this.children[1].value : false;
    }
}

window.customElements.define('value-input',  ValueInput);

function updateState(stateNames) {
    for (let state of stateNames) {
        document.querySelectorAll(`[updateforstate-${state}]`).forEach(e => {
            let property = e.getAttribute(`updateforstate-${state}`);
            if (property[0] == ':') {
                e.setAttribute(property.substring(1), window.states[state]);
            }
            else if (property[0] == '#') {
                if ([
                    '#width', '#height',
                    '#maxWidth', '#maxHeight',
                    '#minWidth', '#minHeight',
                ].includes(property)) {
                    e.style[property.substring(1)] = parseFloat(window.states[state]) * cellSpacing + 'px';
                }
                else {
                    e.style[property.substring(1)] = window.states[state];
                }
            }
            else {
                e[property] = window.states[state];
            }
        });
    }
    save();
    drawCanvas();
}

class ShowHideButton extends HTMLElement {
    connectedCallback() {
        this.style.color = 'white';

        this.mode = 'hide';
        this.innerHTML = '▼';
        this.addEventListener('click', ()=>{
            if (this.mode == 'hide') {
                if (this.getAttribute('div')) {
                    this.nextElementSibling.nextElementSibling.style.display = 'none';
                }
                else {
                    this.nextElementSibling.nextElementSibling.hide();
                }
                this.innerHTML = '▶';
                this.mode = 'show';
            }
            else if (this.mode == 'show') {
                if (this.getAttribute('div')) {
                    this.nextElementSibling.nextElementSibling.style.display = 'block';
                }
                else {
                    this.nextElementSibling.nextElementSibling.show();
                }
                this.innerHTML = '▼';
                this.mode = 'hide';
            }
        });
    }
}

window.customElements.define('show-hide-button', ShowHideButton)