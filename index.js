const { app, BrowserWindow, ipcMain, shell } = require('electron');
const express = require('express');

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
        autoHideMenuBar: true
    });

    win.loadFile('view/index.html');
};

app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    ipcMain.on('openExpress', (e, html, builtComponents, actions, states, localStorage) => {
        port += 1;
        let expressApp = express();
        expressApp.use(express.static('payload'));
        for (const route of localStorage.route) {
            const builtComponents = JSON.parse(localStorage[route + '.components']);
            const actions = JSON.parse(localStorage[route + '.actions']);
            const states = JSON.parse(localStorage[route + '.states']);
            const html = localStorage[route + '.page'];
        
            expressApp.get('/functions' + route, (req, res) => {
                res.send(JSON.stringify({ builtComponents, actions, states }));
            });
            expressApp.get(route, (req, res) => {
                res.send('<meta name="viewport" content="width=device-width, initial-scale=1.0">' + html + '<script src="/payload.js"></script><link rel="stylesheet" href="default.css">');
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