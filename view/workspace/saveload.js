function getPage() {
    // if (location.hash == '') {
    //     return '/.';
    // }
    // else if (location.hash[1] != '/') {
    //     return clearPath(location.hash) + '.';
    // }
    return clearPath(location.hash.substring(1)) + '.';
}

// async function save() {
function save() {
    const page = getPage();
    localStorage.setItem('tables', JSON.stringify(window.tables));
    let mode = document.querySelector('wsbody').getAttribute('mode');
    if (mode != 'Page') {
        window.builtComponents[mode].html = document.querySelector('wsbody').innerHTML;
    }
    else {
        localStorage.setItem(page + 'page', document.querySelector('wsbody').innerHTML);
    }
    if (!localStorage.getItem('route')) {
        localStorage.setItem('route', '');
    }
    localStorage.setItem('version', '');
    localStorage.setItem(page + 'components', JSON.stringify(window.builtComponents));
    // localStorage.setItem(page + 'actions', JSON.stringify(window.actions));
    if (localStorage.getItem('actions')) {
        let acc = JSON.parse(localStorage.getItem('actions'));
        for (const key in window.actions) {
            acc[key] = window.actions[key];
        }
        localStorage.setItem('actions', JSON.stringify(acc));
    }
    else {
        localStorage.setItem('actions', JSON.stringify(window.actions));
    }
    localStorage.setItem(page + 'states', JSON.stringify(window.states));
    localStorage.setItem(page + 'menus', JSON.stringify([...document.getElementById('menus').children].map(e=>{
        let { top, left, right, width, height } = e.style;
        let an = e.actionName;
        let type = e.getAttribute('name');
        let x = 0;
        if (e.fixdiv !== undefined) {
            x = e.fixdiv.parentElement.id.substring(2);
        }
        return [top, left, right, width, height, type, x, an];
    })));
    if (window.require) {
        let elecrtron = require('electron');
        elecrtron.ipcRenderer.send('save', {...localStorage});
    }
}

async function load() {
    const page = getPage();

    window.builtComponents = {};
    for (let k of Object.keys(defaultBuiltComponents)) {
        window.builtComponents[k] = defaultBuiltComponents[k];
    }
    if (localStorage.getItem(page + 'states')) {
        window.tables = JSON.parse(localStorage.getItem('tables'));
        window.builtComponents = JSON.parse(localStorage.getItem(page + 'components'));
        
        for (let bc of Object.keys(window.builtComponents)) {
            if (!window.builtComponents[bc]) {
                continue;
            }
            let attrs = window.builtComponents[bc].attributes;
            blockmap['ComponentCreate' + bc] = {
                html: 'Create ' + bc + ' ' + attrs.map(e=>e+':?T'),
                category: 'ui',
                isArgs: true,
                exp: (e) => `#${e}`,
                exec: (async (stc, local, ...params) => {
                    return make('user-built-component').set('attrs', params).set('componentName', bc).elem;
                })
            };
        }
        // if (code.name.startsWith('INSERTINTO')) {
        //     const table = code.name.substring(10);
        //     const values = Object.keys(cas.tables[table]).map((e, i) => [e, getValue(code.params[i], cas)]);
        //     const query = `INSERT INTO ${table} (${values.map(e=>e[0]).join([', '])}) VALUES (${values.map(e=>'?').join([', '])})`;
        //     let realValues = await Promise.all([...values.map(e=>e[1])]);
        //     console.log(code.params);
        //     console.log(query, realValues);
        //     await new Promise(p => db.run(query, realValues, (err) => { console.log(err); p(0); }));
        // }
        // else if (code.name.startsWith('UPID')) {
        //     const table = code.name.substring(4);
        //     const values = Object.keys(cas.tables[table]).map((e, i) => [e, getValue(code.params[i+1], cas)]);
        //     const query = `UPDATE ${table} SET ${values.map(e=>e[0]+'=?').join([', '])} WHERE id=` + await getValue(code.params[0], cas);
        //     let realValues = await Promise.all([...values.map(e=>e[1])]);
        //     console.log(code.params);
        //     console.log(query, realValues);
        //     await new Promise(p => db.run(query, realValues, (err) => { console.log(err); p(0); }));
        // }
        for (let table of Object.keys(window.tables)) {
            blockmap['INSERTINTO' + table] = {
                html: 'Insert values ' + Object.keys(window.tables[table]).map(e=>e+':?T').join(' ') + ' into ' + table,
                category: 'db',
                isArgs: false,
                exec: (async (stc, local, ...params) => {                    
                    console.log('Insert values ' + Object.keys(window.tables[table]).map(e=>e+': ... ') + 'INTO ' + table);
                })
            };
            blockmap['SELECTFROM' + table] = {
                html: `Select ${Object.keys(window.tables[table]).map(e=>e+'?{y,n}').join(' ')} from ${table}`,
                category: 'db',
                isArgs: true,
                exec: (async (stc, local, ...cols) => {
                    console.log('SELECT ' + Object.keys(window.tables[table]).filter((e, i)=>cols[i]=='y').join(', ') + 'FROM' + table);
                })
            };
            blockmap['SFID' + table] = {
                html: `Select ${Object.keys(window.tables[table]).join(',')} from ${table} at id ?T`,
                category: 'db',
                isArgs: true,
                exec: (async (stc, local, ...cols) => {
                    console.log('얼럴럴러');
                })
            };
            blockmap['UPID' + table] = {
                html: `Update ${table} at id ?T as ` + Object.keys(window.tables[table]).map(e=>e+':?T').join(' '),
                category: 'db',
                isArgs: false,
                exec: (async (stc, local, ...cols) => {
                    console.log('얼럴럴러');
                })
            };
            blockmap['GETCOL' + table] = {
                html: `Column ?{${Object.keys(window.tables[table]).join(',')},id} of ?T from ${table}`,
                category: 'db',
                isArgs: true,
                exec: (async (stc, local, col, obj) => {
                    return await getValue(obj, local)[col];
                })
            };
        }
        // let allActions = JSON.parse(localStorage.getItem(page + 'actions'));
        let allActions = JSON.parse(localStorage.getItem('actions'));
        console.log(allActions);
        window.actions = {};
        let path = clearPath(location.hash.substring(1));
        for (const key in allActions) {
            if (path.startsWith(allActions[key].from) || path == allActions[key].from) {
                if (path == allActions[key].from || allActions[key].inherit) {
                    window.actions[key] = allActions[key];
                }
            }
        }
        window.states = JSON.parse(localStorage.getItem(page + 'states'));
        document.querySelector('wsbody').innerHTML = localStorage.getItem(page + 'page');
        let menus = JSON.parse(localStorage.getItem(page + 'menus'));
        let d = document.getElementById('menus');
        for (let m of menus) {
            let [top, left, right, width, height, type, fix, an] = m;
            let e = document.createElement('some-menu');
            e.setAttribute('name', type);
            e.style.height = height;
            e.style.width = width;
            e.style.right = right;
            e.style.left = left;
            e.actionName = an;
            e.style.top = top;
            if (fix) {
                let fd = document.createElement('div');
                fd.formenu = e;
                e.fixdiv = fd;
                document.querySelector('#ws' + fix).appendChild(fd);
                fd.style.height = parseFloat(height.substring(0, height.length - 2)) + 8 + 'px';
                fd.style.width = parseFloat(width.substring(0, width.length - 2)) + 'px';
            }
            d.appendChild(e);
        }
        document.querySelectorAll('.outline').forEach(e=>e.classList.remove('outline'));
        document.getElementById('location').innerText = 'site.com' + getPage().replace('.', '');
        let ee = document.getElementById('lsimulate');
        ee.innerHTML = localStorage.getItem('llcss');
    }
    else {
        window.states = {};
    }
    document.getElementById('location').innerText = 'site.com' + getPage().replace('.', '');
    drawCanvas();
}