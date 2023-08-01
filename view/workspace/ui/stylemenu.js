const styleoptions = [
    {
        title: 'Text Style',
        binds: [
            ['Font Size', ['len=font-size']],
            ['Font', ['font=font-family']],
            ['Font Weight', ['@[lighter,light,initial,bold,bolder]=font-weight']],
            ['Color', ['color=color']],
            ['Text Align', ['@[right,left,center]=text-align']],
            ['Shadow', ['shadow=text-shadow']]
        ]
    },
    {
        title: 'Box Style',
        binds: [
            ['Shadow', ['shadow=box-shadow']],
            ['Background', ['texture=background-color']],
        ]
    }
];

function stylemenu(ws) {
    ws.render = () => {
        if (localStorage.getItem('llstyle') == null) {
            localStorage.setItem('llstyle', '{"None":{}}');
        }
        let pstyles = JSON.parse(localStorage.getItem('llstyle'));
        let styleName = document.createElement('select');
        for (const stn in pstyles) {
            styleName.innerHTML += '<option>' + stn + '</option>';
        }
        styleName.addEventListener('click', () => {
            if (styleName.value != 'None') {
                
            }
        });
        
        ws.appendChild(wstitle('Styles'));
        ws.appendChild(make('line').elem);
        ws.appendChild(styleName);
        ws.appendChild(wse.br());
        for (const category of styleoptions) {
            let dv = document.createElement('div');
            dv.classList.add('style-category');
            for (const bind of category.binds) {
                dv.appendChild(make('style-bind').set('bind', bind).elem);
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
            return [li, btarget];
        }
        else if (btype == 'color') {
            let li = make('input').attr('type', 'color').elem;
            return [li, btarget];
        }
        else if (btype == 'shadow') {
            let lis = make('div').elem;
            // lis.style.width = '100px';
            let ofx = make('length-input').attr('style', 'width: 60px; display: block;').set('label', 'offset X').elem;
            let ofy = make('length-input').attr('style', 'width: 60px; display: block;').set('label', 'offset Y').elem;
            let blr = make('length-input').attr('style', 'width: 60px; display: block;').set('label', 'blur rad').elem;
            let spr = make('length-input').attr('style', 'width: 60px; display: block;').set('label', 'spread rad').elem;
            let col = make('input').attr('type', 'color').elem;
            lis.appendChild(ofx);
            lis.appendChild(ofy);
            lis.appendChild(blr);
            lis.appendChild(spr);
            return [lis, btarget];
        }
        return [make('span').text(bind).elem, btarget];
    }
}
window.customElements.define('style-bind', StyleBind);