function boxmenu(ws) {
    let div = new ElementComponent('div', [
        ['#background-color', '@#boxColor/val'],
        // ['#min-height', '@#boxMinHeight/val'],
        // ['#padding', '@#boxPadding/val'],
        // ['#margin', '@#boxMargin/val'],
        [':class', '@#boxClass/val'],
        // ['#height', 'fit-content'],
        ['#minHeight', '@#boxH/cells'],
        ['#minWidth', '@#boxW/cells'],
        ['#width', 'fit-content'],
        [':id', '@#boxId/val']
    ]);
    // let ac = addc(['#boxColor', '#boxMinHeight', '#boxMargin', '#boxId', '#boxClass'], [div]);
    let ac = addc(['#boxColor', '#boxW', '#boxH', '#boxId', '#boxClass'], [div]);
    addChilds(ws, [
        wstitle('Box'),
        ac,
        wse.label('ID').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).setId('boxId').set('defaultText', '').elem,
        wse.label('Class').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).setId('boxClass').set('defaultText', '').elem,
        wse.label('Color').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').setId('boxColor').set('defaultText', 'white').elem,
        wse.label('Width').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').setId('boxW').set('defaultText', '5').elem,
        wse.label('Height').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').setId('boxH').set('defaultText', '3').elem,
        // wse.label('Min Height').elem,
        // make('show-hide-button').elem,
        // wse.br(),
        // make('value-input').set('then', ac).set('lengthInput', true).setId('boxMinHeight').set('defaultText', 50).elem,
        // wse.label('Margin').elem,
        // make('show-hide-button').elem,
        // wse.br(),
        // make('value-input').set('then', ac).set('lengthInput', true).setId('boxMargin').set('defaultText', 8).elem,
        // wse.label('Padding').elem,
        // make('show-hide-button').elem,
        // wse.br(),
        // make('value-input').set('then', ac).set('lengthInput', true).setId('boxPadding').set('defaultText', 4).elem
    ]);
    ac.updateref();
}