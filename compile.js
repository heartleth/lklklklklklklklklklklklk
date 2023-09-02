function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

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
    'Attr': {
        category: 'value',
        isArgs: true,
        exec: ((cas, s) => {
            return cas.attrs[s];
        })
    },
    'PlusMinus': {
        category: 'value',
        exec: async (cas, ta, op, tb) => {
            const ga = await getValue(ta, cas);
            const gb = await getValue(tb, cas);
            const a = parseFloat(ga);
            const b = parseFloat(gb);
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
        exec: (async (cas, v) => {
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
    },
    'Delay': {
        html: 'Delay ?T s',
        category: 'code',
        exec: (async  (cas, t) => {
            cas.clientActs.push(['Delay', [t, {...cas.locals}]]);
        })
    },
    'CallAction': {
        html: 'Action ?A',
        category: 'code',
        exec: (async (cas, ac) => {
            cas.clientActs.push(['CallAction', [ac, {...cas.locals}]]);
        })
    },
    'Random': {
        html: 'Random ?T ≤ X ≤ ?T',
        category: 'value',
        isArgs: true,
        exec: (async (cas, a, b) => {
            let min = parseFloat(await getValue(a, cas));
            let max = parseFloat(await getValue(b, cas));
            console.log(a, b);
            return Math.floor(Math.random() * (max - min + 1) + min);
        })
    },
    'Token': {
        html: 'Token size = ?T',
        category: 'value',
        isArgs: true,
        exec: (async (cas, l) => {
            return makeid(await getValue(l, cas));
        })
    },
    'Len': {
        html: 'Size of ?T',
        category: 'value',
        isArgs: true,
        exec: (async (cas, l) => {
            return (await getValue(l, cas)).length;
        })
    },
    'Index': {
        html: '?T at ?T',
        category: 'value',
        isArgs: true,
        exec: (async (cas, l, idx) => {
            return (await getValue(l, cas))[await getValue(idx, cas)];
        })
    }
};

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
let db = undefined;
(async () => {
    const appdata = process.env.AppData;
    if (!fs.existsSync(path.join(appdata, 'yghdatas/workspace-db/ws.db'))) {
        if (!fs.existsSync(path.join(appdata, 'yghdatas'))) {
            fs.mkdirSync(path.join(appdata, 'yghdatas'));
        }
        if (!fs.existsSync(path.join(appdata, 'yghdatas/workspace-db'))) {
            fs.mkdirSync(path.join(appdata, 'yghdatas/workspace-db'));
        }
        fs.writeFileSync(path.join(appdata, 'yghdatas/workspace-db/ws.db'), '');
        await new Promise(p => {
            setTimeout(() => {
                p(0);
            }, 300);
        });
    }
    db = new sqlite3.Database(path.join(appdata, 'yghdatas/workspace-db/ws.db'));
})();

function getActionType(name) {
    if (name.startsWith('INSERTINTO')) return 'db';
    if (name.startsWith('UPID')) return 'db';
    if (blockmap[name]) return blockmap[name].category;
}

function compileAction(actionName, actions) {
    if (db === undefined) return;
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
    if (db === undefined) return;
    if (v === undefined || v === null) return;
    if (!v.substring && v.name) {
        if (v.name.startsWith('SELECTFROM')) {
            const table = v.name.substring(10);
            const values = Object.keys(cas.tables[table]).filter((e, i) => v.params[i]=='y');
            const query = `SELECT id, ${values.join([', '])} FROM ${table}`;
            console.log(query);
            return await new Promise(p => db.all(query, (err, rows) => {
                console.log(err, rows);
                if (!err) { p(rows); }
            }));
        }
        else if (v.name.startsWith('GETCOL')) {
            let obj = await getValue(v.params[1], cas);
            return await obj[v.params[0]];
        }
        else if (v.name.startsWith('SFID')) {
            const table = v.name.substring(4);
            const query = `SELECT id, ${values.join([', '])} FROM ${table} WHERE id = ${await getValue(v.params[0], cas)}`;
            console.log(query);
            return await new Promise(p => db.all(query, (err, rows) => {
                console.log(err, rows);
                if (!err) { p(rows[0]); }
            }));
        }
        else if (v.name == 'Cookie') {
            return cas.clientCookies[await getValue(v.params[0], cas)];
        }
        else if (v.name == 'Has Cookie') {
            return (cas.clientCookies[await getValue(v.params[0], cas)] !== undefined);
        }
        // let cas2 = { ...cas };
        return await blockmap[v.name].exec(cas, ...await Promise.all(v.params.map(e=>getValue(e, cas))));
        // return await blockmap[v.name].exec(cas, v.params);
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

async function execAction(code, sentInputs, tables, clientCookies) {
    if (db === undefined) return;
    let clientActs = [];
    let elements = {};
    let cookies = [];
    let states = {};
    let locals = {};
    let attrs = {};
    for (let v in sentInputs) {
        if (v.startsWith('#State:')) {
            states[v.substring(7)] = sentInputs[v];
        }
        else if (v.startsWith('#Attrs')) {
            console.log(sentInputs[v]);
            attrs = JSON.parse(sentInputs[v])
        }
        else if (v.startsWith('#Elements:')) {
            elements[v.substring(10)] = sentInputs[v];
        }
    }
    let cas = { states, locals, clientActs, tables, elements, attrs, cookies, clientCookies };
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
                console.log(code.params);
                console.log(query, realValues);
                await new Promise(p => db.run(query, realValues, (err) => { console.log(err); p(0); }));
            }
            else if (code.name.startsWith('UPID')) {
                const table = code.name.substring(4);
                const values = Object.keys(cas.tables[table]).map((e, i) => [e, getValue(code.params[i+1], cas)]);
                const query = `UPDATE ${table} SET ${values.map(e=>e[0]+'=?').join([', '])} WHERE id=` + await getValue(code.params[0], cas);
                let realValues = await Promise.all([...values.map(e=>e[1])]);
                console.log(code.params);
                console.log(query, realValues);
                await new Promise(p => db.run(query, realValues, (err) => { console.log(err); p(0); }));
            }
            else if (code.name == 'Set Cookie') {
                cas.cookies.push({ name: await getValue(code.params[0], cas), value: await getValue(code.params[1], cas) });
            }
            else if (code.name == 'Clear Cookie') {
                cas.cookies.push({ name: await getValue(code.params[0], cas), clear: true });
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

module.exports = { compileAction, execAction };