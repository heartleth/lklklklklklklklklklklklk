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

function inputMenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    let bt = new ElementComponent('textarea', [
        [':styles', '@#b' + tok + 'Style/val'],
        [':id', '@#b' + tok + 'Id/val'],
        [':class', '@#b' + tok + 'Class/val'],
        ['#height', '@#b' + tok + 'H/cells'],
        [':cols', '@#b' + tok + 'H/val'],
        ['#width', '@#b' + tok + 'W/cells'],
        [':placeholder', '@#b' + tok + 'Placeholder/val'],
        // [':type', '@#b' + tok + 'Type/value'],
        ['#backgroundColor', '@#b' + tok + 'Color/val'],
        // ['value', '@#b' + tok + 'DefaultValue/val'],
        [':boxStyle', '@#b' + tok + 'Style/val'],
        [':onload', '@#b' + tok + 'OnLoad/functor']
    ]);
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'b' + tok;
    if (edt) {
        uiedit.content = elementPropertySet(edt).concat([
            make('value-input').set('fname', ['Placeholder', 0]).set('onlyText', true).set('defaultText', edt.getAttribute('placeholder')).elem,
            // make('value-input').set('fname', ['DefaultValue', 0, 'Default Value']).set('defaultText', edt.value).elem,
            make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', Math.round(lpx(edt.style.width) / cellSpacing)).elem,
            make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', Math.round(lpx(edt.style.height) / cellSpacing)).elem,
            make('value-input').set('fname', ['Color', 1]).set('defaultText', edt.style.backgroundColor).elem,
            make('checkbox-options').set('fname', ['Style', 1, 'Box Style']).set('optdf', edt.getAttribute('boxStyle')).set('options', boxStyleOptions).elem,
        ]);
    }
    else {
        uiedit.content = elementPropertySet().concat([
            make('value-input').set('fname', ['Placeholder', 0]).set('onlyText', true).elem,
            // make('value-input').set('fname', ['DefaultValue', 0, 'Default Value']).elem,
            make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', 5).elem,
            make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', 1).elem,
            make('value-input').set('fname', ['Color', 1]).set('defaultText', 'white').elem,
            make('checkbox-options').set('fname', ['Style', 1, 'Box Style']).set('options', boxStyleOptions).elem,
        ]);
    }
    let ac = addc(uiedit.addc(), [bt], edt);
    uiedit.then = ac;
    addChilds(ws, [wstitle('Text Field'), ac, uiedit]);
    ac.updateref();
}