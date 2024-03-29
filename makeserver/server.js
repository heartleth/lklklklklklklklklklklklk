import pkg from 'sqlite3';
const sqlite3 = pkg.verbose();
// const path = require('path');
// const fs = require('fs');

const db = new sqlite3.Database('./site.db');

let blockmap = {
    'return': { category: 'value' },
    'JavaScript': { category: 'code' },
    'ConsoleLog': {
        category: 'code',
        exec: async (cas, text) => {
            const t = await getValue(text, cas);
            console.log(t);
            cas.clientActs.push(['ConsoleLog', t]);
        }
    },
    'Alert': {
        category: 'ui',
        exec: async (cas, text) => {
            const t = await getValue(text, cas);
            cas.clientActs.push(['Alert', t]);
        }
    },
    'Href': {
        category: 'ui',
        exec: async (cas, url) => {
            const t = await getValue(url, cas);
            cas.clientActs.push(['Href', t]);
        }
    },
    'HasId': { category: 'ui' },
    'ValueOf': {
        category: 'ui',
        exec: async (cas, elem) => {
            return cas.locals[elem].value;
        }
    },
    'State': {
        category: 'value',
        exec: async (cas, e) => {
            return cas.states[e];
        }
    },
    'Local': {
        category: 'value',
        exec: async (cas, e) => {
            return cas.locals[e];
        }
    },
    'PlusMinus': {
        category: 'value',
        exec: async (cas, ta, op, tb) => {
            const a = parseFloat(await getValue(ta, cas));
            const b = parseFloat(await getValue(tb, cas));
            if (op == '+') return a + b;
            if (op == '-') return a - b;
            if (op == '*') return a * b;
            if (op == '/') return a / b;
            if (op == 'mod') return a % b;
        }
    },
    'Find': {
        category: 'ui',
        exec: async (cas, selector, into) => {
            // cas.locals[into] = cas.sentElements[selector];
            cas.locals[into] = cas.elements[into];
        }
    },
    'Hide': {
        category: 'ui',
        exec: async (cas, v) => {
            cas.clientActs.push(['Hide', await getValue(v, cas)]);
        }
    },
    'Show': {
        category: 'ui',
        exec: async (cas, v) => {
            cas.clientActs.push(['Show', await getValue(v, cas)]);
        }
    },
    'AppendHTML': {
        category: 'ui',
        exec: async (cas, html, under) => {
            cas.clientActs.push(['AppendHTML', under, [html, {...cas.locals}]]);
        }
    },
    'EmptyElement': {
        html: 'Empty Element ?T',
        category: 'ui',
        exec: ((cas, v) => {
            cas.clientActs.push(['EmptyElement', [v, {...cas.locals}]]);
        })
    },
    'SetState': {
        category: 'value',
        exec: async (cas, st, text) => {
            cas.states[st] = await getValue(text, cas);
        }
    },
    'SetLocal': {
        category: 'value',
        exec: async (cas, v, text) => {
            cas.locals[v] = await getValue(text, cas);
        }
    },
    'IfOrd': {
        category: 'control',
        exec: (async (cas, child, ta, operator, tb) => {
            let a = await getValue(ta, cas);
            let b = await getValue(tb, cas);
            let condition = ((a == b) && operator=='=')
                ||((a != b) && operator=='≠')
                ||((a < b) && operator=='<')
                ||((a >= b) && operator=='≥')
                ||((a <= b) && operator=='≤')
                ||((a > b) && operator=='>');
            if (condition) {
                if (child) {
                    await child.run(cas);
                }
            }
        })
    },
    'WhileOrd': {
        category: 'control',
        exec: (async (cas, child, ta, operator, tb) => {
            let a = await getValue(ta, cas);
            let b = await getValue(tb, cas);
            let condition = ((a == b) && operator=='=')
                ||((a != b) && operator=='≠')
                ||((a < b) && operator=='<')
                ||((a >= b) && operator=='≥')
                ||((a <= b) && operator=='≤')
                ||((a > b) && operator=='>');
            while (condition) {
                if (child) {
                    await child.run(cas);
                }
                a = await getValue(ta, cas);
                b = await getValue(tb, cas);
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
        exec: (async (cas, child, iterName, arrc) => {
            let arr = await getValue(arrc, cas);
            for (let iter of arr) {
                cas.locals[iterName] = iter;
                if (child) {
                    await child.run(cas);
                }
            }
        })
    }
};

function getActionType(name) {
    if (name.startsWith('INSERTINTO')) return 'db';
    if (blockmap[name]) return blockmap[name].category;
}

export function compileAction(actionName, actions) {
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

async function getValue(v, cas) {
    if (!v.substring && v.name) {
        if (v.name.startsWith('SELECTFROM')) {
            const table = v.name.substring(10);
            const values = Object.keys(cas.tables[table]).filter((e, i) => v.params[i]=='y');
            const query = `SELECT ${values.join([', '])} FROM ${table}`;
            console.log(query);
            return await new Promise(p => db.all(query, (err, rows) => {
                console.log(err, rows);
                if (!err) { p(rows); }
            }));
        }
        return await blockmap[v.name].exec(cas, ...await Promise.all(v.params.map(e=>getValue(e, cas))));
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

export async function execAction(code, sentInputs, tables) {
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
    let cas = { states, locals, clientActs, tables, elements };
    await runActionSequence(code, cas);
    return cas;
}

async function runActionSequence(seq, cas) {
    for (let code of seq) {
        if (!blockmap[code.name]) {
            if (code.name.startsWith('INSERTINTO')) {
                const table = code.name.substring(10);
                const values = Object.keys(cas.tables[table]).map((e, i) => [e, getValue(code.params[i], cas)]);
                const query = `INSERT INTO ${table} (${values.map(e=>e[0]).join([', '])}) VALUES (${values.map(e=>'?').join([', '])})`;
                let realValues = await Promise.all([...values.map(e=>e[1])]);
                console.log(query, realValues);
                await new Promise(p => db.run(query, realValues, (err) => { console.log(err); p(0); }));
            }
            continue;
        }
        if (blockmap[code.name].category == 'control') {
            const child = {
                run: async (cas) => code.child ? (await runActionSequence(code.child, cas)):''
            };
            await blockmap[code.name].exec(cas, child, ...code.params);
        }
        else {
            await blockmap[code.name].exec(cas, ...code.params);
        }
    }
}