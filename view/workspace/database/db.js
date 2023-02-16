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
    let saveDB = make('input').setId('moveDBTo').attr('type', 'file').elem;
    addChilds(ws, [
        wstitle('Database'),
        wse.label('Move Database File').attr('for','moveDBTo').addClass('moveDB').elem,
        saveDB,
        wse.label('Use online database (not supported)').elem,
        
    ]);
    saveDB.addEventListener('click', e => {
        e.preventDefault();
        if (require) {
            let electron = require('electron');
            electron.ipcRenderer.send('DBCopyDatabaseFile');
        }
    })
    let newTableDiv = make('div').elem;
    let newTableName;
    let newTableButton;
    addChilds(newTableDiv, [
        wstitle('CREATE TABLE'),
        wse.br(),
        newTableName=make('text').attr('style', 'width: 100px; height: 16px;').elem,
        newTableButton=make('button').text('CREATE').addClass('newstate').elem
    ]);
    newTableButton.addEventListener('click', ()=>{
        if (require) {
            let electron = require('electron');
            electron.ipcRenderer.send('DBCreateTable', newTableName.value);
            electron.ipcRenderer.once('OKDBCreateTable', (e, s) => {
                window.tables[s] = {};
                ws.innerHTML = '';
                databaseMenu(ws);
            });
        }
    });
    ws.appendChild(newTableDiv);
    for (const tableName in window.tables) {
        ws.appendChild(make('db-table-inspector').set('tableName', tableName).elem);
    }
}

class DBTableInspector extends HTMLElement {
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
        let dropTableButton = make('button').text('DROP TABLE').addClass('newstate').elem;
        this.appendChild(wstitle(this.tableName));
        this.appendChild(dropTableButton);
        this.appendChild(wse.br());
        for (const column in table) {
            this.appendChild(make('text').addClass('tableColName').set('value', column).elem);
            let colType = make('select').opts(databaseColumnTypes).elem;
            colType.value = table[column];
            colType.style.width = 'calc(100% - 130px)';
            colType.addEventListener('change', () => dbTableAlterTypeColumn(this.tableName, column, colType.value, this));
            this.appendChild(colType);
            let delButton = make('button').text('-').addClass('newstate').elem;
            delButton.style.width = '21px';
            delButton.addEventListener('click', () => dbTableRemoveColumn(this.tableName, column, this));
            this.appendChild(delButton);
            this.appendChild(wse.br());
        }
        
        let newCol = make('text').attr('style', 'display: inline-block; width: 86px; margin-right: 5px;').elem;
        this.appendChild(newCol);
        let colType = make('select').opts(databaseColumnTypes).elem;
        colType.style.width = 'calc(100% - 130px)';
        this.appendChild(colType);
        let addButton = make('button').text('+').addClass('newstate').elem;
        addButton.addEventListener('click', () => dbTableAddColumn(this.tableName, newCol.value, colType.value, this));
        this.appendChild(addButton);

        if (require) {
            let electron = require('electron');
            let showDatas = make('button').addClass('newstate').text('View Table').elem;
            let dataTable = make('table').elem;
            showDatas.addEventListener('click', () => {
                if (showDatas.innerText[0] == 'H') {
                    dataTable.innerHTML = '';
                    showDatas.innerText = 'View Table';
                    return;
                }
                electron.ipcRenderer.send('DBTableShowSome', this.tableName);
                electron.ipcRenderer.once('OKDBTableShowSome', (e, r) => {
                    let cols = ['id'].concat(Object.keys(table));
                    dataTable.innerHTML = `<tbody>
                    <tr>${cols.map(e=>`<th>${e}</th>`).join('')}</tr>
                    ${r.map(row=>`<tr>${cols.map(e=>`<td>${row[e]}</td>`).join('')}</tr>`).join('')}
                    </tbody>`;
                });
                showDatas.innerText = 'Hide Table';
            });
            this.appendChild(wse.br());
            this.appendChild(showDatas);
            this.appendChild(dataTable);
            dropTableButton.addEventListener('click', () => {
                electron.ipcRenderer.send('DBDropTable', this.tableName);
                electron.ipcRenderer.once('OKDBDropTable', (e, r) => {
                    delete window.tables[r];
                    this.remove();
                });
            });
        }
    }
}
window.customElements.define('db-table-inspector', DBTableInspector);

function dbTableAddColumn(tableName, name, type, rerender) {
    if (require) {
        let electron = require('electron');
        electron.ipcRenderer.send('DBTableAddColumn', tableName, name, type);
        electron.ipcRenderer.once('OKDBTableAddColumn', (e) => {
            window.tables[tableName][name] = type;
            rerender.render();
            save();
        });
    }
}

function dbTableAlterTypeColumn(tableName, name, type, rerender) {
    if (require) {
        let electron = require('electron');
        electron.ipcRenderer.send('DBTableAlterTypeColumn', tableName, name, type);
        electron.ipcRenderer.once('OKDBTableAlterTypeColumn', (e) => {
            window.tables[tableName]['retype_' + name] = type;
            rerender.render();
            save();
        });
    }
}

function dbTableRemoveColumn(tableName, name, rerender) {
    if (require) {
        let electron = require('electron');
        electron.ipcRenderer.send('DBTableRemoveColumn', tableName, name);
        electron.ipcRenderer.once('OKDBTableRemoveColumn', (e) => {
            delete window.tables[tableName][name];
            rerender.render();
            save();
        });
    }
}

// wse.label('Host').elem,
// make('input').attr('type', 'text').elem,
// wse.br(),
// wse.label('Port').elem,
// make('input').attr('type', 'number').elem,
// wse.br(),
// wse.label('user').elem,
// make('input').attr('type', 'text').elem,
// wse.br(),
// wse.label('database').elem,
// make('input').attr('type', 'text').elem,
// wse.br(),
// wse.label('password').elem,
// make('input').attr('type', 'password').elem,