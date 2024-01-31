function buttonMenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    let bt = new ElementComponent('button', [
        ['#background-color', '@#b' + tok + 'Color/val'],
        ['#minHeight', '@#b' + tok + 'H/cells'],
        ['#minWidth', '@#b' + tok + 'W/cells'],
        [':onclick', '@#b' + tok + 'OnClick/functor'],
        [':ooonload', '@#b' + tok + 'OnLoad/functor'],
        ['innerHTML', '@#b' + tok + 'Text/val'],
        [':class', '@#b' + tok + 'Class/val'],
        [':id', '@#b' + tok + 'Id/val'],
        [':styles', '@#b' + tok + 'Style/val'],
        ['#fontSize', '@#b' + tok + 'FontSize/val']
    ]);
    let es = {};
    if (edt) {
        es.minWidth =  Math.round(lpx(edt.style.minWidth) / cellSpacing);
        es.minHeight =  Math.round(lpx(edt.style.minHeight) / cellSpacing);
        es.backgroundColor = edt.style.backgroundColor;
        es.bs = edt.getAttribute('boxStyle');
        // edt.style.fontSize;
        es.it = edt.innerText;
        es.actionName = edt.getAttribute('onclick').substring(20).split("'")[0]
    }
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'b' + tok;
    let [content, su] = elementPropertySet(edt);
    uiedit.content = content.concat([
        make('value-input').set('fname', ['Text', 0]).dtxt(es.it ?? 'Click!').elem,
        make('value-input').set('fname', ['FontSize', 1, 'Font Size']).dtxt(16).set('lengthInput', true).elem,
        make('action-input').set('fname', ['OnClick', 0, 'Click Action']).set('actionName', es.actionName).elem,
        make('value-input').set('fname', ['W', 1, 'Width']).dtxt(es.minWidth ?? '2').elem,
        make('value-input').set('fname', ['H', 1, 'Height']).dtxt(es.minHeight ?? '1').elem,
        make('value-input').set('fname', ['Color', 1]).dtxt(es.backgroundColor).elem
    ]);
    let ac = addc(uiedit.addc(), [bt], edt);
    uiedit.then = ac;
    uiedit.propagateState(su, bt.updates);
    addChilds(ws, [wstitle('Button'), ac, uiedit]);
    ac.updateref();
    return;
}