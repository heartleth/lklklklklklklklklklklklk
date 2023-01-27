function buttonMenu(ws) {
    let bt = new ElementComponent('button', [
        ['#background-color', '@#buttonColor'],
        ['#minHeight', '@#buttonH/cells'],
        ['#minWidth', '@#buttonW/cells'],
        [':onclick', '@#buttonOnClick/functor'],
        ['innerHTML', '@#buttonText/val']
    ]);
    let ac = addc(['#buttonText', '#buttonColor', '#buttonH', '#buttonW', '#buttonOnClick'], [bt]);
    
    addChilds(ws, [
        wstitle('Button'),
        ac,
        make('label').text('Text').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).set('defaultText', 'Click!').setId('buttonText').elem,
        
        wse.label('On Click').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('action-input').set('then', ac).setId('buttonOnClick').set('defaultText', 'state = parseInt(state) + 1').set('mode', 'Value').elem,

        wse.label('Width').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).setId('buttonW').set('defaultText', 2).elem,

        wse.label('Height').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).setId('buttonH').set('defaultText', 1).elem,
        
        wse.label('Color').elem,
        make('show-hide-button').elem,
        wse.br(),
        make('value-input').set('then', ac).setId('buttonColor').set('defaultText', 'white').elem,
        
        // wse.label('Padding').elem,
        // make('show-hide-button').elem,
        // wse.br(),
        // make('value-input').set('then', ac).set('lengthInput', true).setId('buttonPadding').set('defaultText', '2').elem,
    ]);
    ac.updateref();
}