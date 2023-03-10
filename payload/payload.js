window.locals = {};
let blockmap = {
    'return': {
        category: 'value',
        exec: ((stc, local, v) => {
            window.locals[local]._returnValue = getValue(v, local);
            return;
        })
    },
    'JavaScript': {
        category: 'code',
        exec: ((stc, local, code) => eval(getValue(code, local)))
    },
    'ConsoleLog': {
        category: 'code',
        exec: ((stc, local, code) => console.log(getValue(code, local)))
    },
    'Alert': {
        category: 'ui',
        exec: ((stc, local, text) => {
            alert(getValue(text, local));
        })
    },
    'Href': {
        category: 'ui',
        exec: ((stc, local, text) => {
            location.href = getValue(text, local);
        })
    },
    'HasId': {
        category: 'ui',
        isArgs: true,
        exec: ((stc, local, e) => {
            return '#' + getValue(e, local);
        })
    },
    'ValueOf': {
        category: 'ui',
        isArgs: true,
        exec: ((stc, local, v) => {
            return window.locals[local][v][0].value;
        })
    },
    'State': {
        category: 'value',
        isArgs: true,
        exec: ((stc, local, s) => {
            return window.states[s];
        })
    },
    'Attr': {
        html: 'Attr:?T',
        category: 'value',
        isArgs: true,
        exec: ((stc, local, s) => {
            return JSON.parse(window.locals[local].elementThis.getAttribute('attrs'))[s];
        })
    },
    'Local': {
        category: 'value',
        isArgs: true,
        exec: ((stc, local, s) => {
            return window.locals[local][s];
        })
    },
    'PlusMinus': {
        category: 'value',
        isArgs: true,
        exec: ((stc, local, ta, op, tb) => {
            console.log(ta);
            console.log(tb);
            const a = parseFloat(getValue(ta, local));
            const b = parseFloat(getValue(tb, local));
            if (op == '+') return a + b;
            if (op == '-') return a - b;
            if (op == '*') return a * b;
            if (op == '/') return a / b;
            if (op == 'mod') return a % b;
        })
    },
    'Find': {
        html: 'Find selector ?T into ?T',
        category: 'ui',
        exec: ((stc, local, s, into) => {
            window.locals[local][into] = document.querySelectorAll(getValue(s, local));
        })
    },
    'Hide': {
        html: 'Hide ?T',
        category: 'ui',
        exec: ((stc, local, v) => {
            if (window.locals[local][v][0].classList) {
                window.locals[local][v].forEach(e=>e.classList.add('hide'));
            }
        })
    },
    'Show': {
        html: 'Show ?T',
        category: 'ui',
        exec: ((stc, local, v) => {
            if (window.locals[local][v][0].classList) {
                window.locals[local][v].forEach(e=>e.classList.remove('hide'));
            }
        })
    },
    'AppendHTML': {
        html: 'Append HTML ?T to ?T',
        category: 'ui',
        exec: ((stc, local, html, v) => {
            if (window.locals[local][v][0].classList) {
                window.locals[local][v].forEach(e=>e.appendChild(getValue(html, local)));
            }
        })
    },
    'SetState': {
        html: 'Set state % as ?T',
        category: 'value',
        exec: ((stc, local, st, text) => {
            stc.push(st);
            window.states[st] = getValue(text, local);
        })
    },
    'SetLocal': {
        html: 'Set variable ?T as ?T',
        category: 'value',
        exec: ((stc, local, v, text) => {
            window.locals[local][v] = getValue(text, local);
        })
    },
    'IfOrd': {
        html: 'If ?T ?{=,???,>,<,???,???} ?T',
        category: 'control',
        exec: ((stc, local, child, ta, operator, tb) => {
            let a = getValue(ta, local);
            let b = getValue(tb, local);
            let condition = ((a == b) && operator=='=')
                ||((a != b) && operator=='???')
                ||((a < b) && operator=='<')
                ||((a >= b) && operator=='???')
                ||((a <= b) && operator=='???')
                ||((a > b) && operator=='>');
            if (condition) {
                if (child) {
                    child.run(stc, local);
                }
            }
        })
    },
    'WhileOrd': {
        html: 'While ?T ?{=,???,>,<,???,???} ?T',
        category: 'control',
        exec: ((stc, local, child, ta, operator, tb) => {
            let a = getValue(ta, local);
            let b = getValue(tb, local);
            let condition = ((a == b) && operator=='=')
                ||((a != b) && operator=='???')
                ||((a < b) && operator=='<')
                ||((a >= b) && operator=='???')
                ||((a <= b) && operator=='???')
                ||((a > b) && operator=='>');
            while (condition) {
                if (child) {
                    child.run(stc, local);
                }
                a = getValue(ta, local);
                b = getValue(tb, local);
                condition = ((a == b) && operator=='=')
                    ||((a < b) && operator=='<')
                    ||((a != b) && operator=='???')
                    ||((a > b) && operator=='>');
            }
        })
    },
    'CallAction': { 
        category: 'code',
        exec: ((stc, local, action) => {
            callfunctionwithus(action, window.locals[local].elementThis);
        })
    }
};

(async () => {
    let { builtComponents, actions, states, tables, serverSidePostActions } = await (await fetch('/functions' + location.pathname)).json();
    window.serverSidePostActions = serverSidePostActions;
    window.builtComponents = builtComponents;
    window.actions = actions;
    window.states = states;
    window.tables = tables;
    for (let bc of Object.keys(window.builtComponents)) {
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
    for (let ssa of window.serverSidePostActions) {
        actions[ssa.name].code = [{ name: 'ssa_' + ssa.name, params: [] }];
        blockmap['ssa_' + ssa.name] = {
            category: 'ssa',
            exec: (async (stc, local) => {
                let body = {};
                if (window.locals[local].elementThis.getAttribute('attrs')) {
                    body['#Attrs'] = window.locals[local].elementThis.getAttribute('attrs');
                }
                for (const t of ssa.ses) {
                    if (t[0] == '#State') {
                        body['#State:' + t[1]] = window.states[t[1]];
                    }
                    else if (t[0] == '#Find') {
                        let selector = getValue(t[1], local);
                        let elem = document.querySelector(selector);
                        const metaElem = {
                            value: elem.value,
                            selector
                        };
                        body['#Elements:' + t[2]] = metaElem;
                    }
                }
                console.log(body);
                const res = await fetch(`./serverside/${ssa.name}`, {
                    method: 'post',
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                    body: JSON.stringify(body)
                }).then(e=>e.json());
                console.log(res);
                for (let code of res.clientActs) {
                    console.log(code);
                    if (code[0].startsWith('AppendHTML')) {
                        const selector = code[2][1][code[1]].selector;
                        document.querySelectorAll(selector).forEach(e=>{
                            for (let k in code[2][1]) {
                                window.locals[local][k] = code[2][1][k];
                            }
                            e.appendChild(getValue(code[2][0], local));
                        });
                    }
                    else if (code[0].startsWith('EmptyElement')) {
                        const selector = code[1][1][code[1][0]].selector;
                        document.querySelectorAll(selector).forEach(e=>e.innerHTML='');
                    }
                    else {
                        blockmap[code[0]].exec(stc, local, ...code.slice(1));
                    }
                }
                for (let st in res.states) {
                    stc.push(st);
                    window.states[st] = res.states[st];
                }
            })
        };
    }
})();

class UserBuiltComponent extends HTMLElement {
    connectedCallback() {
        if (this.componentName) {
            let componentInfo = window.builtComponents[this.componentName];
            this.innerHTML = componentInfo.html;
            let i = 0;
            this.querySelectorAll('*').forEach(e=>e.classList.remove('outline'));
            let ta = {};
            for (let attr of componentInfo.attributes) {
                ta[attr] = this.attrs[i];
                i += 1;
            }
            let sattrs = JSON.stringify(ta);
            this.querySelectorAll('*').forEach(e => {
                e.setAttribute('attrs', sattrs);
            });
            i = 0;
            for (let attr of componentInfo.attributes) {
                [...this.querySelectorAll(`[attributeslot-${attr}]`)].forEach(e=>{
                    let property = e.getAttribute(`attributeslot-${attr}`);
                    if (property[0] == ':') {
                        e.setAttribute(property.substring(1), this.attrs[i]);
                    }
                    else if (property[0] == '#') {
                        e.style[property.substring(1)] = this.attrs[i];
                    }
                    else {
                        e[property] = this.attrs[i];
                    }
                });
                i += 1;
            }
        }
    }
}

window.customElements.define('user-built-component', UserBuiltComponent);

function callfunctionwithus(c, elementThis) {
    let stc = [];
    let local = (Math.random() + 1).toString(36).substring(7);
    window.locals[local] = { elementThis };
    actfunctioncode(stc, local, window.actions[c].code);
    updateState(stc);
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


function updateState(stateNames) {
    for (let state of stateNames) {
        document.querySelectorAll(`[updateforstate-${state}]`).forEach(e => {
            let property = e.getAttribute(`updateforstate-${state}`);
            if (property[0] == ':') {
                e.setAttribute(property.substring(1), window.states[state]);
            }
            else if (property[0] == '#') {
                e.style[property.substring(1)] = window.states[state];
            }
            else {
                e[property] = window.states[state];
            }
        });
    }
}

function getValue(v, local) {
    if (!v) return;
    if (!v.substring && v.name) {
        if (v.name.startsWith('GETCOL')) {
            let v1 = getValue(v.params[1], local);
            console.log(v1, v.params[0]);
            return v1[v.params[0]];
        }
        return blockmap[v.name].exec([], local, ...v.params.map(e=>getValue(e, local)));
    }
    if (v.startsWith) {
        if (v.startsWith('#Local:')) {
            return window.locals[local][v.substring(7)];
        }
        else if (v.startsWith('#State:')) {
            return window.states[v.substring(7)];
        }
    }
    return v;
}

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
};