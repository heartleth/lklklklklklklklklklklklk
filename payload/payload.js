window.locals = {};
let blockmap = {
    'return': {
        html: '= ?T',
        category: 'value',
        exec: ((stc, local, v) => {
            window.locals[local]._returnValue = getValue(v, local);
            return;
        })
    },
    'JavaScript': {
        html: 'JavaScript ?T',
        category: 'code',
        exec: ((stc, local, code) => eval(getValue(code, local)))
    },
    'ConsoleLog': {
        html: 'console log ?T',
        category: 'code',
        exec: ((stc, local, code) => console.log(getValue(code, local)))
    },
    'Alert': {
        html: 'Alert ?T',
        category: 'ui',
        exec: ((stc, local, text) => {
            alert(getValue(text, local));
        })
    },
    'Href': {
        html: 'Open Page ?T',
        category: 'ui',
        exec: ((stc, local, text) => {
            location.href = location.href.split('#')[0] + '#' + getValue(text, local);
        })
    },
    'HasId': {
        html: 'Id:?T',
        category: 'ui',
        isArgs: true,
        exp: (e) => `#${e}`,
        exec: ((stc, local, e) => {
            return '#' + getValue(e, local);
        })
    },
    'ValueOf': {
        html: 'Input value:?T',
        category: 'ui',
        isArgs: true,
        exec: ((stc, local, v) => {
            return window.locals[local][v][0].value;
        })
    },
    'State': {
        html: 'State:%',
        category: 'value',
        isArgs: true,
        exp: (e) => `#${e}`,
        exec: ((stc, local, s) => {
            return window.states[s];
        })
    },
    'Local': {
        html: 'Local:?T',
        category: 'value',
        isArgs: true,
        exp: (e) => `#${e}`,
        exec: ((stc, local, s) => {
            return window.locals[local][s];
        })
    },
    'PlusMinus': {
        html: '?T ?{+,-,*,/,mod} ?T',
        category: 'value',
        isArgs: true,
        exp: (e) => `#${e}`,
        exec: ((stc, local, ta, op, tb) => {
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
            window.locals[local][into] = document.getElementById('workspace').querySelectorAll(getValue(s, local));
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
        html: 'If ?T ?{=,≠,>,<,≤,≥} ?T',
        category: 'control',
        exec: ((stc, local, child, ta, operator, tb) => {
            let a = getValue(ta, local);
            let b = getValue(tb, local);
            let condition = ((a == b) && operator=='=')
                ||((a != b) && operator=='≠')
                ||((a < b) && operator=='<')
                ||((a >= b) && operator=='≥')
                ||((a <= b) && operator=='≤')
                ||((a > b) && operator=='>');
            if (condition) {
                if (child) {
                    child.run(stc, local);
                }
            }
        })
    },
    'WhileOrd': {
        html: 'While ?T ?{=,≠,>,<,≤,≥} ?T',
        category: 'control',
        exec: ((stc, local, child, ta, operator, tb) => {
            let a = getValue(ta, local);
            let b = getValue(tb, local);
            let condition = ((a == b) && operator=='=')
                ||((a != b) && operator=='≠')
                ||((a < b) && operator=='<')
                ||((a >= b) && operator=='≥')
                ||((a <= b) && operator=='≤')
                ||((a > b) && operator=='>');
            while (condition) {
                if (child) {
                    child.run(stc, local);
                }
                a = getValue(ta, local);
                b = getValue(tb, local);
                condition = ((a == b) && operator=='=')
                    ||((a < b) && operator=='<')
                    ||((a != b) && operator=='≠')
                    ||((a > b) && operator=='>');
            }
        })
    }
};

(async () => {
    let { builtComponents, actions, states } = await (await fetch('/functions')).json();
    window.builtComponents = builtComponents;
    window.actions = actions;
    window.states = states;
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
})();

class UserBuiltComponent extends HTMLElement {
    connectedCallback() {
        if (this.componentName) {
            let componentInfo = window.builtComponents[this.componentName];
            this.innerHTML = componentInfo.html;
            let i = 0;
            this.querySelectorAll('*').forEach(e=>e.classList.remove('outline'));
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

function callfunctionwithus(c) {
    let stc = [];
    let local = (Math.random() + 1).toString(36).substring(7);
    window.locals[local] = {};
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
    if (!v.substring && v.name) {
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