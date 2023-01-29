function getPage() {
    if (location.hash == '') {
        return '/.';
    }
    else if (location.hash[0] != '/') {
        return '/' + location.hash.substring(1) + '.';
    }
    return location.hash.substring(1) + '.';
}

async function save() {
    setTimeout(()=>{
        const page = getPage();

        let mode = document.querySelector('wsbody').getAttribute('mode');
        if (mode != 'Page') {
            window.builtComponents[mode].html = document.querySelector('wsbody').innerHTML;
        }
        else {
            localStorage.setItem(page + 'page', document.querySelector('wsbody').innerHTML);
        }
        localStorage.setItem(page + 'components', JSON.stringify(window.builtComponents));
        localStorage.setItem(page + 'states', JSON.stringify(window.states));
        localStorage.setItem(page + 'actions', JSON.stringify(window.actions));
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
    },0);
}

async function load() {
    const page = getPage();

    window.builtComponents = {};
    for (let k of Object.keys(defaultBuiltComponents)) {
        window.builtComponents[k] = defaultBuiltComponents[k];
    }
    if (localStorage.getItem(page + 'states')) {
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
                exec: ((stc, local, ...params) => {
                    return make('user-built-component').set('attrs', params).set('componentName', bc).elem;
                })
            };
        }
        window.actions = JSON.parse(localStorage.getItem(page + 'actions'));
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
    }
    else {
        window.states = {};
    }
    drawCanvas();
}