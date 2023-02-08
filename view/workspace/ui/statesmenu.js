function statesmenu(ws) {
    addChilds(ws, [
        wstitle('States'),
        make('value-input').set('mode', 'State').set('defaultText', 50).set('onlyState', true).elem
    ]);
    return;
}