function titlesmenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    if (edt) {
        let t = new ElementComponent('h' + edt.tagName[1], [
            ['innerHTML', '@#b' + tok + 'Text/val']
        ]);
        let uiedit = make('ui-edit').elem;
        uiedit.name = 'b' + tok;
        uiedit.content = [
            make('value-input').set('fname', ['Text', 0]).set('defaultText', edt.innerText).elem,
            make('value-input').set('fname', ['Id', 2, 'ID']).set('onlyText', edt.id).elem,
            make('value-input').set('fname', ['Class', 2]).set('onlyText', edt.getAttribute('class').replace('natural', '')).elem
        ];
        let ac = addc(uiedit.addc(), [t], edt);
        uiedit.then = ac;
        addChilds(ws, [wstitle('Title Texts'), ac, uiedit]);
        ac.updateref();
        return;
    }
    let t = new ElementComponent('@#titleLevel/value', [
        ['innerHTML', '@#titleText/val']
    ]);
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'title';
    uiedit.content = [
        make('value-input').set('fname', ['Text', 0]).set('defaultText', 'Title').elem,
        make('select').set('fname', ['Level', 1, 'Title Size']).opts(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).elem,
        make('value-input').set('fname', ['Id', 2, 'ID']).set('onlyText', true).elem,
        make('value-input').set('fname', ['Class', 2]).set('onlyText', true).elem   
    ];
    let ac = addc(uiedit.addc(), [t]);
    uiedit.then = ac;
    addChilds(ws, [wstitle('Title Texts'), ac, uiedit]);
    ac.updateref();
}