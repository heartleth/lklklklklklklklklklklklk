const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const { compileAction, execAction } = require('./compile');
const { ipcSetupMakeServer } = require('./makeserver');
const cookieParser = require('cookie-parser');
const { setupIpc, db } = require('./database');
const { sha356, sha256 } = require('js-sha256');
const express = require('express');

const https = require('https');
const path = require('path');
const fs = require('fs');
let port = 5252;

const databaseColumnTypes = {
    'Text (< 100 bytes)': 'varchar(100)',
    'Text': 'text',
    'Number (N)': 'integer',
    'Number (Z)': 'integer',
    'Number (R)': 'real',
    'Hashed (MD5)': 'text',
    'Hashed (SHA1)': 'text',
    'Foreign Row': ''
};

function clearPath(path) {
    let pp = path.replace(/\/+/g, '/');
    if (pp[pp.length - 1] == '/') {
        return pp.substring(0, pp.length - 1);
    }
    return pp;
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        darkTheme: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, 'icon/icon.png'),
        autoHideMenuBar: true
    });

    // win.loadFile('view/index.html');
    win.loadFile('view/projects.html');
    return win;
};

let listening = undefined;

app.whenReady().then(async () => {
    let win = createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
    const appdata = process.env.AppData;
    if (!fs.existsSync(path.join(appdata, 'yghdatas/payload/default.css'))) {
        if (!fs.existsSync(path.join(appdata, 'yghdatas'))) {
            fs.mkdirSync(path.join(appdata, 'yghdatas'));
        }
        if (!fs.existsSync(path.join(appdata, 'yghdatas/payload'))) {
            fs.mkdirSync(path.join(appdata, 'yghdatas/payload'));
        }
        const requirements = [
            'default.css',
            'payload.js'
        ];
        for (let filename of requirements) {
            const file = fs.createWriteStream(path.join(appdata, 'yghdatas/payload/' + filename));
            const request = https.get("https://raw.githubusercontent.com/heartleth/lklklklklklklklklklklklk/main/payload/" + filename, function(response) {
                response.pipe(file);
                file.on("finish", () => {
                    file.close();
                    console.log("Download Completed! " + filename);
                });
            });
        }
        if (!fs.existsSync(path.join(appdata, 'yghdatas/makeserver'))) {
            fs.mkdirSync(path.join(appdata, 'yghdatas/makeserver'));
        }
        const requirements2 = [
            '_package.json',
            'payload.js',
            'README.txt',
            'server.js',
            'run.bat'
        ];
        for (let filename of requirements2) {
            const file = fs.createWriteStream(path.join(appdata, 'yghdatas/makeserver/' + filename));
            const request = https.get("https://raw.githubusercontent.com/heartleth/lklklklklklklklklklklklk/main/makeserver/" + filename, function(response) {
                response.pipe(file);
                file.on("finish", () => {
                    file.close();
                    console.log("Download Completed! " + filename);
                });
            });
        }
    }

    setupIpc(win);
    ipcSetupMakeServer(win);

    ipcMain.on('saveAsFile', (e, localStorage) => {
        if (localStorage.saveFilePath) {
            fs.writeFileSync(localStorage.saveFilePath, JSON.stringify(localStorage));
            e.reply('savedPath', false);
        }
        else {
            dialog.showSaveDialog(win, {filters: [{name:'*.json', extensions:['json']}], defaultPath: 'save.json'}).then(res => {
                if (res.filePath) {
                    console.log(res.filePath);
                    fs.writeFileSync(res.filePath, JSON.stringify(localStorage));
                    e.reply('savedPath', res.filePath);
                }
                else {
                    e.reply('savedPath', false);
                }
            });
        }
    });
    ipcMain.on('loadFile', (e, ls) => {
        dialog.showOpenDialog(win, {properties: [ 'openFile' ], filters:[{name:'*.json', extensions: ['json']}]}).then(async res => {
            if (res.filePaths.length) {
                let lc = JSON.parse(fs.readFileSync(res.filePaths[0]).toString());
                let ptables = Object.keys(JSON.parse(lc.tables));
                let tables = JSON.parse(lc.tables);
                await Promise.all([...ptables.map(table => new Promise(p => db().run(`DROP TABLE IF EXISTS ` + table, (err) => { p() })))]);
                await Promise.all(Object.keys(tables).map(k => {
                    const safeTableName = k;
                    let q = Object.keys(tables[k]).map(k => `, ${k} ${databaseColumnTypes[tables[k]]}`).join('');
                    return new Promise(p => {   
                        db().run(`CREATE TABLE IF NOT EXISTS ${safeTableName} (id INTEGER PRIMARY KEY AUTOINCREMENT${q})`, (err) => {
                            if (!err) { p(); }
                            else {
                                console.log('?????');
                                console.log(err);
                            }
                        });
                    });
                }));
                e.reply('loadedLS', lc);
            }
        });
    });
    ipcMain.on('openExpress', (e, html, builtComponents, actions, states, localStorage) => {
        // port += 1;
        if (listening !== undefined) {
            listening.close();
        }
        let expressApp = express();
        expressApp.use(cookieParser());
        expressApp.use(express.json());
        expressApp.use(express.static(path.join(appdata, 'yghdatas/payload')));
        console.log(localStorage);
        console.log(actions);
        for (const routeName of (localStorage.route || '').split(',')) {
            const route = clearPath(routeName);
            console.log(route);
            const builtComponents = JSON.parse(localStorage[route + '.components'] ?? '{}');
            const actions = JSON.parse(localStorage['actions']);
            const states = JSON.parse(localStorage[route + '.states']);
            const tables = JSON.parse(localStorage['tables']);
            const html = localStorage[route + '.page'];
            const llstyle = localStorage['llcss'];
            let serverSidePostActions = [];
            for (let an in actions) {
                if (!actions[an].code) {
                    continue;
                }
                if (isServerAction(actions[an].code)) {
                    let compiled = compileAction(an, actions[an].code);
                    serverSidePostActions.push({ name: an, sha: sha256(an), ses: compiled.sendInputs });
                    const ssurl = (route + '/serverside/' + sha256(an)).replace(/\/+/g, '/');
                    expressApp.post(ssurl, async (req, res) => {
                        console.log(req.body);
                        let reply = await execAction(actions[an].code, req.body, tables, req.cookies);
                        for (const cookie of reply.cookies) {
                            if (cookie.clear) {
                                res.clearCookie(cookie.name);
                            }
                            else {
                                res.cookie(cookie.name, cookie.value);
                            }
                        }
                        reply.clientCookies = reply.cookies = undefined;
                        res.send(reply);
                    });
                }
            }
            expressApp.get('/functions' + route, (req, res) => {
                res.send(JSON.stringify({ builtComponents, actions, states, tables, serverSidePostActions }));
            });
            expressApp.get('/lls.css' + route, (req, res) => {
                res.type('css').send(llstyle);
            });
            expressApp.get(route, (req, res) => {
                res.setHeader('Content-Type', 'text/html; charset=utf-8').send('<meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="/payload.js"></script><link rel="stylesheet" href="default.css"><link rel="stylesheet" href="/lls.css">' + html);
            });
        }
        listening = expressApp.listen(port);
        shell.openExternal(`http://localhost:${port}/`);
    });
    ipcMain.on('SelectImage', (e) => {
        dialog.showOpenDialog(win, { filters: [{extensions:['png','jpg','gif','jpeg','webp']}] }).then((res) => {
            if (res.filePaths[0]) {
                e.reply('retf', res.filePaths[0]);
            }
            else {
                e.reply('retf', 0);
            }
        });
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function isServerAction(actions) {
    console.log(actions);
    for (let action of actions) {
        if (!action) continue;
        if (action.substring) continue;
        if (action.name.includes('Cookie') || action.name.startsWith('INSERTINTO') || action.name.startsWith('SELECTFROM') || action.name.startsWith('UPID') || action.name.startsWith('SFID')) {
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