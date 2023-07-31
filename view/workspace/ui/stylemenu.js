const styleoptions = [
    {
        title: 'Text Style',
        binds: [
            ['Font Size', ['len=font-size']],
            ['Font', ['font=font-family']],
            ['Font Weight', ['@[lighter,light,initial,bold,bolder]=font-weight']],
            ['Color', ['color=color']],
            ['Text Aligh', ['@[right,left,center]=text-align']],
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
    ws.appendChild(wstitle('Styles'));
    ws.appendChild(make('line').elem);
    
    if (localStorage.getItem('llstyle') == null) {
        localStorage.setItem('llstyle', '{"None":{}}');
    }
    let pstyles = JSON.parse(localStorage.getItem('llstyle'));
    let styleName = document.createElement('select');
    for (const stn in pstyles) {
        styleName.innerHTML += '<option>' + stn + '</option>';
    }
    styleName.addEventListener('click', () => {
        
    });
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
}

class StyleBind extends HTMLElement {
    connectedCallback() {
        this.appendChild(make('span').text(this.bind[0]).elem);
        for (const bprop of this.bind[1]) {
            this.appendChild(this.parseBind(bprop)[0]);
        }
        this.appendChild(wse.br());
    }
    
    parseBind(bind) {
        let bspd = bind.split('=');
        let btype = bspd[0];
        let btarget = bspd[1];
        if (btype[0] == '@') {
            let opts = btype.substring(2, btype.length - 1).split(',');
            return [make('select').html([...opts.map(e=>`<option>${e}</option>`)].join('')).elem, btarget];
        }
        return [make('span').text(bind).elem, btarget];
    }
}
window.customElements.define('style-bind', StyleBind);