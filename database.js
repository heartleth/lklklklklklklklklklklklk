const { ipcMain } = require('electron');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./workspace-db/ws.db');

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

function setupIpc() {
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
    ipcMain.on('DBTableAlterTypeColumn', (e, tableName, name, type) => {
        const safeTableName = asSafe(tableName);
        const safeName = asSafe(name);
        if (safeName == 'id') {
            return;
        }
        db.run(`ALTER TABLE ${safeTableName} ADD COLUMN ${safeName} ${databaseColumnTypes[type]}`, (err) => {
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
    // ipcMain.on('DBTableGetColumns', (e, tableName, name) => {
    //     getTableInfo();
    // });
}

function getTableInfo() {
    return new Promise(info => {
        db.all(`SELECT sql FROM sqlite_master WHERE tbl_name = '${tableName}' AND type = 'table'`, (a, b)=>{
            const tnl = 'student'.length;
            info([...b[0].sql.substring(15 + tnl).split(',')].map(e=>e.substring(0, e.length - 1).trim().split(' ')));
        });
    });
}

module.exports = { setupIpc };