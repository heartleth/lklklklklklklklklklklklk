function titlesmenu(ws) {
    let t = new ElementComponent('@#titleLevel/value', [
        ['innerHTML', '@#titleText/val']
    ]);
    let ac = addc(['#titleText', '#titleLevel', '#titleUseStates'], [t]);
    
    addChilds(ws, [
        wstitle('Title Texts'),
        ac,
        wse.label('Text').elem,
        make('value-input').setId('titleText').set('then', ac).set('defaultText', 'Index').elem,
        wse.label('Title Size').elem,
        wse.br(),
        make('select').setId('titleLevel').set().opts(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).elem
    ]);
    ac.updateref();
}