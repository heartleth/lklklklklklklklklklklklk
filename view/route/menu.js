function routeMenu(ws) {
    addChilds(ws, [
        wstitle('Route'),
        make('line').elem
    ]);
    let route = localStorage.getItem('route');
    if (!route || route.length == 0) {
        localStorage.setItem('route', '/');
        route = '/';
    }
    for (const link of route.split(',')) {
        let a = document.createElement('a');
        a.onclick = () => blockmap.Href.exec([], '', link);
        a.innerHTML = link;
        ws.appendChild(a);
        ws.appendChild(wse.br());
    }
    let newRoute = make('text').elem;
    let newRouteButton = make('button').text('Create Page').elem;
    newRouteButton.addEventListener('click', () => {
        localStorage.setItem('route', route+',/'+newRoute.value);
    });
    ws.appendChild(newRoute);
    ws.appendChild(wse.br());
    ws.appendChild(newRouteButton);
}
