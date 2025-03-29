import Component from './Component.js';

export default class Grid extends Component {
    constructor(data, pageBuilder) {
        super(pageBuilder);
        this.data = data;
        this.element = this.create();
    }

    create() {
        const grid = this.createElement("ol", "grid", this.data.name);
        let visibleItems = 0;
        
        grid.setAttribute("value", this.data.filter);
        const currentFilter = this.pageBuilder.router.getFilter() || this.data.filter;
        
        Object.values(this.pageBuilder.structure[this.data.value]).forEach(project => {
            const { element, isVisible } = this.createGridItem(project, currentFilter);
            if (isVisible) visibleItems++;
            grid.appendChild(element);
        });
        
        if (visibleItems === 0) {
            this.showEmptyMessage(grid, currentFilter);
        }
        
        grid.addEventListener("filter", this.createFilterHandler(grid));
        this.setProperties(grid, this.data.properties);
        
        return grid;
    }
    
    createGridItem(project, currentFilter) {
        const item = this.createElement("li");
        const image = this.createElement("img", "skeleton");
        const video = this.createElement("video", "skeleton");
        const content = this.createElement("div");
        const title = this.createElement("span", "title");
        const description = this.createElement("span", "descr");
        
        item.setAttribute("value", project.type);
        item.addEventListener("click", () => this.pageBuilder.openProject(project.name));
        
        image.src = project.images[project.preview];
        image.onload = () => image.classList.remove("skeleton");
        
        this.setupVideo(video, project.video);
        
        title.innerText = project.title;
        description.innerText = project.description;
        
        content.appendChild(title);
        content.appendChild(description);
        item.appendChild(image);
        item.appendChild(video);
        item.appendChild(content);
        
        this.setupHoverEffects(item, image, video, project);
        
        const isVisible = currentFilter === "all" || project.type === currentFilter;
        if (!isVisible) {
            item.style.setProperty("display", "none");
        }
        
        return { element: item, isVisible };
    }
    
    setupVideo(video, videoSrc) {
        if (!videoSrc) return;
        
        video.src = videoSrc;
        video.muted = true;
        video.loop = true;
        video.style.display = "none";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
        video.style.position = "absolute";
        video.style.top = "0";
        video.style.left = "0";
        video.controls = false;
        video.setAttribute("playsinline", "true");
        video.setAttribute("disablePictureInPicture", "true");
        video.setAttribute("controlsList", "nodownload nofullscreen noremoteplayback");
        
        video.onloadeddata = () => video.classList.remove("skeleton");
    }
    
    setupHoverEffects(item, image, video, project) {
        item.addEventListener("mouseover", () => {
            if (project.video && window.innerWidth > 768) {
                image.style.display = "none";
                video.style.display = "block";
                video.play();
            } else {
                image.src = project.images[project.default];
            }
        });
        
        item.addEventListener("mouseout", () => {
            if (project.video && window.innerWidth > 768) {
                video.style.display = "none";
                video.pause();
                image.style.display = "block";
            } else {
                image.src = project.images[project.preview];
            }
        });
    }
    
    showEmptyMessage(grid, filterName) {
        const emptyItem = this.createElement("li", null, "empty");
        const title = this.createElement("span", "title");
        const description = this.createElement("span", "descr");
        
        title.innerText = ":(";
        description.innerText = `No projects in «${filterName || "unknown"}» category`;
        
        const container = this.createElement("div");
        container.appendChild(title);
        container.appendChild(description);
        emptyItem.appendChild(container);
        
        grid.appendChild(emptyItem);
    }
    
    removeEmptyMessage(grid) {
        const emptyElement = grid.querySelector("#empty");
        if (emptyElement) emptyElement.remove();
    }
    
    createFilterHandler(grid) {
        return event => {
            let visibleCount = 0;
            
            for (const item of grid.childNodes.values()) {
                if (item.id === "empty") continue;
                
                if (event.filter === "all" || item.getAttribute("value") === event.filter) {
                    item.style.setProperty("display", "initial");
                    visibleCount++;
                } else {
                    item.style.setProperty("display", "none");
                }
            }
            
            if (visibleCount === 0) {
                this.showEmptyMessage(grid, event.filter);
            } else {
                this.removeEmptyMessage(grid);
            }
        };
    }
} 