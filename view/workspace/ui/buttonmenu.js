function buttonMenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    if (edt) {
        let bt = new ElementComponent('button', [
            ['#background-color', '@#buttonColor'.replace('button', 'b' + tok)],
            ['#minHeight', '@#buttonH/cells'.replace('button', 'b' + tok)],
            ['#minWidth', '@#buttonW/cells'.replace('button', 'b' + tok)],
            [':onclick', '@#buttonOnClick/functor'.replace('button', 'b' + tok)],
            ['innerHTML', '@#buttonText/val'.replace('button', 'b' + tok)],
            [':class', '@#buttonClass/val'.replace('button', 'b' + tok)],
            [':id', '@#buttonId/val'.replace('button', 'b' + tok)],
            [':boxStyle', '@#buttonStyle/val'.replace('button', 'b' + tok)]
        ]);
        let uiedit = make('ui-edit').elem;
        uiedit.name = 'b' + tok;
        let actionName = edt.getAttribute('onclick').substring(20).split("'")[0]
        uiedit.content = [
            make('value-input').set('fname', ['Text', 0]).set('defaultText', edt.innerText).elem,
            make('action-input').set('fname', ['OnClick', 0, 'Click Action']).set('actionName', actionName).elem,
            make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', Math.round(lpx(edt.style.minWidth) / cellSpacing)).elem,
            make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', Math.round(lpx(edt.style.minHeight) / cellSpacing)).elem,
            make('value-input').set('fname', ['Color', 1]).set('defaultText', edt.style.backgroundColor).elem,
            make('checkbox-options').set('fname', ['Style', 1, 'Box Style']).set('optdf', edt.getAttribute('boxStyle')).set('options', boxStyleOptions).elem,
            make('value-input').set('fname', ['Id', 2, 'ID']).set('onlyText', true).set('defaultText', edt.id).elem,
            make('value-input').set('fname', ['Class', 2]).set('onlyText', true).set('defaultText', edt.getAttribute('class').replace('natural', '')).elem
        ];
        let ac = addc(uiedit.addc(), [bt], edt);
        uiedit.then = ac;
    
        addChilds(ws, [wstitle('Button'), ac, uiedit]);
        ac.updateref();
        return;
    }
    
    let bt = new ElementComponent('button', [
        ['#background-color', '@#buttonColor'.replace('button', 'b' + tok)],
        ['#minHeight', '@#buttonH/cells'.replace('button', 'b' + tok)],
        ['#minWidth', '@#buttonW/cells'.replace('button', 'b' + tok)],
        [':onclick', '@#buttonOnClick/functor'.replace('button', 'b' + tok)],
        ['innerHTML', '@#buttonText/val'.replace('button', 'b' + tok)],
        [':class', '@#buttonClass/val'.replace('button', 'b' + tok)],
        [':id', '@#buttonId/val'.replace('button', 'b' + tok)],
        [':boxStyle', '@#buttonStyle/val'.replace('button', 'b' + tok)]
    ]);
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'b' + tok;
    uiedit.content = [
        make('value-input').set('fname', ['Text', 0]).set('defaultText', 'Click!').elem,
        make('action-input').set('fname', ['OnClick', 0, 'Click Action']).elem,
        make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', 2).elem,
        make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', 1).elem,
        make('value-input').set('fname', ['Color', 1]).set('defaultText', 'white').elem,
        make('checkbox-options').set('fname', ['Style', 1, 'Box Style']).set('options', boxStyleOptions).elem,
        make('value-input').set('fname', ['Id', 2, 'ID']).set('onlyText', true).elem,
        make('value-input').set('fname', ['Class', 2]).set('onlyText', true).elem
    ];
    let ac = addc(uiedit.addc(), [bt]);
    uiedit.then = ac;

    addChilds(ws, [wstitle('Button'), ac, uiedit]);
    ac.updateref();
}