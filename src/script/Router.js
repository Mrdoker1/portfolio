export default class Router {
    constructor(pageBuilder) {
        this.pageBuilder = pageBuilder;
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.onpopstate = async () => {
            await this.handleURLChange();
        };
    }

    setHashParameters(path, filter, project, lang) {
        let newHash = "#/";
        if (project) {
            newHash += "project/" + project;
        } else {
            newHash += path === "main" ? "main" : path;
        }
        
        const params = [];
        if (filter && filter !== "all") {
            params.push(`filter=${filter}`);
        }
        if (lang && lang !== "en") {
            params.push(`lang=${lang}`);
        }
        
        if (params.length > 0) {
            newHash += `?${params.join("&")}`;
        }
        
        window.history.pushState(
            { page: path },
            this.pageBuilder.structure.pages[path]?.title || "Страница",
            newHash
        );
    }

    getHashData() {
        const hash = window.location.hash.slice(1) || "/main";
        const [pathPart, queryPart] = hash.split("?");
        const page = pathPart.startsWith("/") ? pathPart.slice(1) : pathPart;
        const params = {};
        
        if (queryPart) {
            const searchParams = new URLSearchParams(queryPart);
            for (const [key, value] of searchParams.entries()) {
                params[key] = value;
            }
        }
        
        return { page, params };
    }

    setPath(path) {
        this.setHashParameters(path, this.getFilter(), this.getProject(), this.getLanguage());
    }

    setFilter(filter) {
        this.setHashParameters(this.getPath(), filter, this.getProject(), this.getLanguage());
    }

    setProject(project) {
        this.setHashParameters(this.getPath(), this.getFilter(), project, this.getLanguage());
    }

    setLanguage(lang) {
        this.setHashParameters(this.getPath(), this.getFilter(), this.getProject(), lang);
    }

    getPath() {
        const { page } = this.getHashData();
        if (page.startsWith("project/")) {
            return "main";
        }
        return page || "main";
    }

    getFilter() {
        const { params } = this.getHashData();
        return params.filter || "all";
    }

    getProject() {
        const { page, params } = this.getHashData();
        if (page.startsWith("project/")) {
            return page.split("/")[1] || null;
        }
        return params.project || null;
    }

    getLanguage() {
        // Сначала проверяем URL
        const { params } = this.getHashData();
        if (params.lang) {
            return params.lang;
        }
        
        // Если в URL нет языка, берем из LocalizationManager
        if (this.pageBuilder.localizationManager) {
            return this.pageBuilder.localizationManager.getCurrentLanguage();
        }
        
        // Fallback
        return "en";
    }

    async handleURLChange() {
        // Сначала обновляем язык если он изменился в URL
        if (this.pageBuilder.localizationManager) {
            await this.pageBuilder.localizationManager.updateLanguageFromURL();
        }
        
        const hash = window.location.hash.slice(1);
        
        if (hash.startsWith('/project/')) {
            const projectName = hash.split('/')[2];
            this.pageBuilder.currentPage = 'main';
            this.pageBuilder.build();
            if (projectName) {
                this.pageBuilder.openProject(projectName);
            }
        } else {
            const pagePath = hash.startsWith('/') ? hash.slice(1) : hash;
            this.pageBuilder.rebuild(pagePath || 'main');
        }
    }
} 