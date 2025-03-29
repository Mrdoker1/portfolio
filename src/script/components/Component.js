export default class Component {
    constructor(pageBuilder) {
        this.pageBuilder = pageBuilder;
    }
    
    createElement(tag, className = null, id = null) {
        const element = document.createElement(tag);
        if (className) element.classList.add(className);
        if (id) element.id = id;
        return element;
    }
    
    setProperties(element, properties) {
        if (!properties) return;

        const propertyMappings = {
            'text-align': (value) => element.classList.add(`text-align-${value}`),
            'align-self': (value) => element.classList.add(`align-self-${value}`),
            'mobile': (value) => element.classList.add(`mobile-${value}`),
            'desktop': (value) => element.classList.add(`desktop-${value}`),
            'padding': (value) => element.classList.add(`padding-${value}`),
            'margin': (value) => element.classList.add(`margin-${value}`),
            'max-width': (value) => element.classList.add(`max-width-${value}`),
            'justify-content': (value) => element.classList.add(`justify-content-${value}`),
            'gap': (value) => element.classList.add(`gap-${value}`),
            'flex-direction': (value) => element.classList.add(`flex-direction-${value}`)
        };

        Object.entries(properties).forEach(([key, value]) => {
            if (propertyMappings[key]) {
                propertyMappings[key](value);
            }
        });
    }
} 