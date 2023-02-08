const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { compileAction, execAction } = require('./compile');
const { ipcSetupMakeServer } = require('./makeserver');
const { setupIpc } = require('./database');
const express = require('express');
let port = 5252;

// const db = new sqlite3.Database(':memory:');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        darkTheme: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true
    });

    // win.loadFile('view/index.html');
    win.loadFile('view/projects.html');
    return win;
};

app.whenReady().then(() => {
    let win = createWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    setupIpc(win);
    ipcSetupMakeServer(win);
    ipcMain.on('openExpress', (e, html, builtComponents, actions, states, localStorage) => {
        port += 1;
        let expressApp = express();
        // expressApp.use(express.urlencoded({ extended: false }));
        expressApp.use(express.json());
        expressApp.use(express.static('payload'));
        for (const routeName of localStorage.route.split(',')) {
            const route = (routeName[0]=='/' ? '' : '/') + routeName;
            const builtComponents = JSON.parse(localStorage[route + '.components'] ?? '{}');
            const actions = JSON.parse(localStorage[route + '.actions']);
            const states = JSON.parse(localStorage[route + '.states']);
            const tables = JSON.parse(localStorage['tables']);
            const html = localStorage[route + '.page'];
            let serverSidePostActions = [];
            for (let an in actions) {
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
        expressApp.listen(port);
        shell.openExternal(`http://localhost:${port}/`);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

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