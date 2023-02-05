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
        html: 'Open Page ?L',
        category: 'ui',
        exec: ((stc, local, text) => {
            location.href = location.href.split('#')[0] + '#/' + getValue(text, local);
            location.reload();
        })
    },
    'HasId': {
        html: 'Id:?T',
        category: 'ui',
        isArgs: true,
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
        exec: ((stc, local, s) => {
            return window.states[s];
        })
    },
    'Local': {
        html: 'Local:?T',
        category: 'value',
        isArgs: true,
        exec: ((stc, local, s) => {
            return window.locals[local][s];
        })
    },
    'PlusMinus': {
        html: '?T ?{+,-,*,/,mod} ?T',
        category: 'value',
        isArgs: true,
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
        html: 'Append Element ?T to ?T',
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

function registerBlocks(d) {
    let navs = [
        make('div').attr('category', 'ui').text('UI').elem,
        make('div').attr('category', 'value').text('Value').elem,
        make('div').attr('category', 'db').text('DB').elem,
        make('div').attr('category', 'control').text('Flow').elem,
        make('div').attr('category', 'style').text('Style').elem,
        make('div').attr('category', 'code').text('Code').elem
    ];
    for (let nav of navs) {
        nav.addEventListener('click', () => {
            d.displayBlocks = nav.getAttribute('category');
            showBlocks(d);
        });
        d.blockNav.appendChild(nav);
    }

    // for (let k of Object.keys(blockmap)) {
    //     d.registerBlock(new BlockCreator(blockmap[k].category, k, blockmap[k].html, blockmap[k].isArgs));
    // }
}

function showBlocks(d) {
    d.addBlocks.innerHTML = ''; 
    for (let k of Object.keys(blockmap)) {
        if (blockmap[k].category == d.displayBlocks) {
            d.registerBlock(new BlockCreator(blockmap[k].category, k, blockmap[k].html, blockmap[k].isArgs));
        }
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

function isServerAction(actions) {
    for (let action of actions) {
        if (!action) continue;
        if (action.substring) continue;
        if (blockmap[action.name].category == 'db') {
            return true;
        }
        if (action.params) {
            if (isServerAction(action.params)) {
                return true;
            }
        }
        if (action.child) {
            if (isServerAction(action.child)) {
                return true;
            }
        }
    }
    return false;
}