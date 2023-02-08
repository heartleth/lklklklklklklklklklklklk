window.builtComponents = {};

function componentmenu(ws) {
    let componentNameInput = make('text').elem;
    let addComponentButton = make('button').addClass('addOpenComponent').html('Add & Edit component').elem;
    let selectComponent = make('select').opts(Object.keys(window.builtComponents)).elem;
    let editor = make('component-editor').elem;
    // let openIt = make('button').addClass('openComponent').text('Open').elem;
    addChilds(ws, [
        wstitle('Components'),
        wse.label('New Component').elem,
        wse.br(),
        componentNameInput,
        wse.br(),
        addComponentButton,
        wse.br(),
        // selectComponent,
        // openIt,
        // make('line').elem,
        // editor
    ]);
    
    addComponentButton.addEventListener('click', () => {
        let componentName = componentNameInput.value;
        if (componentName.trim().length == 0) return;
        
        if (!window.builtComponents[componentName]) {
            window.builtComponents[componentName] = {
                attributes: [],
                html: ''
            }
        }
        openComponent(componentName);
    });
    
    
    for (let component of Object.keys(window.builtComponents)) {
        ws.appendChild(make('line').elem);
        ws.appendChild(make('label').text('Component ' + component).elem);
        let editor = make('component-editor').set('componentName', component).elem;
        let openIt = make('button').addClass('openComponent').text('Open').elem;
        ws.appendChild(openIt);
        openIt.addEventListener('click', () => {
            openComponent(component);
            editor.render();
        });
        let shb = make('show-hide-button').attr('div', true).elem;
        ws.appendChild(shb);
        ws.appendChild(make('br').elem);
        ws.appendChild(editor);
        shb.dispatchEvent(new Event('click'));
    }
}

class ComponentEditor extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = '';
        if (!this.componentName) {
            return;
        }

        let componentRename = make('text').elem;
        let componentInfo = window.builtComponents[this.componentName];
        componentRename.value = this.componentName;
        let componentAttrList = make('div').elem;
        let addComponentAttrButton = make('button').addClass('newstate').text('+').elem;
        addChilds(this, [
            wse.label('Name').elem,
            wse.br(),
            componentRename,
            wse.br(),
            wse.label('Attributes').elem,
            componentAttrList,
            addComponentAttrButton
        ]);
        listAttrs(componentAttrList, componentInfo, this.componentName);
        addComponentAttrButton.addEventListener('click', () => {
            window.builtComponents[this.componentName].attributes.push('attr0');
            componentAttrList.innerHTML = '';
            listAttrs(componentAttrList, componentInfo, this.componentName);
            componentAttrList.children[componentAttrList.children.length-1].children[0].focus();
        });
    }
}

window.customElements.define('component-editor', ComponentEditor);

function listAttrs(componentAttrList, componentInfo, componentName) {
    let i = 0;
    addChilds(componentAttrList, componentInfo.attributes.map(attr => {
        let k = make('div').elem;
        let removeButton = make('button').addClass('removeButton').addClass('newstate').text('-').elem;
        let t = make('text').addClass('componentAttrs').set('n', i).set('value', attr).attr('onfocus', 'this.select();').elem;
        t.addEventListener('change', () => {
            window.builtComponents[componentName].attributes[t.n] = t.value;
            save();
        });
        removeButton.addEventListener('click', () => {
            window.builtComponents[componentName].attributes.splice(t.n, 1);
            componentAttrList.parentElement.render();
            save();
        });
        k.appendChild(t);
        k.appendChild(removeButton);
        i += 1;
        return k;
    }));
}

function openComponent(componentName) {
    let closebutton = make('button').text('-').elem;
    let k = make('div').text(componentName).elem;
    let wsb = document.querySelector('wsbody');
    closebutton.addEventListener('click', e => {
        e.stopPropagation();
        k.remove();
        wsb.innerHTML = localStorage.getItem(getPage() + 'page');
        wsb.setAttribute('mode', 'Page');
        save();
    });
    k.appendChild(closebutton);
    k.addEventListener('click', () => {
        save();
        wsb.innerHTML = window.builtComponents[componentName].html;
        wsb.setAttribute('mode', componentName);
    });
    if ([...document.querySelector('#wsnav').children].some(e => e.innerText == componentName + '-')) {
        return;
    }
    document.querySelector('#wsnav').appendChild(k);
    save();
    wsb.innerHTML = window.builtComponents[componentName].html;
    wsb.setAttribute('mode', componentName);
}