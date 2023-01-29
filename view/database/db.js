const databaseColumnTypes = [
    'Text (< 100 bytes)',
    'Text',
    'Number (N)',
    'Number (Z)',
    'Number (R)',
    // 'Primary Key',
    'Hashed (MD5)',
    'Hashed (SHA1)',
    'Foreign Row',
];

window.tables = {
    student: {
        name: 'Text (< 100 bytes)',
        age: 'Number (N)'
    }
};

function databaseMenu(ws) {
    addChilds(ws, [
        wstitle('Database')
    ]);
    for (const tableName in window.tables) {
        ws.appendChild(make('db-inspector').set('tableName', tableName).elem);
    }
}

class DBInspector extends HTMLElement {
    connectedCallback() {
        this.style.border = 'solid 1px black';
        this.style.marginTop = '8px';
        this.style.display = 'block';
        this.style.padding = '4px';
        if (this.tableName) {
            this.render();
        }
    }

    render() {
        this.innerHTML = '';
        const table = window.tables[this.tableName];
        this.appendChild(wstitle(this.tableName));
        this.appendChild(wse.br());

        for (const column in table) {
            this.appendChild(wse.label(column).attr('style', 'display: inline-block;width: 40px;').elem);
            let colType = make('select').opts(databaseColumnTypes).elem;
            colType.value = table[column];
            colType.style.width = 'calc(100% - 73px)';
            this.appendChild(colType);
            let delButton = make('button').text('-').addClass('newstate').elem;
            delButton.style.width = '21px';
            delButton.addEventListener('click', () => dbRemoveColumn(this.tableName, column, this));
            this.appendChild(delButton);
            this.appendChild(wse.br());
        }
        
        let newCol = make('text').attr('style', 'display: inline-block; width: 30px; margin-right: 1px;').elem;
        this.appendChild(newCol);
        let colType = make('select').opts(databaseColumnTypes).elem;
        colType.style.width = 'calc(100% - 73px)';
        this.appendChild(colType);
        let addButton = make('button').text('+').addClass('newstate').elem;
        addButton.addEventListener('click', () => dbAddColumn(this.tableName, newCol.value, colType.value, this));
        this.appendChild(addButton);
    }
}
window.customElements.define('db-inspector', DBInspector);

function dbAddColumn(tableName, name, type, rerender) {
    if (require) {
        let electron = require('electron');
        window.tables[tableName][name] = type;
        electron.ipcRenderer.send('DBTableAddColumn', tableName, name, type);
        electron.ipcRenderer.once('OKDBTableAddColumn', (e) => {
            rerender.render();
            save();
        });
    }
}

function dbRemoveColumn(tableName, name, rerender) {
    if (require) {
        let electron = require('electron');
        delete window.tables[tableName][name];
        electron.ipcRenderer.send('DBTableRemoveColumn', tableName, name);
        electron.ipcRenderer.once('OKDBTableRemoveColumn', (e) => {
            rerender.render();
            save();
        });
    }
}