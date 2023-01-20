window.builtComponents = {};

function componentmenu(ws) {
    let componentNameInput = make('text').elem;
    let addComponentButton = make('button').addClass('addOpenComponent').html('Add & Edit component').elem;
    addChilds(ws, [
        wstitle('Components'),
        wse.label('New Component').elem,
        wse.br(),
        componentNameInput,
        wse.br(),
        addComponentButton,
    ]);
    addComponentButton.addEventListener('click', () => {
        let componentName = componentNameInput.value;
        if (componentName.trim().length == 0) return;
        
        if (!window.builtComponents[componentName]) {
            window.builtComponents[componentName] = {
                parameter: [],
                html: ''
            }
        }
        let k = make('div').text(componentName).elem;
        k.addEventListener('click', () => {
            save();
            document.querySelector('wsbody').innerHTML = window.builtComponents[componentName].html;
        });
        document.querySelector('#wsnav').appendChild(k);
    });
}
