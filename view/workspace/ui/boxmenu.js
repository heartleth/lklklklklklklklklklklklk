const boxStyleOptions = [
    'shadow',
    'round',
    'thick-outline',
    'outlineless',
    'center-box'
];

function boxmenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    if (edt) {
        let div = new ElementComponent('div', [
            ['#background-color', '@#b' + tok + 'Color/val'],
            [':class', '@#b' + tok + 'Class/val'],
            ['#minHeight', '@#b' + tok + 'H/cells'],
            ['#minWidth', '@#b' + tok + 'W/cells'],
            ['#width', 'fit-content'],
            [':id', '@#b' + tok + 'Id/val'],
            [':boxStyle', '@#b' + tok + 'Style/val']
        ]);
        let uiedit = make('ui-edit').elem;
        uiedit.name = 'b' + tok;
        uiedit.content = elementPropertySet().concat([
            make('value-input').set('fname', ['Color', 1]).set('defaultText', edt.style.backgroundColor).elem,
            make('checkbox-options').set('fname', ['Style', 1, 'Box Style']).set('optdf', edt.getAttribute('boxStyle')).set('options', boxStyleOptions).elem,
            make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', Math.round(lpx(edt.style.minWidth) / cellSpacing)).elem,
            make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', Math.round(lpx(edt.style.minHeight) / cellSpacing)).elem
        ]);
        let ac = addc(uiedit.addc(), [div], edt);
        uiedit.then = ac;
        addChilds(ws, [wstitle('Box'), ac, uiedit]);
        ac.updateref();
    }
    else {
        let div = new ElementComponent('div', [
            ['#background-color', '@#b' + tok + 'Color/val'],
            [':class', '@#b' + tok + 'Class/val'],
            ['#minHeight', '@#b' + tok + 'H/cells'],
            ['#minWidth', '@#b' + tok + 'W/cells'],
            ['#width', 'fit-content'],
            [':id', '@#b' + tok + 'Id/val'],
            [':boxStyle', '@#b' + tok + 'Style/val']
        ]);
        let uiedit = make('ui-edit').elem;
        uiedit.name = 'b' + tok;
        uiedit.content = elementPropertySet().concat([
            make('value-input').set('fname', ['Color', 1]).set('defaultText', 'white').elem,
            make('checkbox-options').set('fname', ['Style', 1, 'Box Style']).set('options', boxStyleOptions).elem,
            make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', '5').elem,
            make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', '3').elem
        ]);
        let ac = addc(uiedit.addc(), [div]);
        uiedit.then = ac;
        addChilds(ws, [wstitle('Box'), ac, uiedit]);
        ac.updateref();
    }
}