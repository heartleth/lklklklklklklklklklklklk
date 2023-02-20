const boxStyleOptions = [
    'shadow',
    'round',
    'thick-outline',
    'outlineless',
    'center'
];

function boxmenu(ws) {
    let div = new ElementComponent('div', [
        ['#background-color', '@#boxColor/val'],
        [':class', '@#boxClass/val'],
        ['#minHeight', '@#boxH/cells'],
        ['#minWidth', '@#boxW/cells'],
        ['#width', 'fit-content'],
        [':id', '@#boxId/val'],
        [':boxStyle', '@#boxStyle/val']
    ]);
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'box';
    uiedit.content = [
        make('value-input').set('fname', ['Id', 2, 'ID']).set('defaultText', '').set('onlyText', true).elem,
        make('value-input').set('fname', ['Class', 2]).set('defaultText', '').set('onlyText', true).elem,
        make('value-input').set('fname', ['Color', 1]).set('defaultText', 'white').elem,
        make('checkbox-options').set('fname', ['Style', 1, 'Box Style']).set('options', boxStyleOptions).elem,
        make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', '5').elem,
        make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', '3').elem
    ];
    let ac = addc(uiedit.addc(), [div]);
    uiedit.then = ac;
    addChilds(ws, [wstitle('Box'), ac, uiedit]);
    ac.updateref();
}