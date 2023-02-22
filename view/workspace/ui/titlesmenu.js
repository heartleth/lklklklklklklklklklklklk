function titlesmenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    if (edt) {
        let t = new ElementComponent('h' + edt.tagName[1], [
            [':onload', '@#b' + tok + 'OnLoad/functor'],
            ['innerHTML', '@#b' + tok + 'Text/val']
        ]);
        let uiedit = make('ui-edit').elem;
        uiedit.name = 'b' + tok;
        uiedit.content = elementPropertySet().concat([
            make('value-input').set('fname', ['Text', 0]).set('defaultText', edt.innerText).elem,
        ]);
        let ac = addc(uiedit.addc(), [t], edt);
        uiedit.then = ac;
        addChilds(ws, [wstitle('Title Texts'), ac, uiedit]);
        ac.updateref();
        return;
    }
    let t = new ElementComponent('@#titleLevel/value', [
        [':onload', '@#b' + tok + 'OnLoad/functor'],
        ['innerHTML', '@#b' + tok + 'Text/val']
    ]);
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'b' + tok;
    uiedit.content = elementPropertySet().concat([
        make('value-input').set('fname', ['Text', 0]).set('defaultText', 'Title').elem,
        make('select').set('fname', ['Level', 1, 'Title Size']).opts(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).elem,
    ]);
    let ac = addc(uiedit.addc(), [t]);
    uiedit.then = ac;
    addChilds(ws, [wstitle('Title Texts'), ac, uiedit]);
    ac.updateref();
}

function paragraphMenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    if (edt) {
        let div = new ElementComponent('p', [
            ['innerHTML', '@#b' + tok + 'Text/val'],
            [':class', '@#b' + tok + 'Class/val'],
            ['#minHeight', '@#b' + tok + 'H/cells'],
            ['#minWidth', '@#b' + tok + 'W/cells'],
            ['#width', 'fit-content'],
            [':id', '@#b' + tok + 'Id/val'],
            [':onload', '@#b' + tok + 'OnLoad/functor'],
        ]);
        let uiedit = make('ui-edit').elem;
        uiedit.name = 'b' + tok;
        uiedit.content = elementPropertySet().concat([
            make('value-input').set('fname', ['Text', 0]).set('defaultText', edt.innerText).elem,
            make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', Math.round(lpx(edt.style.minWidth) / cellSpacing)).elem,
            make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', Math.round(lpx(edt.style.minHeight) / cellSpacing)).elem
        ]);
        let ac = addc(uiedit.addc(), [div], edt);
        uiedit.then = ac;
        addChilds(ws, [wstitle('Box'), ac, uiedit]);
        ac.updateref();
    }
    else {
        let div = new ElementComponent('p', [
            ['innerHTML', '@#b' + tok + 'Text/val'],
            [':class', '@#b' + tok + 'Class/val'],
            ['#minHeight', '@#b' + tok + 'H/cells'],
            ['#minWidth', '@#b' + tok + 'W/cells'],
            ['#width', 'fit-content'],
            [':id', '@#b' + tok + 'Id/val'],
            [':onload', '@#b' + tok + 'OnLoad/functor'],
        ]);
        let uiedit = make('ui-edit').elem;
        uiedit.name = 'b' + tok;
        uiedit.content = elementPropertySet().concat([
            make('value-input').set('fname', ['Text', 0]).set('defaultText', 'SampleText').elem,
            make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', '5').elem,
            make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', '3').elem
        ]);
        let ac = addc(uiedit.addc(), [div]);
        uiedit.then = ac;
        addChilds(ws, [wstitle('Box'), ac, uiedit]);
        ac.updateref();
    }
}

function formMenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    if (edt) {
        
        return;
    }
}

function imageMenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    if (edt) {
        
        return;
    }
}

function listMenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    if (edt) {
        
        return;
    }
}

function iframeMenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    if (edt) {
        
        return;
    }
}
