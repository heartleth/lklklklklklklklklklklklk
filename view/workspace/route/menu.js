function clearPath(path) {
    if (path.length <= 1) return '';
    let pp = path.replace(/\/+/g, '/');
    if (pp[pp.length - 1] == '/') {
        return pp.substring(0, pp.length - 1);
    }
    return pp;
}

function routeMenu(ws) {
    ws.refresh = () => {
        ws.innerHTML = '';
        addChilds(ws, [
            wstitle('Route'),
            make('line').elem
        ]);
        let route = localStorage.getItem('route');
        if (!route) {
            localStorage.setItem('route', '');
            route = '/';
        }
        let pages = [...route.split(',')].map(clearPath);
        pages.sort((a, b) => a.length - b.length);
        let visit = [];
        function getRouteTree(pages, from = '') {
            visit.push(from);
            let res = [];
            for (const page of pages) {
                if (visit.includes(page)) {
                    continue;
                }
                if (page.startsWith(from)) {
                    if (page[from.length] == '/') {
                        res.push({ page, childs: getRouteTree(pages, page) });
                    }
                }
            }
            return res;
        }
        let tree = { page: '/', childs: getRouteTree(pages) };
        let rn = document.createElement('route-node');
        rn.tree = tree;
        rn.ws = ws;
        ws.appendChild(rn);
        // ws.innerHTML += JSON.stringify(tree);
        // for (const link of route.split(',')) {
        //     let a = document.createElement('a');
        //     a.onclick = () => blockmap.Href.exec([], '', link);
        //     a.innerHTML = clearPath('/' + link);
        //     ws.appendChild(a);
        //     ws.appendChild(wse.br());
        // }
        let newRoute = make('text').elem;
        let newRouteButton = make('button').text('Create Page').elem;
        newRouteButton.addEventListener('click', () => {
            if (!pages.includes(newRoute.value) && newRoute.value[0] == '/') {
                localStorage.setItem('route', route+','+newRoute.value);
                ws.refresh();
            }
        });
        ws.appendChild(wse.br());
        ws.appendChild(newRoute);
        ws.appendChild(wse.br());
        ws.appendChild(newRouteButton);
    };
    ws.refresh();
}

// function routeMenu(ws) {
//     addChilds(ws, [
//         wstitle('Route'),
//         make('line').elem
//     ]);
//     let route = localStorage.getItem('route');
//     if (!route) {
//         localStorage.setItem('route', '');
//         route = '';
//     }
//     for (const link of route.split(',')) {
//         let a = document.createElement('a');
//         a.onclick = () => blockmap.Href.exec([], '', link);
//         a.innerHTML = clearPath('/' + link);
//         ws.appendChild(a);
//         ws.appendChild(wse.br());
//     }
//     let newRoute = make('text').elem;
//     let newRouteButton = make('button').text('Create Page').elem;
//     newRouteButton.addEventListener('click', () => {
//         localStorage.setItem('route', route+','+newRoute.value);
//     });
//     ws.appendChild(newRoute);
//     ws.appendChild(wse.br());
//     ws.appendChild(newRouteButton);
// }


class RouteNode extends HTMLElement {
    connectedCallback() {
        console.log(this.tree);
        let ppath = this.tree.page;
        if (ppath == '/') {
            this.rpath = make('input').attr('readonly', '').addClass('routenode').attr('type', 'text').attr('value', ppath).elem;
        }
        else {
            this.rpath = make('input').addClass('routenode').attr('type', 'text').attr('value', ppath).elem;
        }
        this.rpath.addEventListener('change', (e) => {
            this.tree.page = this.rpath.value;
            this.ws.refresh();
        });
        this.appendChild(this.rpath);
        this.goto = document.createElement('button');
        this.goto.innerHTML = '#';
        this.goto.onclick = () => blockmap.Href.exec([], '', ppath);
        this.appendChild(this.goto);
        if (this.tree.childs.length) {
            let dv = document.createElement('div');
            dv.style.marginLeft = '4px';
            for (const child of this.tree.childs) {
                let rn = document.createElement('route-node');
                rn.ws = this.ws;
                rn.tree = child;
                dv.appendChild(rn);
            }
            let shb = document.createElement('show-hide-button');
            shb.setAttribute('div', true);
            this.appendChild(shb);
            this.appendChild(wse.br());
            this.appendChild(dv);
        }
    }
}
window.customElements.define('route-node', RouteNode);