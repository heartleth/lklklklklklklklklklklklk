class UserBuiltComponent extends HTMLElement {
    connectedCallback() {
        if (this.getAttribute('cname')) {
            this.componentName = this.getAttribute('cname');
        }
        if (this.componentName) {
            let componentInfo = window.builtComponents[this.componentName];
            if (componentInfo) {
                this.innerHTML = componentInfo.html;
                let i = 0;
                let sattrs = JSON.stringify(this.attrs);
                this.querySelectorAll('*').forEach(e => {
                    e.setAttribute('attrs', sattrs);
                });
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
}

window.customElements.define('user-built-component', UserBuiltComponent);