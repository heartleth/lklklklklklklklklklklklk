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
                        </body>
                    </html>
                    `);
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