const { ipcMain, dialog } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db = undefined;
(async () => {
    const appdata = process.env.AppData;
    if (!fs.existsSync(path.join(appdata, 'lklklklk/workspace-db/ws.db'))) {
        if (!fs.existsSync(path.join(appdata, 'lklklklk'))) {
            fs.mkdirSync(path.join(appdata, 'lklklklk'));
        }
        if (!fs.existsSync(path.join(appdata, 'lklklklk/workspace-db'))) {
            fs.mkdirSync(path.join(appdata, 'lklklklk/workspace-db'));
        }
        fs.writeFileSync(path.join(appdata, 'lklklklk/workspace-db/ws.db'), '');
        await new Promise(p => {
            setTimeout(() => {
                p(0);
            }, 300);
        });
    }
    db = new sqlite3.Database(path.join(appdata, 'lklklklk/workspace-db/ws.db'));
})();

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

function asSafe(s) {
    return s.replace(/[^a-zA-Z0-9_]/g, '');
}

function setupIpc(mainWindow) {
    if (db === undefined) return;
    ipcMain.on('DBTableAddColumn', (e, tableName, name, type) => {
        const safeTableName = asSafe(tableName);
        const safeName = asSafe(name);
        if (safeName == 'id') {
            return;
        }
        db.run(`ALTER TABLE ${safeTableName} ADD ${safeName} ${databaseColumnTypes[type]}`, (err) => {
            if (!err) { e.reply('OKDBTableAddColumn'); }
            else {
                console.log('?????');
                console.log(err);
            }
        });
    });
    ipcMain.on('DBCreateTable', (e, tableName) => {
        const safeTableName = asSafe(tableName);
        db.run(`CREATE TABLE IF NOT EXISTS ${safeTableName} (id INTEGER PRIMARY KEY AUTOINCREMENT)`, (err) => {
            if (!err) { e.reply('OKDBCreateTable', safeTableName); }
            else {
                console.log('?????');
                console.log(err);
            }
        });
    });
    ipcMain.on('DBDropTable', (e, tableName) => {
        dialog.showMessageBox({
            buttons: [ "Yes", "No" ],
            message: `This operation cannot be undone. Would you like to proceed "Drop Table ${tableName}"?`
        }).then((res) => {
            if (res.response === 0) {
                const safeTableName = asSafe(tableName);
                db.run(`DROP TABLE ${safeTableName};`, (err) => {
                    if (!err) { e.reply('OKDBDropTable', safeTableName); }
                    else {
                        console.log('?????');
                        console.log(err);
                    }
                });
            }
        });
    
    });
    ipcMain.on('DBTableAlterTypeColumn', (e, tableName, name, type) => {
        const safeTableName = asSafe(tableName);
        const safeName = asSafe(name);
        if (safeName == 'id') {
            return;
        }
        db.run(`ALTER TABLE ${safeTableName} ADD COLUMN retype_${safeName} ${databaseColumnTypes[type]}`, (err) => {
            if (!err) { e.reply('OKDBTableAlterTypeColumn'); }
            else {
                console.log('?????');
                console.log(err);
            }
        });
    });
    ipcMain.on('DBTableRemoveColumn', (e, tableName, name) => {
        const safeTableName = asSafe(tableName);
        const safeName = asSafe(name);
        db.run(`ALTER TABLE ${safeTableName} DROP COLUMN ${safeName}`, (err) => {
            if (!err) { e.reply('OKDBTableRemoveColumn'); }
            else {
                console.log('?????');
                console.log(err);
            }
        });
    });
    ipcMain.on('DBInitDatabase', async (e, tables) => {
        await Promise.all([...tables.map(table => new Promise(p => db.run(`DROP TABLE IF EXISTS ` + table, (err) => { p() })))]);
        await new Promise(p=>{
            db.run('CREATE TABLE student(id INTEGER PRIMARY KEY AUTOINCREMENT, name varchar(100), age int)', (e) => {
                console.log(e);
                p()
            })
        });
        e.reply('OKDBInitDatabase');
    });
    ipcMain.on('DBTableShowSome', (e, table) => {
        db.all('SELECT * FROM ' + table + ' LIMIT 5', (err, r) => {
            console.log(err);
            e.reply('OKDBTableShowSome', r);
        })
    });
    ipcMain.on('DBTableGetColumns', async (e, tableName, name) => {
        e.reply('GetColumns', await getTableInfo());
    });
    ipcMain.on('DBCopyDatabaseFile', (e, tableName, name) => {
        dialog.showOpenDialog(mainWindow, {properties: [ 'openDirectory' ]}).then(res => {
            if (res.filePaths.length) {
                fs.copyFileSync(path.join(__dirname, 'workspace-db/ws.db'), path.join(res.filePaths[0], 'Copied.db'))
            }
        })
    });
}

function getTableInfo() {
    if (db === undefined) return;
    return new Promise(info => {
        db.all(`SELECT sql FROM sqlite_master WHERE tbl_name = '${tableName}' AND type = 'table'`, (a, b)=>{
            const tnl = 'student'.length;
            info([...b[0].sql.substring(15 + tnl).split(',')].map(e=>e.substring(0, e.length - 1).trim().split(' ')));
        });
    });
}

module.exports = { setupIpc };