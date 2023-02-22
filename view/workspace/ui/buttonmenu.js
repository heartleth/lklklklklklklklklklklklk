function buttonMenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    if (edt) {
        let bt = new ElementComponent('button', [
            ['#background-color', '@#b' + tok + 'Color/val'],
            ['#minHeight', '@#b' + tok + 'H/cells'],
            ['#minWidth', '@#b' + tok + 'W/cells'],
            [':onclick', '@#b' + tok + 'OnClick/functor'],
            [':onload', '@#b' + tok + 'OnLoad/functor'],
            ['innerHTML', '@#b' + tok + 'Text/val'],
            [':class', '@#b' + tok + 'Class/val'],
            [':id', '@#b' + tok + 'Id/val'],
            [':boxStyle', '@#b' + tok + 'Style/val']
        ]);
        let uiedit = make('ui-edit').elem;
        uiedit.name = 'b' + tok;
        let actionName = edt.getAttribute('onclick').substring(20).split("'")[0]
        uiedit.content = elementPropertySet().concat([
            make('value-input').set('fname', ['Text', 0]).set('defaultText', edt.innerText).elem,
            make('action-input').set('fname', ['OnClick', 0, 'Click Action']).set('actionName', actionName).elem,
            make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', Math.round(lpx(edt.style.minWidth) / cellSpacing)).elem,
            make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', Math.round(lpx(edt.style.minHeight) / cellSpacing)).elem,
            make('value-input').set('fname', ['Color', 1]).set('defaultText', edt.style.backgroundColor).elem,
            make('checkbox-options').set('fname', ['Style', 1, 'Box Style']).set('optdf', edt.getAttribute('boxStyle')).set('options', boxStyleOptions).elem,
        ]);
        let ac = addc(uiedit.addc(), [bt], edt);
        uiedit.then = ac;
    
        addChilds(ws, [wstitle('Button'), ac, uiedit]);
        ac.updateref();
        return;
    }
    
    let bt = new ElementComponent('button', [
        ['#background-color', '@#b' + tok + 'Color/val'],
        ['#minHeight', '@#b' + tok + 'H/cells'],
        ['#minWidth', '@#b' + tok + 'W/cells'],
        [':onclick', '@#b' + tok + 'OnClick/functor'],
        [':onload', '@#b' + tok + 'OnLoad/functor'],
        ['innerHTML', '@#b' + tok + 'Text/val'],
        [':class', '@#b' + tok + 'Class/val'],
        [':id', '@#b' + tok + 'Id/val'],
        [':boxStyle', '@#b' + tok + 'Style/val']
    ]);
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'b' + tok;
    uiedit.content = elementPropertySet().concat([
        make('value-input').set('fname', ['Text', 0]).set('defaultText', 'Click!').elem,
        make('action-input').set('fname', ['OnClick', 0, 'Click Action']).elem,
        make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', 2).elem,
        make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', 1).elem,
        make('value-input').set('fname', ['Color', 1]).set('defaultText', 'white').elem,
        make('checkbox-options').set('fname', ['Style', 1, 'Box Style']).set('options', boxStyleOptions).elem,
    ]);
    let ac = addc(uiedit.addc(), [bt]);
    uiedit.then = ac;

    addChilds(ws, [wstitle('Button'), ac, uiedit]);
    ac.updateref();
}