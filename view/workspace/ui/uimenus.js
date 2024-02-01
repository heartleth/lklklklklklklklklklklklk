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
        [':onchange', '@#b' + tok + 'OnChange/functor']
    ]);
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'b' + tok;
    let su;
    if (edt) {
        let actionName = edt.getAttribute('onchange').substring(20).split("'")[0];
        let [content, suu] = elementPropertySet(edt);
        uiedit.content = content.concat([
            make('value-input').set('fname', ['Placeholder', 0]).set('onlyText', true).set('defaultText', edt.getAttribute('placeholder')).elem,
            // make('value-input').set('fname', ['DefaultValue', 0, 'Default Value']).set('defaultText', edt.value).elem,
            make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', Math.round(lpx(edt.style.width) / cellSpacing)).elem,
            make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', Math.round(lpx(edt.style.height) / cellSpacing)).elem,
            make('value-input').set('fname', ['Color', 1]).set('defaultText', edt.style.backgroundColor).elem,
            make('action-input').set('fname', ['OnChange', 0, 'Change Action']).set('actionName', actionName).elem
        ]);
        su = suu;
    }
    else {
        let [content, suu] = elementPropertySet();
        uiedit.content = content.concat([
            make('value-input').set('fname', ['Placeholder', 0]).set('onlyText', true).elem,
            // make('value-input').set('fname', ['DefaultValue', 0, 'Default Value']).elem,
            make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', 5).elem,
            make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', 1).elem,
            make('value-input').set('fname', ['Color', 1]).set('defaultText', 'white').elem,
            make('checkbox-options').set('fname', ['Style', 1, 'Box Style']).set('options', boxStyleOptions).elem,
            make('action-input').set('fname', ['OnChange', 0, 'Change Action']).elem
        ]);
        su = suu;
    }
    let ac = addc(uiedit.addc(), [bt], edt);
    uiedit.then = ac;
    uiedit.propagateState(su, bt.updates);
    addChilds(ws, [wstitle('Text Field'), ac, uiedit]);
    ac.updateref();
}