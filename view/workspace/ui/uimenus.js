// function uiMenus(ui, ws) {
//     if (!ws.parentElement.style.height) {
//         ws.parentElement.style.top = '100px';
//         ws.parentElement.style.height = '300px';
//         ws.parentElement.style.width = '190px';
//         ws.parentElement.style.left = '20px';
//     }
    
//     for (let df of Object.keys(defaultBuiltComponents)) {
//         let t = wstitle(df);
//         t.style.position = 'absolute';
//         ws.appendChild(t);
//         ws.classList.add('functionEdit');
//         let comp = defaultBuiltComponents[df];
        
//         let actionId = df;
//         if (!window.actions[actionId]) {
//             window.actions[actionId] = {};
//             for (let attr of comp.attributes) {
//                 window.actions[actionId][attr] = {code:[{name: 'return', params: [""]}]};
//             }
//         }
//         ws.appendChild(make('function-edit-window').attr('actionName', actionId).elem);
//         return;
//     }
// }

function inputMenu(ws) {
    let bt = new ElementComponent('input', [
        [':id', '@#inputId/val'],
        [':class', '@#inputClass/val'],
        ['#height', '@#inputH/cells'],
        ['#width', '@#inputW/cells'],
        [':placeholder', '@#inputPlaceHolder/val'],
        [':type', '@#inputType/value'],
        ['value', '@#inputDefaultValue/val']
    ]);
    let ac = addc(['#inputType', '#inputClass', '#inputH', '#inputW', '#inputId', '#inputPlaceHolder', '#inputDefaultValue'], [bt]);
    
    addChilds(ws, [
        wstitle('Text Field'),
        ac,

        wse.label('Type').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('select').set('then', ac).opts(['text', 'password', 'email', 'number', 'checkbox', 'date']).setId('inputType').elem,
        wse.br(),
        
        wse.label('ID').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).setId('inputId').set('onlyText', true).elem,

        wse.label('Placeholder').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).setId('inputPlaceHolder').set('onlyText', true).elem,

        wse.label('Default Value').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).setId('inputDefaultValue').elem,

        wse.label('Class').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).setId('inputClass').set('onlyText', true).elem,

        wse.label('Height').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).setId('inputH').set('defaultText', 1).elem,

        wse.label('Width').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).setId('inputW').set('defaultText', 5).elem,
        
        // wse.label('Padding').elem,
        // make('show-hide-button').elem,
        // wse.br(),
        // make('value-input').set('then', ac).set('lengthInput', true).setId('buttonPadding').set('defaultText', '2').elem,
    ]);
    ac.updateref();
}