function buttonMenu(ws) {
    let bt = new ElementComponent('button', [
        ['#background-color', '@#buttonColor'],
        ['#minHeight', '@#buttonH/cells'],
        ['#minWidth', '@#buttonW/cells'],
        [':onclick', '@#buttonOnClick/functor'],
        ['innerHTML', '@#buttonText/val'],
        [':class', '@#buttonClass/val'],
        [':id', '@#buttonId/val'],
        [':boxStyle', '@#buttonStyle/val']
    ]);
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'button';
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