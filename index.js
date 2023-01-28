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

    ipcMain.on('openExpress', (e, html, builtComponents, actions, states) => {
        port += 1;
        let expressApp = express();
        expressApp.use(express.static('payload'));
        expressApp.get('/functions', (req, res) => {
            res.send(JSON.stringify({ builtComponents, actions, states }));
        });
        expressApp.get('/', (req, res) => {
            res.send('<meta name="viewport" content="width=device-width, initial-scale=1.0">' + html + '<script src="/payload.js"></script><link rel="stylesheet" href="default.css">');
        });
        expressApp.listen(port);
        shell.openExternal(`http://localhost:${port}/`);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});