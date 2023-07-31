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
        this.appendChild(make('span').text(this.bind[1]).elem);
        this.appendChild(wse.br());
    }
}
window.customElements.define('style-bind', StyleBind);