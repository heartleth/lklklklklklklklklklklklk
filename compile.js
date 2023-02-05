let blockmap = {
    'return': { category: 'value' },
    'JavaScript': { category: 'code' },
    'ConsoleLog': {
        category: 'code',
        exec: (cas, text) => {
            const t = getValue(text, cas);
            console.log(t);
            cas.clientActs.push(['ConsoleLog', t]);
        }
    },
    'Alert': {
        category: 'ui',
        exec: (cas, text) => {
            const t = getValue(text, cas);
            cas.clientActs.push(['Alert', t]);
        }
    },
    'Href': {
        category: 'ui',
        exec: (cas, url) => {
            const t = getValue(url, cas);
            cas.clientActs.push(['Href', t]);
        }
    },
    'HasId': { category: 'ui' },
    'ValueOf': {
        category: 'ui',
        exec: (cas, elem) => {
            return elem;
        }
    },
    'State': {
        category: 'value',
        exec: (cas, e) => {
            return cas.states[e];
        }
    },
    'Local': {
        category: 'value',
        exec: (cas, e) => {
            return cas.local[e];
        }
    },
    'PlusMinus': {
        category: 'value',
        exec: (cas, ta, op, tb) => {
            const a = parseFloat(getValue(ta, cas));
            const b = parseFloat(getValue(tb, cas));
            if (op == '+') return a + b;
            if (op == '-') return a - b;
            if (op == '*') return a * b;
            if (op == '/') return a / b;
            if (op == 'mod') return a % b;
        }
    },
    'Find': {
        category: 'ui',
        exec: (cas, selector, into) => {
            // cas.locals[into] = cas.sentElements[selector];
            cas.locals[into] = cas.elements[into];
        }
    },
    'Hide': {
        category: 'ui',
        exec: (cas, v) => {
            cas.clientActs.push(['Hide', getValue(v, cas)]);
        }
    },
    'Show': {
        category: 'ui',
        exec: (cas, v) => {
            cas.clientActs.push(['Show', getValue(v, cas)]);
        }
    },
    'AppendHTML': {
        category: 'ui',
        exec: (cas, html, under) => {
            cas.clientActs.push(['AppendHTML', under, getValue(html, cas)]);
        }
    },
    'SetState': {
        category: 'value',
        exec: (cas, st, text) => {
            cas.states[st] = getValue(text, cas);
        }
    },
    'SetLocal': {
        category: 'value',
        exec: (cas, v, text) => {
            cas.local[v] = getValue(text, cas);
        }
    },
    'IfOrd': {
        category: 'control',
        exec: ((cas, child, ta, operator, tb) => {
            let a = getValue(ta, cas);
            let b = getValue(tb, cas);
            let condition = ((a == b) && operator=='=')
                ||((a != b) && operator=='≠')
                ||((a < b) && operator=='<')
                ||((a >= b) && operator=='≥')
                ||((a <= b) && operator=='≤')
                ||((a > b) && operator=='>');
            if (condition) {
                if (child) {
                    child.run(cas);
                }
            }
        })
    },
    'WhileOrd': {
        category: 'control',
        exec: ((cas, child, ta, operator, tb) => {
            let a = getValue(ta, cas);
            let b = getValue(tb, cas);
            let condition = ((a == b) && operator=='=')
                ||((a != b) && operator=='≠')
                ||((a < b) && operator=='<')
                ||((a >= b) && operator=='≥')
                ||((a <= b) && operator=='≤')
                ||((a > b) && operator=='>');
            while (condition) {
                if (child) {
                    child.run(cas);
                }
                a = getValue(ta, cas);
                b = getValue(tb, cas);
                condition = ((a == b) && operator=='=')
                    ||((a < b) && operator=='<')
                    ||((a != b) && operator=='≠')
                    ||((a > b) && operator=='>');
            }
        })
    }
};

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./workspace-db/ws.db');

function getActionType(name) {
    if (name.startsWith('INSERTINTO')) return 'db';
    if (blockmap[name]) return blockmap[name].category;
}

function compileAction(actionName, actions) {
    let clientAction = {
        name: 'ServerSideAction',
        sendInputs: [],
        actionName
    };
    for (const action of actions) {
        if (!action) continue;
        if (action.substring) continue;
        const actionType = getActionType(action.name);
        if (action.name == 'State') {
            clientAction.sendInputs.push(['#State', action.params[0]]);
        }
        if (action.name == 'SetState') {
            clientAction.sendInputs.push(['#State', action.params[0]]);
        }
        else if (action.name == 'Find') {
            clientAction.sendInputs.push(['#Find', action.params[0], action.params[1]]);
        }
        if (action.params) {
            clientAction.sendInputs = clientAction.sendInputs.concat(compileAction('', action.params).sendInputs);
        }
        if (action.child) {
            clientAction.sendInputs = clientAction.sendInputs.concat(compileAction('', action.child).sendInputs);
        }
    }
    return clientAction;
}

function getValue(v, cas) {
    if (!v.substring && v.name) {
        return blockmap[v.name].exec(cas, ...v.params.map(e=>getValue(e, cas)));
    }
    if (v.startsWith) {
        if (v.startsWith('#Local:')) {
            return cas.local[v.substring(7)];
        }
        else if (v.startsWith('#State:')) {
            return cas.states[v.substring(7)];
        }
    }
    return v;
}

function execAction(code, sentInputs, tables) {
    let clientActs = [];
    let elements = {};
    let states = {};
    let locals = {};
    for (let v in sentInputs) {
        if (v.startsWith('#State:')) {
            states[v.substring(7)] = sentInputs[v];
        }
        else if (v.startsWith('#Elements:')) {
            elements[v.substring(10)] = sentInputs[v];
        }
    }
    let cas = { states, locals, clientActs, tables };
    runActionSequence(code, cas);
    return cas;
}

function runActionSequence(seq, cas) {
    for (let code of seq) {
        if (!blockmap[code.name]) {
            if (code.name.startsWith('INSERTINTO')) {
                const table = code.name.substring(10);
                const values = Object.keys(cas.tables[table]).map((e, i) => [e, getValue(code.params[i], cas)]);
                const query = `INSERT INTO ${table} (${values.map(e=>e[0]).join([', '])}) VALUES (${values.map(e=>'?').join([', '])})`;
                console.log(query, [...values.map(e=>e[1])]);
                db.run(query, [...values.map(e=>e[1])], (res, err) => {
                    console.log(res, err);
                });
            }
            continue;
        }
        if (blockmap[code.name].category == 'control') {
            const child = {
                run: (cas) => code.child ? runActionSequence(code.child, cas):''
            };
            blockmap[code.name].exec(cas, child, ...code.params);
        }
        else {
            blockmap[code.name].exec(cas, ...code.params);
        }
    }
}

module.exports = { compileAction, execAction };