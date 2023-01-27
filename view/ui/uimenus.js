function uiMenus(ui, ws) {
    if (!ws.parentElement.style.height) {
        ws.parentElement.style.top = '100px';
        ws.parentElement.style.height = '300px';
        ws.parentElement.style.width = '190px';
        ws.parentElement.style.left = '20px';
    }
    
    for (let df of Object.keys(defaultBuiltComponents)) {
        let t = wstitle(df);
        t.style.position = 'absolute';
        ws.appendChild(t);
        ws.classList.add('functionEdit');
        let comp = defaultBuiltComponents[df];
        
        let actionId = df;
        if (!window.actions[actionId]) {
            window.actions[actionId] = {};
            for (let attr of comp.attributes) {
                window.actions[actionId][attr] = {code:[{name: 'return', params: [""]}]};
            }
        }
        ws.appendChild(make('function-edit-window').attr('actionName', actionId).elem);
        return;
    }
}