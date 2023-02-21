const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const { compileAction, execAction } = require('./compile');
const { ipcSetupMakeServer } = require('./makeserver');
const { setupIpc } = require('./database');
const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');
let port = 5252;

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
        }
        if (!fs.existsSync(path.join(appdata, 'yghdatas/makeserver'))) {
            fs.mkdirSync(path.join(appdata, 'yghdatas/makeserver'));
            const requirements = [
                '_package.json',
                'payload.js',
                'README.txt',
                'server.js',
                'run.bat'
            ];
            for (let filename of requirements) {
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
    }

    setupIpc(win);
    ipcSetupMakeServer(win);

    ipcMain.on('saveAsFile', (e, localStorage) => {
        if (localStorage.saveFilePath) {
            fs.writeFileSync(path.join(localStorage.saveFilePath, 'saveFile.json'), JSON.stringify(localStorage));
            e.reply('savedPath', false);
        }
        else {
            dialog.showOpenDialog(win, {properties: [ 'openDirectory' ]}).then(res => {
                if (res.filePaths.length) {
                    fs.writeFileSync(path.join(res.filePaths[0], 'saveFile.json'), JSON.stringify(localStorage));
                    e.reply('savedPath', res.filePaths[0]);
                }
                else {
                    e.reply('savedPath', false);
                }
            });
        }
    });
    ipcMain.on('loadFile', (e, localStorage) => {
        dialog.showOpenDialog(win, {properties: [ 'openFile' ]}).then(res => {
            if (res.filePaths.length) {
                let lc = JSON.parse(fs.readFileSync(res.filePaths[0]).toString());
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
        expressApp.use(express.json());
        expressApp.use(express.static(path.join(appdata, 'yghdatas/payload')));
        for (const routeName of (localStorage.route || '/').split(',')) {
            const route = (routeName[0]=='/' ? '' : '/') + routeName;
            const builtComponents = JSON.parse(localStorage[route + '.components'] ?? '{}');
            const actions = JSON.parse(localStorage[route + '.actions']);
            const states = JSON.parse(localStorage[route + '.states']);
            const tables = JSON.parse(localStorage['tables']);
            const html = localStorage[route + '.page'];
            let serverSidePostActions = [];
            for (let an in actions) {
                if (!actions[an].code) {
                    continue;
                }
                if (isServerAction(actions[an].code)) {
                    let compiled = compileAction(an, actions[an].code);
                    serverSidePostActions.push({ name: an, ses: compiled.sendInputs });
                    const ssurl = (route + '/serverside/' + an).replace(/\/+/g, '/');
                    expressApp.post(ssurl, async (req, res) => {
                        console.log(req.body);
                        let reply = await execAction(actions[an].code, req.body, tables);
                        res.send(reply);
                    });
                }
            }
            expressApp.get('/functions' + route, (req, res) => {
                res.send(JSON.stringify({ builtComponents, actions, states, tables, serverSidePostActions }));
            });
            expressApp.get(route, (req, res) => {
                res.setHeader('Content-Type', 'text/html; charset=utf-8').send('<meta name="viewport" content="width=device-width, initial-scale=1.0">' + html + '<script src="/payload.js"></script><link rel="stylesheet" href="default.css">');
            });
        }
        listening = expressApp.listen(port);
        shell.openExternal(`http://localhost:${port}/`);
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
        if (action.name.startsWith('INSERTINTO') || action.name.startsWith('SELECTFROM') || action.name.startsWith('UPID') || action.name.startsWith('SFID')) {
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