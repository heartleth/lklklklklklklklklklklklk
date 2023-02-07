const { compileAction } = require('./compile');
let { ipcMain, dialog } = require('electron');
const path = require('path');
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
                fs.copyFileSync(path.join(__dirname, 'workspace-db/ws.db'), path.join(targetPath, 'site.db'));
                
                fs.mkdirSync(path.join(targetPath, 'views'));
                fs.mkdirSync(path.join(targetPath, 'payload'));
                fs.copyFileSync(path.join(__dirname, 'payload/default.css'), path.join(targetPath, 'payload/default.css'));
                fs.copyFileSync(path.join(__dirname, 'makeserver/_package.json'), path.join(targetPath, 'package.json'));
                fs.copyFileSync(path.join(__dirname, 'makeserver/run.bat'), path.join(targetPath, 'server.bat'));
                fs.copyFileSync(path.join(__dirname, 'makeserver/README.txt'), path.join(targetPath, 'README.txt'));
                let i = 0;
                let indexJS = `
                    import express from 'express';
                    import path from 'path';
                    const __dirname = path.resolve();
                    let app = express();
                    app.use(express.static('payload'));
                `;
                
                for (const routeName of (localStorage.route ?? '/').split(',')) {
                    const route = (routeName[0]=='/' ? '' : '/') + routeName;
                    const builtComponents = JSON.parse(localStorage[route + '.components'] ?? '{}');
                    const actions = JSON.parse(localStorage[route + '.actions']);
                    const states = JSON.parse(localStorage[route + '.states']);
                    const tables = JSON.parse(localStorage['tables']);
                    const html = localStorage[route + '.page'];

                    let actionsJS = 'function metaElem(selector) { let e = document.querySelector(selector); return { value: e.value, selector }; }';
                    for (let action in actions) {
                        if (isServerAction(actions[action].code)) {
                            let bodyExp = '{' + compileAction(action, actions[action].code).sendInputs.map(t => {
                                if (t[0] == '#State') {
                                    return `"#State${t[1]}":window.states[${t[1]}]`
                                }
                                else if (t[0] == '#Find') {
                                    return `"#Elements:${t[2]}":metaElem(${asExp(t[1])})`
                                }
                            }).join(',') + '}';
                            actionsJS += `function ${action}() { fetch('./serverside/${action}', { method: 'post', body: JSON.stringify(${bodyExp}) }); }`;
                            const ssurl = (route + '/serverside/' + an).replace(/\/+/g, '/');
                            indexJS += `app.post("${ssurl}", async (req, res) => {
                                // TODO
                            })`;
                        }
                        else {
                            actionsJS += `function ${action}() { let locals = {}; ${actions[action].code.map(asExp).join(' ')} }`;
                        }
                    }
                    fs.writeFileSync(path.join(targetPath, 'views/v' + i + '.html'), `
                    <!doctype html>
                    <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link rel="stylesheet" href="default.css">
                        </head>
                        <body>
                            ${html}
                            <script src="/payload.js"></script>
                            <script>${actionsJS}</script>
                        </body>
                    </html>`);
                    indexJS += `app.get("${route}", (req, res) => { res.sendFile(__dirname + '/views/v${i}.html'); });`;
                    i += 1;
                }
                
                indexJS += 'app.listen(process.env.PORT || 8000, () => {console.log("Server is started at port " + process.env.PORT || 8000)});'
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
        exp: (id) => `#` + asExp(id)
    },
    'ValueOf': {
        category: 'ui',
        exp: (elem) => `(${asExp(elem)}).value`
    },
    'State': {
        category: 'value',
        exp: (e) => `window.states[${e}]`
    },
    'Local': {
        category: 'value',
        exp: (e) => `local[${e}]`
    },
    'PlusMinus': {
        category: 'value',
        exp: (ta, op, tb) => `(${asExp(ta)} ${op=='mod'?'%':mod} ${asExp(tb)})`
    },
    'Find': {
        category: 'ui',
        exp: (selector, into) => `local[${into}]=[...document.querySelectorAll(${asExp(selector)})]`
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
        exp: (html, under) => `local[${under}].forEach(e=>e.appendChild(${asExp(html)}));`
    },
    'SetState': {
        category: 'value',
        exp: (st, val) => `window.states[${st}]=${asExp(val)};`
    },
    'SetLocal': {
        category: 'value',
        exp: (v, val) => `local[${v}]=${asExp(val)};`
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
    if (j.substring) return j;
    if (!blockmap[j.name]) {

    }
    if (blockmap[j.name].category == 'control') return blockmap[j.name].exp(j.child, ...j.params);
    return blockmap[j.name].exp(...j.params);
}