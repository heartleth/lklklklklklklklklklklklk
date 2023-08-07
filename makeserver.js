const { compileAction } = require('./compile');
let { ipcMain, dialog } = require('electron');
const path = require('path');
const plb = require('./plb');
const fs = require('fs');

function ipcSetupMakeServer(mainWindow) {
    ipcMain.on('makeServer', (e, html, builtComponents, actions, states, localStorage) => {
        dialog.showOpenDialog(mainWindow, {properties: [ 'openDirectory' ]}).then(res => {
            if (res.filePaths.length) {
                if (fs.existsSync(path.join(res.filePaths[0], 'siteTarget'))) {
                    fs.rmSync(path.join(res.filePaths[0], 'siteTarget'), { recursive: true, force: true });
                }
                fs.mkdirSync(path.join(res.filePaths[0], 'siteTarget'));
                const targetPath = path.join(res.filePaths[0], 'siteTarget');
                const appdata = process.env.AppData;
                fs.copyFileSync(path.join(appdata, 'yghdatas/workspace-db/ws.db'), path.join(targetPath, 'site.db'));
                
                fs.mkdirSync(path.join(targetPath, 'payload'));
                fs.mkdirSync(path.join(targetPath, 'views'));
                fs.copyFileSync(path.join(appdata, 'yghdatas/makeserver/payload.js'), path.join(targetPath, 'payload/payload.js'));
                fs.copyFileSync(path.join(appdata, 'yghdatas/payload/default.css'), path.join(targetPath, 'payload/default.css'));
                // fs.copyFileSync(path.join(appdata, 'yghdatas/payload/lls.css'), path.join(targetPath, 'payload/lls.css'));
                fs.copyFileSync(path.join(appdata, 'yghdatas/makeserver/_package.json'), path.join(targetPath, 'package.json'));
                fs.copyFileSync(path.join(appdata, 'yghdatas/makeserver/README.txt'), path.join(targetPath, 'README.txt'));
                fs.copyFileSync(path.join(appdata, 'yghdatas/makeserver/server.js'), path.join(targetPath, 'server.js'));
                fs.copyFileSync(path.join(appdata, 'yghdatas/makeserver/run.bat'), path.join(targetPath, 'server.bat'));
                let i = 0;
                const tables = localStorage['tables'];
                let indexJS = `
                    import { compileAction, execAction } from './server.js';
                    import express from 'express';
                    import path from 'path';
                    const __dirname = path.resolve();
                    let app = express();
                    app.use(express.json());
                    app.use(express.static('payload'));
                    let tables = ${tables};
                `;
                
                for (const routeName of (localStorage.route ?? '/').split(',')) {
                    const route = (routeName[0]=='/' ? '' : '/') + routeName;
                    const builtComponents = localStorage[route + '.components'] ?? '{}';
                    const actions = JSON.parse(localStorage[route + '.actions']);
                    const states = JSON.parse(localStorage[route + '.states']);
                    let html = localStorage[route + '.page'];

                    let actionsJS = plb + 'window.states=' + JSON.stringify(states) + ';window.builtComponents=' + builtComponents + ';\nfunction metaElem(selector) { let e = document.querySelector(selector); return { value: e.value, selector }; }';
                    for (let action in actions) {
                        if (action.length == 0) continue;
                        if (!actions[action].code) continue;
                        if (isServerAction(actions[action].code)) {
                            let bodyExp = '{' + compileAction(action, actions[action].code).sendInputs.map(t => {
                                if (t[0] == '#State') {
                                    return `"#State${t[1]}":window.states[${t[1]}]`
                                }
                                else if (t[0] == '#Find') {
                                    return `"#Elements:${t[2]}":metaElem(${asExp(t[1])})`
                                }
                            }).join(',') + '}';
                            actionsJS += `async function ${action}() {
                                let stc = [];
                                let local = {};
                                let res = await fetch('./serverside/${action}', { method: 'post', body: JSON.stringify(${bodyExp}), headers: { "Content-Type": "application/json; charset=utf-8" } }).then(e=>e.json());

                                console.log(res);
                                for (let code of res.clientActs) {
                                    console.log(code);
                                    if (code[0].startsWith('AppendHTML')) {
                                        const selector = code[2][1][code[1]].selector;
                                        document.querySelectorAll(selector).forEach(e=>{
                                            for (let k in code[2][1]) {
                                                local[k] = code[2][1][k];
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
                                updateState(stc);
                            }`;
                            const ssurl = (route + '/serverside/' + action).replace(/\/+/g, '/');
                            indexJS += `app.post("${ssurl}", async (req, res) => {
                                let reply = await execAction(${JSON.stringify(actions[action].code)}, req.body, tables);
                                res.send(reply);
                            });`;
                        }
                        else {
                            actionsJS += `function ${action}() { let local = {}; let stc = []; ${actions[action].code.map(asExp).join(' ')}; updateState(stc); }`;
                        }
                        html = html.replace((new RegExp(`callfunctionwithus\\('${action}'\\)`)), (r)=>action + '()');
                    }
                    fs.writeFileSync(path.join(targetPath, 'payload/lls.css'), localStorage['lls']);
                    fs.writeFileSync(path.join(targetPath, 'views/v' + i + '.html'), `
                    <!doctype html>
                    <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link rel="stylesheet" href="/default.css">
                            <link rel="stylesheet" href="/lls.css">
                            <script src="/payload.js"></script>
                            <script>${actionsJS}</script>
                        </head>
                        <body>${html}</body>
                    </html>`);
                    indexJS += `app.get("${route}", (req, res) => { res.sendFile(__dirname + '/views/v${i}.html'); });`;
                    i += 1;
                }
                
                indexJS += 'app.listen(process.env.PORT || 8000, () => {console.log("Server is started at port " + (process.env.PORT || 8000))});'
                fs.writeFileSync(path.join(targetPath, 'index.js'), indexJS);
            }
        });
    });
}

module.exports = { ipcSetupMakeServer };

const ords = { "=": "=", "≠": "!=", ">": ">", "<": "<", "≤": "<=", "≥": ">=" };
const blockmap = {
    'return': {
        category: 'value',
        exp: (val) => `return ${asExp(val)}`
    },
    'JavaScript': {
        category: 'code',
        exp: (code) => code + ';'
    },
    'ConsoleLog': {
        category: 'code',
        exp: (text) => `console.log(${asExp(text)}});`
    },
    'Alert': {
        category: 'ui',
        exp: (text) => `alert(${asExp(text)});`
    },
    'Href': {
        category: 'ui',
        exp: (url) => `location.href = ${asExp(url)};`
    },
    'HasId': {
        category: 'ui',
        exp: (id) => asExp('#' + id)
    },
    'ValueOf': {
        category: 'ui',
        exp: (elem) => `(${asExp(elem)}).value`
    },
    'State': {
        category: 'value',
        exp: (e) => `window.states['${e}']`
    },
    'Local': {
        category: 'value',
        exp: (e) => `local['${e}']`
    },
    'PlusMinus': {
        category: 'value',
        exp: (ta, op, tb) => `(${asExp(ta)} ${op=='mod'?'%':op} ${asExp(tb)})`
    },
    'Find': {
        category: 'ui',
        exp: (selector, into) => `local['${into}']=[...document.querySelectorAll(${asExp(selector)})];`
    },
    'Hide': {
        category: 'ui',
        exp: (v) => asExp(v) + `.forEach(e=>e.classList.add('hide'));`
    },
    'Show': {
        category: 'ui',
        exp: (v) => asExp(v) + `.forEach(e=>e.classList.remove('hide'));`
    },
    'AppendHTML': {
        category: 'ui',
        exp: (html, under) => `local['${under}'].forEach(e=>e.appendChild(${asExp(html)}));`
    },
    'SetState': {
        category: 'value',
        exp: (st, val) => `window.states['${st}']=${asExp(val)};stc.push('${st}');`
    },
    'SetLocal': {
        category: 'value',
        exp: (v, val) => `local['${v}']=${asExp(val)};`
    },
    'IfOrd': {
        category: 'control',
        exp: (child, ta, operator, tb) => `if (${asExp(ta)} ${ords[operator]} ${asExp(tb)}) { ${child.map(asExp).join(' ')} }`
    },
    'WhileOrd': {
        category: 'control',
        exp: (child, ta, operator, tb) => `while (${asExp(ta)} ${ords[operator]} ${asExp(tb)}) { ${child.map(asExp).join(' ')} }`
    }
};

function asExp(j) {
    if (!j) return '';
    if (j.substring) {
        if (/^[0-9.]+$/.test(j)) return j;
        else return '"' + j + '"';
    }
    if (!blockmap[j.name]) {
        if (j.name.startsWith('ComponentCreate')) {
            return `makeUBC('${j.name.substring(15)}', [${j.params.map(asExp).join(', ')}])`;
        }
    }
    if (blockmap[j.name].category == 'control') return blockmap[j.name].exp(j.child, ...j.params);
    return blockmap[j.name].exp(...j.params);
}

function isServerAction(actions) {
    for (let action of actions) {
        if (!action) continue;
        if (action.substring) continue;
        if (action.name.startsWith('INSERTINTO') || action.name.startsWith('SELECTFROM')) {
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