let blockmap = {
    'return': {
        html: '= ?T',
        category: 'value',
        exec: (async (stc, local, v) => {
            window.locals[local]._returnValue = await getValue(v, local);
            return;
        })
    },
    'JavaScript': {
        html: 'JavaScript ?T',
        category: 'code',
        exec: (async (stc, local, code) => eval(await getValue(code, local)))
    },
    'ConsoleLog': {
        html: 'console log ?T',
        category: 'code',
        exec: (async (stc, local, code) => console.log(await getValue(code, local)))
    },
    'Alert': {
        html: 'Alert ?T',
        category: 'ui',
        exec: (async (stc, local, text) => {
            alert(await getValue(text, local));
        })
    },
    'Href': {
        // html: 'Open Page ?L',
        html: 'Open Page ?L',
        category: 'ui',
        exec: (async (stc, local, text) => {
            location.href = location.href.split('#')[0] + '#' + await getValue(text, local);
            location.reload();
        })
    },
    'HasId': {
        html: 'Id:?T',
        category: 'ui',
        isArgs: true,
        exec: (async (stc, local, e) => {
            return '#' + await getValue(e, local);
        })
    },
    'ValueOf': {
        html: 'Input value:?T',
        category: 'ui',
        isArgs: true,
        exec: (async (stc, local, v) => {
            return window.locals[local][v][0].value;
        })
    },
    'State': {
        html: 'State:%',
        category: 'value',
        isArgs: true,
        exec: (async (stc, local, s) => {
            return window.states[s];
        })
    },
    'Attr': {
        html: 'Attr:?T',
        category: 'value',
        isArgs: true,
        exec: (async (stc, local, s) => {
            return JSON.parse(window.locals[local].elementThis.getAttribute('attrs'))[s];
        })
    },
    'Local': {
        html: 'Local:?T',
        category: 'value',
        isArgs: true,
        exec: (async (stc, local, s) => {
            return window.locals[local][s];
        })
    },
    'PlusMinus': {
        html: '?T ?{+,-,*,/,mod} ?T',
        category: 'value',
        isArgs: true,
        exec: (async (stc, local, ta, op, tb) => {
            const a = parseFloat(await getValue(ta, local));
            const b = parseFloat(await getValue(tb, local));
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
        exec: (async (stc, local, s, into) => {
            window.locals[local][into] = document.getElementById('workspace').querySelectorAll(await getValue(s, local));
        })
    },
    'Hide': {
        html: 'Hide ?T',
        category: 'ui',
        exec: (async (stc, local, vt) => {
            if (vt === undefined || vt === null) return;
            let v = vt.substring ? window.locals[local][vt] : await getValue(vt, local);
            if (v[0]) {
                if (v[0].classList) {
                    v.forEach(e=>e.classList.add('hide'));
                }
            }
        })
    },
    'Show': {
        html: 'Show ?T',
        category: 'ui',
        exec: (async (stc, local, vt) => {
            if (vt === undefined || vt === null) return;
            let v = vt.substring ? window.locals[local][vt] : await getValue(vt, local);
            if (v[0]) {
                if (v[0].classList) {
                    v.forEach(e=>e.classList.remove('hide'));
                }
            }
        })
    },
    'AppendHTML': {
        html: 'Append Element ?T to ?T',
        category: 'ui',
        exec: (async (stc, local, html, vt) => {
            if (vt === undefined || vt === null) return;
            let v = vt.substring ? window.locals[local][vt] : await getValue(vt, local);
            if (v[0]) {
                if (v[0].classList) {
                    for (const e of v) {
                        e.appendChild(await getValue(html, local));
                    }
                }
            }
        })
    },
    'EmptyElement': {
        html: 'Empty Element ?T',
        category: 'ui',
        exec: (async (stc, local, v) => {
            if (window.locals[local][v][0].classList) {
                window.locals[local][v].forEach(e=>e.innerHTML='');
            }
        })
    },
    'SetState': {
        html: 'Set state % as ?T',
        category: 'value',
        exec: (async (stc, local, st, text) => {
            stc.push(st);
            window.states[st] = await getValue(text, local);
        })
    },
    'SetLocal': {
        html: 'Set variable ?T as ?T',
        category: 'value',
        exec: (async (stc, local, v, text) => {
            window.locals[local][v] = await getValue(text, local);
        })
    },
    'IfOrd': {
        html: 'If ?T ?{=,≠,>,<,≤,≥} ?T',
        category: 'control',
        exec: (async (stc, local, child, ta, operator, tb) => {
            let a = await getValue(ta, local);
            let b = await getValue(tb, local);
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
        exec: (async (stc, local, child, ta, operator, tb) => {
            let a = await getValue(ta, local);
            let b = await getValue(tb, local);
            let condition = ((a == b) && operator=='=')
                ||((a != b) && operator=='≠')
                ||((a < b) && operator=='<')
                ||((a >= b) && operator=='≥')
                ||((a <= b) && operator=='≤')
                ||((a > b) && operator=='>');
            while (condition) {
                if (child) {
                    await child.run(stc, local);
                }
                a = await getValue(ta, local);
                b = await getValue(tb, local);
                condition = ((a == b) && operator=='=')
                    ||((a < b) && operator=='<')
                    ||((a != b) && operator=='≠')
                    ||((a > b) && operator=='>');
            }
        })
    },
    'IterateOver': {
        html: 'Each ?T in ?T',
        category: 'control',
        exec: (async (stc, local, child, iterName, arrc) => {
            let arr = await getValue(arrc, local);
            console.log(arr);
            for (let iter of arr) {
                window.locals[local][iterName] = iter;
                if (child) {
                    await child.run(stc, local);
                }
            }
        })
    },
    'Delay': {
        html: 'Delay ?T s',
        category: 'code',
        exec: (async  (stc, local, s) => {
            let secs = await getValue(s, local);
            console.log(secs);
            await new Promise(p => setTimeout(p, secs * 1000));
        })
    },
    'CallAction': {
        html: 'Action ?A',
        category: 'code',
        exec: (async (stc, local, action) => {
            await callfunctionwithus(action, window.locals[local].elementThis);
        })
    },
    'LIMIT': {
        html: 'Limit ?T',
        category: 'db',
        mode: 'chain',
        exec: (async (stc, local, n) => {
            return await getValue(n, local);
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

async function getValue(v, local) {
    if (!v.substring && v.name) {
        return await blockmap[v.name].exec([], local, ...v.params.map(e=>getValue(e, local)));
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