const boxStyleOptions = [
    'shadow',
    'round',
    'thick-outline',
    'outlineless',
    'center-box'
];

function boxmenu(ws, edt) {
    let tok = Math.floor(1000 * Math.random());
    let div = new ElementComponent('div', [
        ['#background-color', '@#b' + tok + 'Color/val'],
        [':class', '@#b' + tok + 'Class/val'],
        ['#minHeight', '@#b' + tok + 'H/cells'],
        ['#minWidth', '@#b' + tok + 'W/cells'],
        ['#width', 'fit-content'],
        [':id', '@#b' + tok + 'Id/val'],
        [':ooonload', '@#b' + tok + 'OnLoad/functor'],
        [':styles', '@#b' + tok + 'Style/val']
    ]);
    let uiedit = make('ui-edit').elem;
    uiedit.name = 'b' + tok;
    let es = {};
    if (edt) {
        es.backgroundColor = edt.style.backgroundColor;
        es.minWidth = Math.round(lpx(edt.style.minWidth) / cellSpacing);
        es.minHeight = Math.round(lpx(edt.style.minHeight) / cellSpacing);
        es.bs = edt.getAttribute('boxStyle');
    }
    let [content, su] = elementPropertySet(edt);
    uiedit.content = content.concat([
        make('value-input').set('fname', ['Color', 1]).dtxt(es.backgroundColor ?? 'white').elem,
        make('value-input').set('fname', ['W', 1, 'Width']).dtxt(es.minWidth ?? '5').elem,
        make('value-input').set('fname', ['H', 1, 'Height']).dtxt(es.minHeight ?? '3').elem
    ]);
    let ac = addc(uiedit.addc(), [div], edt);
    uiedit.then = ac;
    uiedit.propagateState(su, div.updates);
    addChilds(ws, [wstitle('Box'), ac, uiedit]);
    ac.updateref();
    return;
}