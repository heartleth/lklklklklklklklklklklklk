window.states = {};
class UserBuiltComponent extends HTMLElement {
    connectedCallback() {
        if (this.componentName) {
            let componentInfo = window.builtComponents[this.componentName];
            this.innerHTML = componentInfo.html;
            let i = 0;
            // this.querySelectorAll('*').forEach(e=>e.classList.remove('outline'));
            for (let attr of componentInfo.attributes) {
                [...this.querySelectorAll(`[attributeslot-${attr}]`)].forEach(e=>{
                    let property = e.getAttribute(`attributeslot-${attr}`);
                    if (property[0] == ':') {
                        e.setAttribute(property.substring(1), this.attrs[i]);
                    }
                    else if (property[0] == '#') {
                        e.style[property.substring(1)] = this.attrs[i];
                    }
                    else {
                        e[property] = this.attrs[i];
                    }
                });
                i += 1;
            }
        }
    }
}
window.customElements.define('user-built-component', UserBuiltComponent);

function updateState(stateNamesArr) {
    let stateNames = {};
    for (let stateName of stateNamesArr) {
        stateNames[stateName] = 1;
    }
    for (let state in stateNames) {
        document.querySelectorAll(`[updateforstate-${state}]`).forEach(e => {
            let property = e.getAttribute(`updateforstate-${state}`);
            if (property[0] == ':') {
                e.setAttribute(property.substring(1), window.states[state]);
            }
            else if (property[0] == '#') {
                e.style[property.substring(1)] = window.states[state];
            }
            else {
                e[property] = window.states[state];
            }
        });
    }
}

function makeUBC(name, attrs) {
    let elem = document.createElement('user-built-component');
    elem.componentName = name;
    elem.attrs = attrs;
    return elem;
}