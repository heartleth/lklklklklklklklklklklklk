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

function setupIpc() {
    ipcMain.on('DBTableAddColumn', (e, tableName, name, type) => {
        const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
        const safeName = name.replace(/[^a-zA-Z0-9_]/g, '');
        db.run(`ALTER TABLE ${safeTableName} ADD ${safeName} ${databaseColumnTypes[type]}`, (err) => {
            if (!err) {
                e.reply('OKDBTableAddColumn');
            }
            else {
                console.log('?????');
                console.log(err);
            }
        });
    });
    ipcMain.on('DBTableRemoveColumn', (e, tableName, name) => {
        const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
        const safeName = name.replace(/[^a-zA-Z0-9_]/g, '');
        db.run(`ALTER TABLE ${safeTableName} DROP COLUMN ${safeName}`, (err) => {
            if (!err) {
                e.reply('OKDBTableRemoveColumn');
            }
            else {
                console.log('?????');
                console.log(err);
            }
        });
    });
    
}

module.exports = { setupIpc };