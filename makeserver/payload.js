window.states = {};
class UserBuiltComponent extends HTMLElement {
    connectedCallback() {
        if (this.componentName) {
            let componentInfo = window.builtComponents[this.componentName];
            console.log(window.builtComponents);
            this.innerHTML = componentInfo.html;
            let i = 0;
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

function updateState(stateNamesArr) {
    let stateNames = {};
    for (let stateName of stateNamesArr) {
        stateNames[stateName] = 1;
    }
    for (let state in stateNames) {
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

function makeUBC(name, attrs) {
    let elem = document.createElement('user-built-component');
    elem.componentName = name;
    elem.attrs = attrs;
    return elem;
}

window.locals = {};
let blockmap = {
    'return': {
        html: '= ?T',
        category: 'value',
        exec: ((stc, local, v) => {
            local._returnValue = getValue(v, local);
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
        html: 'Open Page ?L',
        category: 'ui',
        exec: ((stc, local, text) => {
            location.href = getValue(text, local);
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
            return local[v][0].value;
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
            return local[s];
        })
    },
    'PlusMinus': {
        html: '?T ?{+,-,*,/,mod} ?T',
        category: 'value',
        isArgs: true,
        exp: (e) => `#${e}`,
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
            local[into] = document.querySelectorAll(getValue(s, local));
        })
    },
    'Hide': {
        html: 'Hide ?T',
        category: 'ui',
        exec: ((stc, local, v) => {
            if (local[v][0].classList) {
                local[v].forEach(e=>e.classList.add('hide'));
            }
        })
    },
    'Show': {
        html: 'Show ?T',
        category: 'ui',
        exec: ((stc, local, v) => {
            if (local[v][0].classList) {
                local[v].forEach(e=>e.classList.remove('hide'));
            }
        })
    },
    'AppendHTML': {
        html: 'Append HTML ?T to ?T',
        category: 'ui',
        exec: ((stc, local, html, v) => {
            if (local[v][0].classList) {
                local[v].forEach(e=>e.appendChild(getValue(html, local)));
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
            local[v] = getValue(text, local);
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

function getValue(v, local) {
    if (!v) return;
    if (!v.substring && v.name) {
        if (v.name.startsWith('GETCOL')) {
            let v1 = getValue(v.params[1], local);
            console.log(v1, v.params[0]);
            return v1[v.params[0]];
        }
        else if (v.name.startsWith('ComponentCreate')) {
            return makeUBC(v.name.substring(15), [...v.params.map(e=>getValue(e, local))]);
        }
        console.log(v);
        return blockmap[v.name].exec([], local, ...v.params.map(e=>getValue(e, local)));
    }
    if (v.startsWith) {
        if (v.startsWith('#Local:')) {
            return local[v.substring(7)];
        }
        else if (v.startsWith('#State:')) {
            return window.states[v.substring(7)];
        }
    }
    return v;
}