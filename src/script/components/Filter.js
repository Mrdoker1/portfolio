import Component from './Component.js';

export default class Filter extends Component {
    constructor(data, pageBuilder) {
        super(pageBuilder);
        this.data = data;
        this.element = this.create();
    }

    create() {
        const button = this.createElement("button", "filter", this.data.name);
        const title = this.createElement("span", null, this.data.name + "Title");
        const filterContainer = this.createElement("div", "filterContainer");
        const list = this.createElement("ul");
        const arrow = this.createElement("img");
        
        const currentFilter = this.pageBuilder.router.getFilter() || 
                              this.data.value.items[this.data.value.default].name;
        
        button.setAttribute("value", currentFilter);

        this.createFilterItems(list, currentFilter, title, button);
        
        arrow.src = "./src/images/arrow-down.svg";
        filterContainer.appendChild(list);
        
        button.appendChild(title);
        button.appendChild(filterContainer);
        button.appendChild(arrow);
        
        this.setProperties(button, this.data.properties);
        this.attachEventListeners(button);
        
        return button;
    }
    
    createFilterItems(list, currentFilter, title, button) {
        this.data.value.items.forEach(item => {
            const listItem = this.createElement("li");
            listItem.setAttribute("value", item.name);
            listItem.innerText = item.value;
            
            if (item.name === currentFilter) {
                listItem.classList.add("selected");
                title.innerText = item.value;
            }
            
            listItem.addEventListener("click", this.createFilterItemHandler(item, title, button, list));
            list.appendChild(listItem);
        });
    }
    
    createFilterItemHandler(item, title, button, list) {
        return event => {
            const filterEvent = new Event("filter");
            filterEvent.filter = event.target.getAttribute("value");
            
            title.innerText = event.target.innerText;
            button.value = event.target.getAttribute("value");
            
            list.querySelector("li.selected").classList.remove("selected");
            event.target.classList.add("selected");
            
            this.pageBuilder.router.setFilter(filterEvent.filter);
            button.classList.remove("opened");
            
            event.stopPropagation();
            document.querySelector("#" + this.data.value.target).dispatchEvent(filterEvent);
        };
    }
    
    attachEventListeners(button) {
        button.addEventListener("click", event => {
            button.classList.toggle("opened");
            event.stopPropagation();
        });
        
        window.addEventListener("click", (event) => {
            if (!button.contains(event.target)) {
                button.classList.remove("opened");
            }
        });
    }
} 