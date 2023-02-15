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

const inputTypes = [
    'text',
    'password',
    'email',
    'number',
    'checkbox',
    'date'
];

function inputMenu(ws) {
    let bt = new ElementComponent('input', [
        [':id', '@#inputId/val'],
        [':class', '@#inputClass/val'],
        ['#height', '@#inputH/cells'],
        ['#width', '@#inputW/cells'],
        [':placeholder', '@#inputPlaceholder/val'],
        [':type', '@#inputType/value'],
        ['value', '@#inputDefaultValue/val']
    ]);
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'input';
    uiedit.content = [
        make('select').set('fname', ['Type', 0]).opts(inputTypes).elem,
        make('value-input').set('fname', ['Placeholder', 0]).set('onlyText', true).elem,
        make('value-input').set('fname', ['DefaultValue', 0, 'Default Value']).elem,
        make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', 5).elem,
        make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', 1).elem,
        make('value-input').set('fname', ['Id', 2, 'ID']).set('onlyText', true).elem,
        make('value-input').set('fname', ['Class', 2]).set('onlyText', true).elem
    ];
    let ac = addc(uiedit.addc(), [bt]);
    uiedit.then = ac;
    addChilds(ws, [wstitle('Text Field'), ac, uiedit]);
    ac.updateref();
}