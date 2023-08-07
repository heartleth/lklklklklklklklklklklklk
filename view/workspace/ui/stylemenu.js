const styleoptions = [
    {
        title: 'Text Style',
        binds: [
            ['Font Size', ['len=font-size']],
            ['Font', ['font=font-family']],
            ['Font Weight', ['@[lighter,light,initial,bold,bolder]=font-weight']],
            ['Color', ['color=color']],
            ['Text Align', ['@[right,left,center]=text-align']],
            ['Shadow', ['Shadow=text-shadow']]
        ]
    },
    {
        title: 'Box Style',
        binds: [
            ['Shadow', ['shadow=box-shadow']],
            ['Background', ['texture=background-color']]
        ]
    },
    {
        title: 'Border Style',
        binds: [
            ['Type', ['@[none,solid,dashed,double,inset,outset,ridge,groove]=border-style']]
        ]
    }
];

function stylemenu(ws, dsn) {
    ws.render = () => {
        ws.innerHTML = '';
        ws.dsn = ws.dsn ?? (dsn ?? 'None');
        if (localStorage.getItem('llstyle') == null) {
            localStorage.setItem('llstyle', '{"None":{}}');
        }
        let pstyles = JSON.parse(localStorage.getItem('llstyle'));
        styleName = document.createElement('select');
        for (const stn in pstyles) {
            styleName.innerHTML += `<option ${stn == ws.dsn ? 'selected' : ''}>` + stn + '</option>';
        }
        styleName.addEventListener('change', () => {
            ws.dsn = styleName.value;
            ws.render();
        });
        
        ws.appendChild(wstitle('Styles'));
        ws.appendChild(make('line').elem);
        ws.appendChild(styleName);
        let nsi = make('input').attr('type', 'text').attr('style', 'margin-left: 4px; height: 16px; width: 80px; position: relative;').elem;
        let nsbt = make('button').text('+').addClass('newstate').elem;
        nsbt.addEventListener('click', () => {
            if (nsi.value != '') {
                ws.dsn = nsi.value;
                let s = JSON.parse(localStorage.getItem('llstyle'));
                s[ws.dsn] = {};
                localStorage.setItem('llstyle', JSON.stringify(s));
                applyStyle();
                ws.render();
            }
        });
        ws.appendChild(nsi);
        ws.appendChild(nsbt);
        if (ws.dsn == 'None') {
            return;
        }
        ws.appendChild(wse.br());
        let wrapper = make('dragable-wrapper').elem;
        wrapper.dropCallback = ((elem) => {
            let s = elem.getAttribute('styles');
            if (!s) {
                s = '';
            }
            if (!s.split(' ').includes(ws.dsn)) {
                s += ' ' + ws.dsn;
            }
            elem.setAttribute('styles', s);
        });
        ws.appendChild(wrapper);
        ws.appendChild(wse.br());
        for (const category of styleoptions) {
            let dv = document.createElement('div');
            dv.classList.add('style-category');
            for (const bind of category.binds) {
                dv.appendChild(make('style-bind').set('bind', bind).set('ws', ws).elem);
            }
            ws.appendChild(make('span').text(category.title).elem);
            ws.appendChild(make('show-hide-button').attr('div', true).elem);
            ws.appendChild(wse.br());
            ws.appendChild(dv);
        }
    };
    ws.render();
}

class StyleBind extends HTMLElement {
    connectedCallback() {
        this.bindlist = [];
        let label = make('span').text(this.bind[0]).addClass('style-label').elem;
        this.appendChild(label);
        for (const bprop of this.bind[1]) {
            let pb = this.parseBind(bprop);
            let td = document.createElement('td');
            if (this.llstyle()[this.ws.dsn][pb[1]]) {
                if (pb[3]) {
                    pb[3](this.llstyle()[this.ws.dsn][pb[1]]);
                }
                else {
                    pb[0].value = this.llstyle()[this.ws.dsn][pb[1]];
                }
            }
            pb[0].addEventListener('change', () => {
                let s = this.llstyle();
                if (pb[2]) {
                    s[this.ws.dsn][pb[1]] = pb[2]();
                }
                else {
                    s[this.ws.dsn][pb[1]] = pb[0].value;
                }
                localStorage.setItem('llstyle', JSON.stringify(s));
                applyStyle();
            });
            td.appendChild(pb[0]);
            this.bindlist.push(pb[1]);
            this.appendChild(td);
        }
    }
    
    parseBind(bind) {
        let bspd = bind.split('=');
        let btype = bspd[0];
        let btarget = bspd[1];
        if (btype[0] == '@') {
            let opts = btype.substring(2, btype.length - 1).split(',');
            return [make('select').html([...opts.map(e=>`<option>${e}</option>`)].join('')).elem, btarget];
        }
        else if (btype == 'len') {
            let li = make('length-input').elem;
            li.style.width = '100px';
            return [li, btarget, () => li.val, li.set_val];
        }
        else if (btype == 'color') {
            let li = make('input').attr('type', 'color').elem;
            return [li, btarget];
        }
        else if (btype == 'font') {
            // let li = make('input').attr('type', 'color').elem;
            // return [li, btarget];
        }
        else if (btype.toLowerCase() == 'shadow') {
            let isTextShadow = btype[0] == 'S';
            let lis = make('div').elem;
            // lis.style.width = '100px';
            let type = make('select').attr('style', 'width: 60px; display: inline-block;').html('<option>none</option><option value="">default</option><option>inset</option>').elem;
            let ofx = make('length-input').attr('style', 'width: 60px; display: block;').set('label', 'offset X').elem;
            let ofy = make('length-input').attr('style', 'width: 60px; display: block;').set('label', 'offset Y').elem;
            let blr = make('length-input').attr('style', 'width: 60px; display: block;').set('label', 'blur rad').elem;
            if (!isTextShadow) {
                let spr = make('length-input').attr('style', 'width: 60px; display: block;').set('label', 'spread rad').elem;
                let col = make('input').attr('type', 'color').elem;
                let opc = make('input').attr('type', 'range').attr('min', '0').attr('max', '255').attr('style', 'width: 80px;').elem;
                lis.appendChild(wse.label('type').attr('style', 'display: inline-block; width: 80px;').elem);
                lis.appendChild(type);
                lis.appendChild(ofx);
                lis.appendChild(ofy);
                lis.appendChild(blr);
                lis.appendChild(spr);
                lis.appendChild(wse.label('color').attr('style', 'display: inline-block; width: 80px;').elem);
                lis.appendChild(col);
                lis.appendChild(wse.br());
                lis.appendChild(wse.label('opacity').attr('style', 'display: inline-block; width: 80px;').elem);
                lis.appendChild(opc);
                return [lis, btarget, () => {
                    return type.value + ` ${ofx.val} ${ofy.val} ${blr.val} ${spr.val} ${col.value}${parseInt(opc.value).toString(16)}`;
                }, (v) => {
                    let s = [...v.split(' ')];
                    type.value = s[0];
                    ofx.set_val(s[1]);
                    ofy.set_val(s[2]);
                    blr.set_val(s[3]);
                    spr.set_val(s[4]);
                    col.value = s[5].substring(0, 7);
                    opc.value = parseInt(s[5].substring(7), 16);
                }];
            }
            else {
                let col = make('input').attr('type', 'color').elem;
                let opc = make('input').attr('type', 'range').attr('min', '0').attr('max', '255').attr('style', 'width: 80px;').elem;
                lis.appendChild(wse.label('type').attr('style', 'display: inline-block; width: 80px;').elem);
                lis.appendChild(type);
                lis.appendChild(ofx);
                lis.appendChild(ofy);
                lis.appendChild(blr);
                lis.appendChild(wse.label('color').attr('style', 'display: inline-block; width: 80px;').elem);
                lis.appendChild(col);
                lis.appendChild(wse.br());
                lis.appendChild(wse.label('opacity').attr('style', 'display: inline-block; width: 80px;').elem);
                lis.appendChild(opc);
                return [lis, btarget, () => {
                    return type.value + ` ${ofx.val} ${ofy.val} ${blr.val} ${col.value}${parseInt(opc.value).toString(16)}`;
                }, (v) => {
                    let s = [...v.split(' ')];
                    type.value = s[0];
                    ofx.set_val(s[1]);
                    ofy.set_val(s[2]);
                    blr.set_val(s[3]);
                    col.value = s[4].substring(0, 7);
                    opc.value = parseInt(s[4].substring(7), 16);
                }];
            }
        }
        return [make('span').text(bind).elem, btarget];
    }

    llstyle() {
        return JSON.parse(localStorage.getItem('llstyle'));
    }
}
window.customElements.define('style-bind', StyleBind);

function applyStyle() {
    let s = JSON.parse(localStorage.getItem('llstyle'));
    let ee = document.getElementById('lsimulate');
    ee.innerHTML = '';
    for (const styleName of Object.keys(s)) {
        ee.innerHTML += `.natural[styles~="${styleName}"] {${Object.keys(s[styleName]).map(e=>`${e}: ${s[styleName][e]};`).join('')}}`
    }
    localStorage.setItem('llcss', ee.innerHTML);
}