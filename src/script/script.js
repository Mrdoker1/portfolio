import Router from './Router.js';
import Filter from './components/Filter.js';
import Grid from './components/Grid.js';
import Component from './components/Component.js';
import LocalizationManager from './LocalizationManager.js';

export default class PageBuilder {
    constructor() {
        this.router = new Router(this);
        this.componentBase = new Component(this);
        this.currentPage = this.router.getPath();
        this.menu = document.querySelector(".header div.menu");
        this.main = document.querySelector("main");

        // Добавляем обработчик для клавиши Escape
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                this.closeProject();
            }
        });

        // Инициализируем локализацию
        this.initLocalization();
    }

    async initLocalization() {
        this.localizationManager = new LocalizationManager(this);
        await this.localizationManager.init();
        this.catchJSON();
    }

    async catchJSON() {
        // Если локализация уже инициализирована, используем её данные
        if (this.localizationManager) {
            this.structure = this.localizationManager.getLocaleData();
        } else {
            // Fallback для первоначальной загрузки
            const response = await fetch("structure.json");
            const data = await response.json();
            this.structure = data;
        }
        this.load();
    }

    build() {
        const pageContent = this.structure.pages[this.currentPage].body;
        
        // Обновляем состояние меню
        const currentMenuLink = this.menu.querySelector(".current");
        if (currentMenuLink) {
            currentMenuLink.classList.remove("current");
        }
        const newMenuLink = this.menu.querySelector(`a[value=${this.currentPage}]`);
        if (newMenuLink) {
            newMenuLink.classList.add("current");
        }
        
        // Открываем проект, если он указан в URL
        const projectFromURL = this.router.getProject();
        if (projectFromURL && !document.querySelector(".pop-up.visible")) {
            this.openProject(projectFromURL);
        }

        // Очищаем и перестраиваем основной контент с анимацией
        this.main.classList.add("fade-out");
        setTimeout(() => {
            this.main.innerHTML = "";
            const fragment = document.createDocumentFragment();
            
            pageContent.forEach((section, index) => {
                fragment.appendChild(this.blockBuild(section, index));
            });
            
            this.main.appendChild(fragment);
            this.main.classList.remove("fade-out");
            this.main.classList.add("fade-in");
        }, 250);
    }

    blockBuild(blockData, index) {
        // Используем компонентный подход для фильтра и сетки
        switch (blockData.type) {
            case 'filter':
                return new Filter(blockData, this).element;
            case 'grid':
                return new Grid(blockData, this).element;
            default:
                const blockMethod = `createBlock_${blockData.type}`;
                if (this[blockMethod]) {
                    console.log("Add block:", blockData.type, blockData.name, blockData.value);
                    return this[blockMethod](blockData, index);
                } else {
                    console.error("Unreleased block:", blockData.type);
                    return this.createBlock_default(blockData);
                }
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
        this.componentBase.setProperties(element, properties);
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
        const container = document.createElement("div");
        const button = document.createElement("button");
        
        container.classList.add("to-top-button");
        container.id = data.name;
        button.innerText = data.value;
        
        button.addEventListener("click", () => window.scrollTo(0, 0));
        
        container.appendChild(button);
        this.SetProperties(container, data.properties);
        return container;
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
        image.classList.add("picture", "skeleton");
        image.id = data.name;
        image.src = data.value.src;
        image.alt = data.value.alt;
        image.style.cssText = data.style;

        // Используем более эффективный способ для обработки события загрузки
        const handleLoad = () => {
            image.classList.remove("skeleton");
            image.removeEventListener("load", handleLoad);
        };
        
        image.addEventListener("load", handleLoad);

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
        svg.setAttribute("viewBox", data.value.viewBox || "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.id = data.name;
        svg.classList.add("link-icon");

        path.setAttribute("d", data.value.path);
        path.setAttribute("fill", data.value.fill);
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
        
        // Создаем структуру формы
        const createFormField = (labelText, name, type, required = true) => {
            const label = document.createElement("label");
            label.innerText = labelText;
            
            const input = type === "textarea" 
                ? document.createElement("textarea") 
                : document.createElement("input");
                
            if (type !== "textarea") {
                input.setAttribute("type", type);
            }
            
            input.setAttribute("name", name);
            
            if (required) {
                input.setAttribute("required", "true");
            }
            
            form.appendChild(label);
            form.appendChild(input);
            
            return input;
        };
        
        form.setAttribute("action", data.value);
        form.setAttribute("method", "POST");

        // Создаем поля формы
        const nameInput = createFormField("Name", "name", "text");
        const emailInput = createFormField("Email", "_replyto", "email");
        const messageInput = createFormField("Message", "message", "textarea");

        // Создаем кнопку отправки и альтернативную ссылку
        const buttonContainer = document.createElement("div");
        const submitButton = document.createElement("input");
        const orSpan = document.createElement("span");
        const emailLink = document.createElement("a");

        submitButton.setAttribute("type", "submit");
        submitButton.setAttribute("value", "Send Message");
        submitButton.classList.add("button");
        
        emailLink.href = `mailto:${data.email}`;
        emailLink.innerText = "Send an Email";
        
        orSpan.appendChild(document.createTextNode(" or "));
        orSpan.appendChild(emailLink);
        
        buttonContainer.appendChild(submitButton);
        buttonContainer.appendChild(orSpan);
        
        form.appendChild(buttonContainer);

        // Валидация формы
        form.addEventListener("submit", (event) => {
            if (!nameInput.value || !emailInput.value || !messageInput.value) {
                event.preventDefault();
                alert("Please fill out all fields before submitting the form.");
            }
        });

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
                this.router.setPath(data.value.route);
                this.rebuild(data.value.route);
            });
        }

        this.SetProperties(button, data.properties);
        return button;
    }

    createBlock_box(data, index) {
        const box = document.createElement("div");
        box.classList.add("box");
        box.id = `box_${index}`;
        
        const fragment = document.createDocumentFragment();
        data.value.forEach((item, idx) => {
            fragment.appendChild(this.blockBuild(item, idx));
        });
        
        box.appendChild(fragment);
        this.SetProperties(box, data.properties);
        return box;
    }

    openProject(projectName) {
        if (!this.structure.projects[projectName]) return;

        const popup = document.querySelector(".pop-up");
        const popupBody = popup.querySelector(".pop-up-body");
        const projectData = this.structure.projects[projectName];

        this.compositePopUpBody(projectData);
        this.router.setProject(projectData.name);

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
            this.router.setProject(null);
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
        // Создаем фрагмент для улучшения производительности
        const fragment = document.createDocumentFragment();
        const title = document.createElement("span");
        const subtitle = document.createElement("span");
        const infoSection = document.createElement("div");
        const contentContainer = document.createElement("div");
        const popupBody = document.querySelector(".pop-up-body");
        const imageViewer = document.createElement("div");
        const imageBar = document.createElement("div");

        // Очищаем существующий контент
        popupBody.innerHTML = "";

        // Функция для обновления выбранного изображения
        const updateSelectedImage = (index) => {
            imageViewer.setAttribute("value", index);
            imageViewer.style.setProperty("background-image", 
                `url("${imageBar.firstElementChild.children[index].firstElementChild.src}")`);
            
            const previousSelected = imageBar.firstElementChild.querySelector(".selected");
            if (previousSelected) {
                previousSelected.classList.remove("selected");
            }
            
            imageBar.firstElementChild.children[index].classList.add("selected");
        };

        // Добавляем заголовок и подзаголовок
        title.classList.add("title");
        title.innerText = projectData.title;
        fragment.appendChild(title);

        subtitle.classList.add("subtitle");
        subtitle.innerText = projectData.description;
        fragment.appendChild(subtitle);

        // Настраиваем просмотрщик изображений
        imageViewer.classList.add("output");
        
        // Создаем стрелки навигации
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
            const totalImages = imageBar.firstElementChild.childElementCount;
            const newIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
            updateSelectedImage(newIndex);
        });

        rightArrow.addEventListener("click", () => {
            const currentIndex = parseInt(imageViewer.getAttribute("value"));
            const totalImages = imageBar.firstElementChild.childElementCount;
            const newIndex = (currentIndex + 1) % totalImages;
            updateSelectedImage(newIndex);
        });

        imageViewer.appendChild(leftArrow);
        imageViewer.appendChild(rightArrow);

        // Создаем галерею изображений
        imageBar.classList.add("bar");
        const imageList = document.createElement("ul");
        imageBar.appendChild(imageList);

        projectData.images.forEach((imageSrc, index) => {
            const imageItem = document.createElement("li");
            const image = document.createElement("img");
            
            imageItem.setAttribute("value", index);
            image.src = imageSrc;
            image.classList.add("skeleton");
            
            // Эффективная обработка загрузки изображения
            const handleLoad = () => {
                image.classList.remove("skeleton");
                image.removeEventListener("load", handleLoad);
            };
            
            image.addEventListener("load", handleLoad);
            
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
        fragment.appendChild(contentContainer);

        // Информация о клиенте
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

        // Ссылки проекта
        if (projectData.links) {
            const linksSection = document.createElement("div");
            const linksTitle = document.createElement("span");
            const linksList = document.createElement("span");

            linksTitle.classList.add("title");
            
            // Проверяем новую структуру с локализацией [title, links_array] или старую структуру
            if (Array.isArray(projectData.links) && typeof projectData.links[0] === 'string') {
                // Новая структура: ["Links", [{name: "...", href: "..."}]]
                linksTitle.innerText = projectData.links[0];
                const linksArray = projectData.links[1];
                
                linksArray.forEach(link => {
                    const linkElement = document.createElement("a");
                    linkElement.innerText = link.name;
                    linkElement.href = link.href;
                    linkElement.setAttribute("target", "_blank");
                    linkElement.setAttribute("rel", "noopener noreferrer");
                    linksList.appendChild(linkElement);
                    linksList.appendChild(document.createTextNode(" "));
                });
            } else {
                // Старая структура: [{name: "...", href: "..."}]
                linksTitle.innerText = "Links";
                
                projectData.links.forEach(link => {
                    const linkElement = document.createElement("a");
                    linkElement.innerText = link.name;
                    linkElement.href = link.href;
                    linkElement.setAttribute("target", "_blank");
                    linkElement.setAttribute("rel", "noopener noreferrer");
                    linksList.appendChild(linkElement);
                    linksList.appendChild(document.createTextNode(" "));
                });
            }

            linksSection.appendChild(linksTitle);
            linksSection.appendChild(linksList);
            linksSection.classList.add("project-links");
            infoSection.appendChild(linksSection);
        }

        // Размер команды
        if (projectData.team_size) {
            const teamSection = document.createElement("div");
            const teamTitle = document.createElement("span");
            const teamInfo = document.createElement("span");

            teamTitle.classList.add("title");
            teamTitle.innerText = projectData.team_size[0];
            teamInfo.innerText = projectData.team_size[1];

            teamSection.appendChild(teamTitle);
            teamSection.appendChild(teamInfo);
            infoSection.appendChild(teamSection);
        }

        // База пользователей
        if (projectData.user_base) {
            const userSection = document.createElement("div");
            const userTitle = document.createElement("span");
            const userInfo = document.createElement("span");

            userTitle.classList.add("title");
            userTitle.innerText = projectData.user_base[0];
            userInfo.innerText = projectData.user_base[1];

            userSection.appendChild(userTitle);
            userSection.appendChild(userInfo);
            infoSection.appendChild(userSection);
        }

        // Раздел "О проекте"
        const aboutSection = document.createElement("div");
        const aboutTitle = document.createElement("span");
        const aboutContent = document.createElement("p");

        aboutTitle.classList.add("title");
        
        // Проверяем структуру поля about
        if (Array.isArray(projectData.about) && projectData.about.length === 2) {
            // Новая структура: ["About", "content"]
            aboutTitle.innerText = projectData.about[0];
            aboutContent.innerText = projectData.about[1];
        } else {
            // Старая структура: просто строка
            aboutTitle.innerText = "About";
            aboutContent.innerText = projectData.about || "No additional information available.";
        }

        aboutSection.appendChild(aboutTitle);
        aboutSection.appendChild(aboutContent);
        aboutSection.classList.add("about-section");
        infoSection.appendChild(aboutSection);

        infoSection.classList.add("info");
        fragment.appendChild(infoSection);

        // Добавляем текстовый контент
        if (projectData.text && Array.isArray(projectData.text)) {
            projectData.text.forEach(text => {
                const paragraph = document.createElement("p");
                paragraph.innerHTML = text;
                fragment.appendChild(paragraph);
            });
        }

        // Добавляем подвал с примечанием
        const footerNote = document.createElement("p");
        footerNote.classList.add("popup-footer-note");
        
        if (projectData.footer) {
            if (typeof projectData.footer === 'string') {
                footerNote.innerHTML = projectData.footer;
            } else if (projectData.footer.type === "contact-link") {
                const link = document.createElement("a");
                link.classList.add("link");
                link.innerText = projectData.footer.linkText;
                link.addEventListener("click", () => {
                    this.closeProject();
                    setTimeout(() => {
                        window.location.hash = '#/contact';
                        this.rebuild('contact');
                    }, 300);
                });
                footerNote.appendChild(document.createTextNode(projectData.footer.prefix || ''));
                footerNote.appendChild(link);
                footerNote.appendChild(document.createTextNode(projectData.footer.suffix || ''));
            }
        }
        
        fragment.appendChild(footerNote);
        
        // Добавляем все элементы в DOM за один раз
        popupBody.appendChild(fragment);
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

        // Подготавливаем меню
        this.menu.insertBefore(menuIcon, menuList);
        menuIcon.addEventListener("click", this.openMenu.bind(this));
        rightBody.appendChild(document.createElement("ul"));

        // Создаем элементы меню
        const menuFragment = document.createDocumentFragment();
        const rightBodyFragment = document.createDocumentFragment();

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
                const currentActive = rightBody.firstElementChild.querySelector(".current");
                if (currentActive) {
                    currentActive.classList.remove("current");
                }
                event.currentTarget.classList.add("current");
                event.preventDefault();
            });

            menuFragment.appendChild(menuLink);
            rightBodyFragment.appendChild(rightBodyLink);
        });

        menuList.appendChild(menuFragment);
        rightBody.firstElementChild.appendChild(rightBodyFragment);

        // Добавляем кнопку отправки email
        emailButton.innerText = "Send Email";
        emailButton.addEventListener("click", () => this.rebuild("contact"));
        rightBody.appendChild(emailButton);
    }

    load() {
        console.log("File 'structure.json' loaded", this.structure);
        console.log("Current path:", this.currentPage);

        this.compositeMenu(this.structure.menu);
        this.rebuild(this.currentPage);
        this.projects = this.structure.projects;

        // Настраиваем обработчики событий
        const closeProjectHandler = this.closeProject.bind(this);
        const closeMenuHandler = this.closeMenu.bind(this);
        const popup = document.querySelector(".pop-up");
        const popupContainer = document.querySelector(".pop-up-container");
        const closeIcon = popup.querySelector(".close-icon");
        const popupBody = document.querySelector(".pop-up-body");
        const logo = document.querySelector(".header .logo");

        // Используем делегирование событий для повышения производительности
        [popup, popupContainer, closeIcon].forEach(element => {
            element.addEventListener("click", event => {
                closeProjectHandler(event);
                closeMenuHandler(event);
            });
        });

        popupBody.addEventListener("click", event => event.stopPropagation());

        logo.addEventListener("click", () => {
            if (this.router.getPath() !== "main") {
                this.rebuild("main");
            }
        });
    }

    rebuild(path) {
        const currentHash = window.location.hash;
        // Не обновляем URL если это project route
        if (!currentHash.startsWith('#/project/')) {
            this.router.setPath(path);
        }
        this.currentPage = path;
        this.main.classList.remove("opacity-high");
        
        setTimeout(() => {
            this.build();
        }, 250);
    }
}