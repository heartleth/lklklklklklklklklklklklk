function titlesmenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    if (edt) {
        let t = new ElementComponent('h' + edt.tagName[1], [
            [':styles', '@#b' + tok + 'Style/val'],
            [':ooonload', '@#b' + tok + 'OnLoad/functor'],
            [':id', '@#b' + tok + 'Id/val'],
            [':class', '@#b' + tok + 'Class/val'],
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
        [':styles', '@#b' + tok + 'Style/val'],
        [':ooonload', '@#b' + tok + 'OnLoad/functor'],
        [':id', '@#b' + tok + 'Id/val'],
        [':class', '@#b' + tok + 'Class/val'],
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
            [':styles', '@#b' + tok + 'Style/val'],
            ['innerHTML', '@#b' + tok + 'Text/val'],
            [':class', '@#b' + tok + 'Class/val'],
            ['#minHeight', '@#b' + tok + 'H/cells'],
            ['#minWidth', '@#b' + tok + 'W/cells'],
            ['#width', 'fit-content'],
            [':id', '@#b' + tok + 'Id/val'],
            [':ooonload', '@#b' + tok + 'OnLoad/functor'],
            ['#fontSize', '@#b' + tok + 'FontSize/val']
        ]);
        let uiedit = make('ui-edit').elem;
        uiedit.name = 'b' + tok;
        uiedit.content = elementPropertySet().concat([
            make('value-input').set('fname', ['Text', 0]).set('defaultText', edt.innerText).elem,
            make('value-input').set('fname', ['FontSize', 1, 'Font Size']).set('defaultText', 16).set('lengthInput', true).elem,
            make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', Math.round(lpx(edt.style.minWidth) / cellSpacing)).elem,
            make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', Math.round(lpx(edt.style.minHeight) / cellSpacing)).elem
        ]);
        let ac = addc(uiedit.addc(), [div], edt);
        uiedit.then = ac;
        addChilds(ws, [wstitle('Paragraph'), ac, uiedit]);
        ac.updateref();
    }
    else {
        let div = new ElementComponent('p', [
            [':styles', '@#b' + tok + 'Style/val'],
            ['innerHTML', '@#b' + tok + 'Text/val'],
            [':class', '@#b' + tok + 'Class/val'],
            ['#minHeight', '@#b' + tok + 'H/cells'],
            ['#minWidth', '@#b' + tok + 'W/cells'],
            ['#width', 'fit-content'],
            [':id', '@#b' + tok + 'Id/val'],
            [':ooonload', '@#b' + tok + 'OnLoad/functor'],
            ['#fontSize', '@#b' + tok + 'FontSize/val']
        ]);
        let uiedit = make('ui-edit').elem;
        uiedit.name = 'b' + tok;
        uiedit.content = elementPropertySet().concat([
            make('value-input').set('fname', ['Text', 0]).set('defaultText', 'SampleText').elem,
            make('value-input').set('fname', ['FontSize', 1, 'Font Size']).set('defaultText', 16).set('lengthInput', true).elem,
            make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', '5').elem,
            make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', '3').elem
        ]);
        let ac = addc(uiedit.addc(), [div]);
        uiedit.then = ac;
        addChilds(ws, [wstitle('Paragraph'), ac, uiedit]);
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
    let t = new ElementComponent('img', [
        [':styles', '@#b' + tok + 'Style/val'],
        [':id', '@#b' + tok + 'Id/val'],
        [':src', '@#b' + tok + 'src/val'],
        [':draggable', 'false'],
        [':ondragover', 'return false;'],
        [':Class', '@#b' + tok + 'Class/val'],
        ['#height', '@#b' + tok + 'H/cells'],
        ['#width', '@#b' + tok + 'W/cells'],
        [':height', '@#b' + tok + 'H/cells'],
        [':width', '@#b' + tok + 'W/cells']
    ]);
    if (edt) {
        return;
    }
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'b' + tok;
    uiedit.content = elementPropertySet().concat([
        make('value-input').set('fname', ['src', 0, 'url']).set('mode', 'Image').set('defaultText', 'https://raw.githubusercontent.com/heartleth/lklklklklklklklklklklklk/main/icon/icon.png').elem,
        make('value-input').set('fname', ['W', 1, 'Width']).set('defaultText', 5).elem,
        make('value-input').set('fname', ['H', 1, 'Height']).set('defaultText', 5).elem
    ]);
    let ac = addc(uiedit.addc(), [t]);
    uiedit.then = ac;
    addChilds(ws, [wstitle('Image'), ac, uiedit]);
    ac.updateref();
}

function listMenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    let t = new ElementComponent((edt ?? {tagName:'@#b' + tok + 'Level/val'}).tagName, [
        [':styles', '@#b' + tok + 'Style/val'],
        [':id', '@#b' + tok + 'Id/val'],
        [':Class', '@#b' + tok + 'Class/val'],
        ['innerHTML', '@#b' + tok + 'Text/val'],
        ['#fontSize', '@#b' + tok + 'FontSize/val']
    ]);
    if (edt) {
        let uiedit = make('ui-edit').elem;
        uiedit.name = 'b' + tok;
        uiedit.content = elementPropertySet().concat([
            make('value-input').set('fname', ['Text', 0]).set('defaultText', edt.innerText).elem,
        ]);
        let ac = addc(uiedit.addc(), [t], edt);
        uiedit.then = ac;
        addChilds(ws, [wstitle('List'), ac, uiedit]);
        ac.updateref();
        return;
    }
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'b' + tok;
    uiedit.content = elementPropertySet().concat([
        make('value-input').set('fname', ['Text', 0]).set('defaultText', 'Item1,Item2').set('listInput', true).set('onlyText', true).elem,
        make('value-input').set('fname', ['FontSize', 1, 'Font Size']).set('defaultText', 16).set('lengthInput', true).elem,
        make('select').set('fname', ['Level', 0, 'List Type']).opts(['ol', 'ul']).elem,
    ]);
    let ac = addc(uiedit.addc(), [t]);
    uiedit.then = ac;
    addChilds(ws, [wstitle('List'), ac, uiedit]);
    ac.updateref();
}

function iframeMenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    if (edt) {
        
        return;
    }
}
