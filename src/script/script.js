export default class PageBuilder {
    constructor() {
        this.catchJSON();
        this.currentPage = this.getPath(window.location.search);
        this.menu = document.querySelector(".header div.menu");
        this.main = document.querySelector("main");

        // Add event listener for Esc key
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                this.closeProject();
            }
        });
    }

    async catchJSON() {
        const response = await fetch("structure.json");
        const data = await response.json();
        this.structure = data;
        this.load();
    }

    build() {
        const pageContent = this.structure.pages[this.currentPage].body;
        
        // Update menu state
        this.menu.querySelector(".current").classList.remove("current");
        this.menu.querySelector(`a[value=${this.currentPage}`).classList.add("current");
        
        // Handle project if specified
        if (this.getProject()) {
            this.openProject(this.getProject());
        }

        // Clear and rebuild main content with animation
        this.main.classList.add("fade-out");
        setTimeout(() => {
            this.main.innerHTML = "";
            pageContent.forEach((section, index) => {
                if (section.type === "box") {
                    const box = document.createElement("div");
                    box.classList.add("box");
                    box.id = `box_${index}`;
                    
                    section.value.forEach(item => {
                        box.appendChild(this.blockBuild(item));
                    });
                    
                    this.main.appendChild(box);
                } else {
                    this.main.appendChild(this.blockBuild(section));
                }
            });
            this.main.classList.remove("fade-out");
            this.main.classList.add("fade-in");
        }, 250);
    }

    blockBuild(blockData) {
        const blockMethod = `createBlock_${blockData.type}`;
        
        if (this[blockMethod]) {
            console.log("Add block:", blockData.type, blockData.name, blockData.value);
            return this[blockMethod](blockData);
        } else {
            console.error("Unreleased block:", blockData.type);
            return this.createBlock_default(blockData);
        }
    }

    createBlock_default(data) {
        const element = document.createElement("span");
        element.classList.add("default");
        element.id = data.name;
        element.innerText = data.value;
        return element;
    }

    SetProperties(element, properties) {
        if (!properties) return;

        const propertyMappings = {
            'text-align': (value) => element.classList.add(`text-align-${value}`),
            'align-self': (value) => element.classList.add(`align-self-${value}`),
            'mobile': (value) => element.classList.add(`mobile-${value}`),
            'desktop': (value) => element.classList.add(`desktop-${value}`),
            'padding': (value) => element.classList.add(`padding-${value}`),
            'margin': (value) => element.classList.add(`margin-${value}`),
            'max-width': (value) => element.classList.add(`max-width-${value}`),
            'justify-content': (value) => element.classList.add(`justify-content-${value}`)
        };

        Object.entries(properties).forEach(([key, value]) => {
            if (propertyMappings[key]) {
                propertyMappings[key](value);
            }
        });
    }

    createBlock_filter(data) {
        const button = document.createElement("button");
        const title = document.createElement("span");
        const filterContainer = document.createElement("div");
        const list = document.createElement("ul");
        const arrow = document.createElement("img");

        let currentFilter = this.getFilter(window.location.search) || data.value.items[data.value.default].name;

        button.classList.add("filter");
        button.id = data.name;
        button.setAttribute("value", currentFilter);
        title.id = data.name + "Title";

        data.value.items.forEach(item => {
            const listItem = document.createElement("li");
            listItem.setAttribute("value", item.name);
            listItem.innerText = item.value;

            if (item.name === currentFilter) {
                listItem.classList.add("selected");
                title.innerText = item.value;
            }

            listItem.addEventListener("click", event => {
                const filterEvent = new Event("filter");
                filterEvent.filter = event.target.getAttribute("value");
                
                title.innerText = event.target.innerText;
                button.value = event.target.getAttribute("value");
                
                list.querySelector("li.selected").classList.remove("selected");
                event.target.classList.add("selected");
                
                this.setFilter(filterEvent.filter);
                button.classList.remove("opened");
                
                event.stopPropagation();
                document.querySelector("#" + data.value.target).dispatchEvent(filterEvent);
            });

            list.appendChild(listItem);
        });

        arrow.src = "./src/images/arrow-down.svg";
        filterContainer.classList.add("filterContainer");
        filterContainer.appendChild(list);

        button.appendChild(title);
        button.appendChild(filterContainer);
        button.appendChild(arrow);

        this.SetProperties(button, data.properties);

        button.addEventListener("click", event => {
            if (button.classList.contains("opened")) {
                button.classList.remove("opened");
            } else {
                button.classList.add("opened");
            }
            event.stopPropagation();
        });

        window.addEventListener("click", (event) => {
            if (!button.contains(event.target)) {
                button.classList.remove("opened");
            }
        });

        return button;
    }

    createBlock_grid(data) {
        const grid = document.createElement("ol");
        let visibleItems = 0;

        const showEmptyMessage = (filterName) => {
            const emptyItem = document.createElement("li");
            const title = document.createElement("span");
            const description = document.createElement("span");
            
            emptyItem.id = "empty";
            title.classList.add("title");
            description.classList.add("descr");
            
            title.innerText = ":(";
            description.innerText = `No projects in «${filterName || "unknown"}» category`;
            
            const container = document.createElement("div");
            container.appendChild(title);
            container.appendChild(description);
            emptyItem.appendChild(container);
            
            grid.appendChild(emptyItem);
        };

        const removeEmptyMessage = () => {
            const emptyElement = document.querySelector("#empty");
            if (emptyElement) emptyElement.remove();
        };

        grid.classList.add("grid");
        grid.id = data.name;
        grid.setAttribute("value", data.filter);

        const currentFilter = this.getFilter(window.location.search) || data.filter;

        Object.values(this.structure[data.value]).forEach(project => {
            const item = document.createElement("li");
            const image = document.createElement("img");
            const video = document.createElement("video");
            const content = document.createElement("div");
            const title = document.createElement("span");
            const description = document.createElement("span");

            item.setAttribute("value", project.type);
            item.addEventListener("click", () => this.openProject(project.name));

            image.src = project.images[project.preview];
            video.src = project.video || "";
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
            
            title.classList.add("title");
            title.innerText = project.title;
            
            description.classList.add("descr");
            description.innerText = project.description;

            content.appendChild(title);
            content.appendChild(description);
            item.appendChild(image);
            item.appendChild(video);
            item.appendChild(content);

            item.addEventListener("mouseover", () => {
                if (project.video) {
                    image.style.display = "none";
                    video.style.display = "block";
                    video.play();
                } else {
                    image.src = project.images[project.default];
                }
            });

            item.addEventListener("mouseout", () => {
                if (project.video) {
                    video.style.display = "none";
                    video.pause();
                    image.style.display = "block";
                } else {
                    image.src = project.images[project.preview];
                }
            });

            if (currentFilter !== "all" && project.type !== currentFilter) {
                item.style.setProperty("display", "none");
            } else {
                visibleItems++;
            }

            grid.appendChild(item);
        });

        if (visibleItems === 0) {
            showEmptyMessage(currentFilter);
        }

        grid.addEventListener("filter", event => {
            let visibleCount = 0;
            
            for (const item of grid.childNodes.values()) {
                if (event.filter === "all" || item.getAttribute("value") === event.filter) {
                    item.style.setProperty("display", "initial");
                    visibleCount++;
                } else {
                    item.style.setProperty("display", "none");
                }
            }

            if (visibleCount === 0) {
                showEmptyMessage(event.filter);
            } else {
                removeEmptyMessage();
            }
        });

        this.SetProperties(grid, data.properties);
        return grid;
    }

    createBlock_h1(data) {
        const heading = document.createElement("span");
        heading.classList.add("h1");
        heading.id = data.name;
        heading.innerText = data.value;
        this.SetProperties(heading, data.properties);
        return heading;
    }

    createBlock_toTopButton(data) {
        const button = document.createElement("div");
        const text = document.createElement("span");
        
        button.classList.add("to-top-button");
        button.id = data.name;
        text.innerText = data.value;
        
        button.appendChild(text);
        button.addEventListener("click", () => window.scrollTo(0, 0));
        
        this.SetProperties(button, data.properties);
        return button;
    }

    createBlock_caption(data) {
        const caption = document.createElement("span");
        caption.classList.add("caption");
        caption.id = data.name;
        caption.innerText = data.value;
        this.SetProperties(caption, data.properties);
        return caption;
    }

    createBlock_h0(data) {
        const heading = document.createElement("span");
        heading.classList.add("h0");
        heading.id = data.name;
        heading.innerText = data.value;
        this.SetProperties(heading, data.properties);
        return heading;
    }

    createBlock_picture(data) {
        const image = document.createElement("img");
        image.classList.add("picture");
        image.id = data.name;
        image.src = data.value.src;
        image.alt = data.value.alt;
        image.style.cssText = data.style;
        this.SetProperties(image, data.properties);
        return image;
    }

    createBlock_comment() {
        return document.createDocumentFragment();
    }

    createBlock_svg_link(data, className) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        svg.setAttribute("class", className);
        svg.setAttribute("width", data.value.width);
        svg.setAttribute("height", data.value.height);
        svg.setAttribute("viewbox", data.value.viewbox);
        svg.setAttribute("fill", "none");
        svg.id = data.name;
        svg.classList.add("link-icon");

        path.setAttribute("d", data.value.path);
        path.setAttribute("fill", "black");
        path.setAttribute("class", "svg-icon");
        path.setAttribute("stroke-width", data.value.stroke_width || 0);
        
        if (data.value.stroke) {
            path.setAttribute("stroke", data.value.stroke);
        }

        svg.appendChild(path);

        if (data.value.url) {
            svg.addEventListener("click", () => {
                if (data.value.newWindow) {
                    window.open(data.value.url, "_blank");
                } else {
                    window.location.href = data.value.url;
                }
            });
        }

        this.SetProperties(svg, data.properties);
        return svg;
    }

    createBlock_paragraph(data) {
        const paragraph = document.createElement("p");
        paragraph.classList.add("paragraph");
        paragraph.id = data.name;
        paragraph.innerHTML = data.value;
        this.SetProperties(paragraph, data.properties);
        return paragraph;
    }

    createBlock_br(data) {
        const lineBreak = document.createElement("br");
        lineBreak.id = data.name;
        this.SetProperties(lineBreak, data.properties);
        return lineBreak;
    }

    createBlock_form(data) {
        const form = document.createElement("form");
        const nameInput = document.createElement("input");
        const emailInput = document.createElement("input");
        const messageInput = document.createElement("textarea");
        const submitButton = document.createElement("input");
        const buttonContainer = document.createElement("div");
        const orSpan = document.createElement("span");
        const emailLink = document.createElement("a");

        form.setAttribute("action", data.value);
        form.setAttribute("method", "POST");

        // Name field
        const nameLabel = document.createElement("label");
        nameLabel.innerText = "Name";
        nameInput.setAttribute("name", "name");
        nameInput.setAttribute("type", "text");
        form.appendChild(nameLabel);
        form.appendChild(nameInput);

        // Email field
        const emailLabel = document.createElement("label");
        emailLabel.innerText = "Email";
        emailInput.setAttribute("name", "_replyto");
        emailInput.setAttribute("type", "email");
        form.appendChild(emailLabel);
        form.appendChild(emailInput);

        // Message field
        const messageLabel = document.createElement("label");
        messageLabel.innerText = "Message";
        messageInput.setAttribute("name", "message");
        form.appendChild(messageLabel);
        form.appendChild(messageInput);

        // Submit section
        emailLink.href = `mailto:${data.email}`;
        emailLink.innerText = "Send an Email";
        
        submitButton.setAttribute("type", "submit");
        submitButton.setAttribute("value", "Send Message");
        submitButton.classList.add("button");
        
        orSpan.appendChild(document.createTextNode(" or "));
        orSpan.appendChild(emailLink);
        
        buttonContainer.appendChild(submitButton);
        buttonContainer.appendChild(orSpan);
        
        form.appendChild(buttonContainer);

        return form;
    }

    createBlock_linkButton(data) {
        const button = document.createElement("button");
        button.classList.add("link-button");
        button.id = data.name;
        button.innerText = data.value.text;

        if (data.value.url) {
            button.addEventListener("click", () => {
                if (data.value.newWindow) {
                    window.open(data.value.url, "_blank");
                } else {
                    window.location.href = data.value.url;
                }
            });
        } else if (data.value.route) {
            button.addEventListener("click", () => {
                this.setPath(data.value.route);
                this.rebuild(data.value.route);
            });
        }

        this.SetProperties(button, data.properties);
        return button;
    }

    openProject(projectName) {
        if (!this.structure.projects[projectName]) return;

        const popup = document.querySelector(".pop-up");
        const popupBody = popup.querySelector(".pop-up-body");
        const projectData = this.structure.projects[projectName];

        this.compositePopUpBody(projectData);
        this.setProject(projectData.name);

        document.body.classList.add("no-scroll");
        document.querySelector(".main").classList.add("blur");
        popup.classList.add("visible");
        popup.classList.remove("hidden");
        popupBody.classList.remove("hidden");
        popupBody.classList.add("visible");
        popupBody.classList.add("pop-up-open");
        popupBody.classList.remove("pop-up-close");
        popup.scrollTo(0, 0);
    }

    closeProject(event) {
        const popup = document.querySelector(".pop-up");
        const popupBody = popup.querySelector(".pop-up-body");

        popupBody.classList.add("pop-up-close");
        popupBody.classList.remove("pop-up-open");

        setTimeout(() => {
            document.body.classList.remove("no-scroll");
            document.querySelector(".main").classList.remove("blur");
            popup.classList.add("hidden");
            popup.classList.remove("visible");
            popupBody.classList.add("hidden");
            popupBody.classList.remove("visible");
            this.setProject(null);
        }, 300);

        if (event) {
            event.stopPropagation();
        }
    }

    openMenu() {
        const popup = document.querySelector(".pop-up");
        const rightBody = popup.querySelector(".pop-up-right-body");
        const mainBody = popup.querySelector(".pop-up-body");

        rightBody.classList.add("visible");
        mainBody.classList.add("hidden");
        rightBody.classList.remove("hidden");
        mainBody.classList.remove("visible");

        document.body.classList.add("no-scroll");
        document.querySelector(".main").classList.add("blur");
        popup.classList.add("visible");
        popup.classList.remove("hidden");
        popup.scrollTo(0, 0);
    }

    closeMenu(event) {
        const popup = document.querySelector(".pop-up");
        const rightBody = popup.querySelector(".pop-up-right-body");

        document.body.classList.remove("no-scroll");
        document.querySelector(".main").classList.remove("blur");
        popup.classList.add("hidden");
        popup.classList.remove("visible");
        rightBody.classList.remove("visible");
        rightBody.classList.add("hidden");

        event.stopPropagation();
    }

    compositePopUpBody(projectData) {
        const title = document.createElement("span");
        const subtitle = document.createElement("span");
        const infoSection = document.createElement("div");
        const contentContainer = document.createElement("div");
        const popupBody = document.querySelector(".pop-up-body");
        const imageViewer = document.createElement("div");
        const imageBar = document.createElement("div");

        const updateSelectedImage = (index) => {
            imageViewer.setAttribute("value", index);
            imageViewer.style.setProperty("background-image", 
                `url("${imageBar.firstElementChild.children[index].firstElementChild.src}")`);
            imageBar.firstElementChild.querySelector(".selected").classList.remove("selected");
            imageBar.firstElementChild.children[index].classList.add("selected");
        };

        // Clear existing content
        popupBody.innerHTML = "";

        // Add title and subtitle
        title.classList.add("title");
        title.innerText = projectData.title;
        popupBody.appendChild(title);

        subtitle.classList.add("subtitle");
        subtitle.innerText = projectData.description;
        popupBody.appendChild(subtitle);

        // Setup image viewer
        imageViewer.classList.add("output");
        
        // Add navigation arrows
        const createArrow = (direction) => {
            const arrow = document.createElement("div");
            const arrowImg = document.createElement("img");
            
            arrow.classList.add("arrow", "noselect", direction);
            arrowImg.setAttribute("src", "./src/images/arrow-down.svg");
            arrow.appendChild(arrowImg);
            
            return arrow;
        };

        const leftArrow = createArrow("left");
        const rightArrow = createArrow("right");

        leftArrow.addEventListener("click", () => {
            const currentIndex = parseInt(imageViewer.getAttribute("value"));
            const newIndex = currentIndex > 0 ? currentIndex - 1 : 
                imageBar.firstElementChild.childElementCount - 1;
            updateSelectedImage(newIndex);
        });

        rightArrow.addEventListener("click", () => {
            const currentIndex = parseInt(imageViewer.getAttribute("value"));
            const newIndex = (currentIndex + 1) % imageBar.firstElementChild.childElementCount;
            updateSelectedImage(newIndex);
        });

        imageViewer.appendChild(leftArrow);
        imageViewer.appendChild(rightArrow);

        // Setup image bar
        imageBar.classList.add("bar");
        const imageList = document.createElement("ul");
        imageBar.appendChild(imageList);

        projectData.images.forEach((imageSrc, index) => {
            const imageItem = document.createElement("li");
            const image = document.createElement("img");
            
            imageItem.setAttribute("value", index);
            image.src = imageSrc;
            
            if (index === projectData.default) {
                imageItem.classList.add("selected");
                imageViewer.style.setProperty("background-image", `url("${imageSrc}")`);
                imageViewer.setAttribute("value", index);
            }
            
            imageItem.appendChild(image);
            imageItem.addEventListener("click", (event) => {
                updateSelectedImage(parseInt(event.currentTarget.getAttribute("value")));
            });
            
            imageList.appendChild(imageItem);
        });

        contentContainer.appendChild(imageViewer);
        contentContainer.appendChild(imageBar);
        popupBody.appendChild(contentContainer);

        // Add customer information if available
        if (projectData.customer) {
            const customerSection = document.createElement("div");
            const customerTitle = document.createElement("span");
            const customerInfo = document.createElement("span");

            customerTitle.classList.add("title");
            customerTitle.innerText = projectData.customer[0];
            customerInfo.innerText = projectData.customer[1];

            customerSection.appendChild(customerTitle);
            customerSection.appendChild(customerInfo);
            infoSection.appendChild(customerSection);
        }

        // Add links if available
        if (projectData.links) {
            const linksSection = document.createElement("div");
            const linksTitle = document.createElement("span");
            const linksList = document.createElement("span");

            linksTitle.classList.add("title");
            linksTitle.innerText = "Links";

            projectData.links.forEach(link => {
                const linkElement = document.createElement("a");
                linkElement.innerText = link.name;
                linkElement.href = link.href;
                linksList.appendChild(linkElement);
                linksList.appendChild(document.createTextNode(" "));
            });

            linksSection.appendChild(linksTitle);
            linksSection.appendChild(linksList);
            linksSection.classList.add("project-links");
            infoSection.appendChild(linksSection);
        }

        // Add "About" section
        const aboutSection = document.createElement("div");
        const aboutTitle = document.createElement("span");
        const aboutContent = document.createElement("p");

        aboutTitle.classList.add("title");
        aboutTitle.innerText = "About";
        aboutContent.innerText = projectData.about || "No additional information available.";

        aboutSection.appendChild(aboutTitle);
        aboutSection.appendChild(aboutContent);
        aboutSection.classList.add("about-section");
        infoSection.appendChild(aboutSection);

        infoSection.classList.add("info");
        popupBody.appendChild(infoSection);

        // Add text content
        projectData.text.forEach(text => {
            const paragraph = document.createElement("p");
            
            if (text.match(/<a (\w+)>([\w+\s]*)<\/a>/gm)) {
                const parts = text.split(/<a (\w+)>([\w+\s]*)<\/a>/gm);
                const beforeText = document.createTextNode(parts[0] || "");
                const link = document.createElement("a");
                const afterText = document.createTextNode(parts[3] || "");

                link.href = parts[1];
                link.innerHTML = parts[2];

                paragraph.appendChild(beforeText);
                paragraph.appendChild(link);
                paragraph.appendChild(afterText);
            } else {
                paragraph.innerHTML = text;
            }
            
            popupBody.appendChild(paragraph);
        });

        // Add footer note
        const footerNote = document.createElement("p");
        footerNote.classList.add("popup-footer-note");
        footerNote.innerHTML = projectData.footer;
        popupBody.appendChild(footerNote);
    }

    compositeMenu(menuItems) {
        const menuList = document.querySelector(".header .menu ul");
        const menuIcon = this.createBlock_svg_link({
            type: "svg_link",
            name: "link1",
            value: {
                path: "M5 8H25V10H5V8 14H25V16H5V14 20H25V22H5V20Z",
                width: "30",
                height: "30",
                viewbox: "0 0 30 30"
            }
        }, "menu-icon");
        const emailButton = document.createElement("button");
        const rightBody = document.querySelector(".pop-up-right-body");

        this.menu.insertBefore(menuIcon, menuList);
        menuIcon.addEventListener("click", this.openMenu);
        rightBody.appendChild(document.createElement("ul"));

        menuItems.forEach(item => {
            const menuLink = document.createElement("a");
            menuLink.setAttribute("value", item.page);
            menuLink.innerText = item.name;
            menuLink.href = item.href;

            if (item.default) {
                menuLink.classList.add("current");
            }

            const rightBodyLink = menuLink.cloneNode(true);

            menuLink.addEventListener("click", event => {
                this.rebuild(item.page);
                event.preventDefault();
            });

            rightBodyLink.addEventListener("click", event => {
                this.rebuild(item.page);
                rightBody.firstElementChild.querySelector(".current").classList.remove("current");
                event.currentTarget.classList.add("current");
                event.preventDefault();
            });

            menuList.appendChild(menuLink);
            rightBody.firstElementChild.appendChild(rightBodyLink);
        });

        emailButton.innerText = "Send Email";
        emailButton.addEventListener("click", () => this.rebuild("contact"));
        rightBody.appendChild(emailButton);
    }

    setSearchParameters(path, filter, project) {
        const queryString = `?path=${path}${filter ? "&filter=" + filter : ""}${project ? "&project=" + project : ""}`;
        window.history.pushState(
            { page: path },
            this.structure.pages[path].title,
            window.location.pathname + queryString
        );
    }

    setPath(path) {
        this.setSearchParameters(path, this.getFilter(), this.getProject());
    }

    setFilter(filter) {
        this.setSearchParameters(this.getPath(), filter, this.getProject());
    }

    setProject(project) {
        this.setSearchParameters(this.getPath(), this.getFilter(), project);
    }

    getPath(search) {
        const params = new URLSearchParams(search || window.location.search);
        return params.get("path") || "main";
    }

    getFilter(search) {
        const params = new URLSearchParams(search || window.location.search);
        return params.get("filter") || "all";
    }

    getProject(search) {
        const params = new URLSearchParams(search || window.location.search);
        return params.get("project") || null;
    }

    load() {
        console.log("File 'structure.json' loaded", this.structure);
        console.log("Current path:", this.currentPage);

        this.compositeMenu(this.structure.menu);
        this.rebuild(this.currentPage);
        this.projects = this.structure.projects;

        // Setup event handlers
        const closeProjectHandler = this.closeProject.bind(this);
        const closeMenuHandler = this.closeMenu.bind(this);
        const popup = document.querySelector(".pop-up");
        const popupContainer = document.querySelector(".pop-up-container");
        const closeIcon = popup.querySelector(".close-icon");
        const popupBody = document.querySelector(".pop-up-body");
        const logo = document.querySelector(".header .logo");

        [popup, popupContainer, closeIcon].forEach(element => {
            element.addEventListener("click", closeProjectHandler);
            element.addEventListener("click", closeMenuHandler);
        });

        popupBody.addEventListener("click", event => event.stopPropagation());

        logo.addEventListener("click", () => {
            if (this.getPath() !== "main") {
                this.rebuild("main");
            }
        });

        window.onpopstate = () => {
            this.rebuild(this.getPath());
        };
    }

    rebuild(path) {
        this.setPath(path);
        this.closeProject();
        this.currentPage = this.getPath(window.location.search);
        this.main.classList.remove("opacity-high");
        
        setTimeout(() => {
            this.build();
        }, 250);
    }
}