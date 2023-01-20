function buttonMenu(ws) {
    let bt = new ElementComponent('button', [
        ['#background-color', '@#buttonColor/val'],
        ['#padding', '@#buttonPadding/val'],
        [':onclick', '@#buttonOnClick/functor'],
        ['innerHTML', '@#buttonText/val']
    ]);
    let ac = addc(['#buttonText', '#buttonColor', '#buttonPadding', '#buttonOnClick'], [bt]);
    
    addChilds(ws, [
        wstitle('Button'),
        ac,
        make('label').text('Text').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).set('defaultText', 'Click!').setId('buttonText').elem,
        make('label').text('On Click').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('action-input').set('then', ac).setId('buttonOnClick').set('defaultText', 'state = parseInt(state) + 1').set('mode', 'Value').elem,
        wse.label('Color').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).setId('buttonColor').set('defaultText', 'white').elem,
        wse.label('Padding').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).set('lengthInput', true).setId('buttonPadding').set('defaultText', '2').elem,
    ]);
    ac.updateref();
}