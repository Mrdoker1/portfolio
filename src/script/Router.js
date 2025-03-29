export default class Router {
    constructor(pageBuilder) {
        this.pageBuilder = pageBuilder;
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.onpopstate = () => {
            this.pageBuilder.rebuild(this.getPath());
        };
    }

    setHashParameters(path, filter, project) {
        let newHash = "#/";
        if (project) {
            newHash += "project/" + project;
        } else {
            newHash += path === "main" ? "main" : path;
        }
        
        if (filter && filter !== "all") {
            newHash += `?filter=${filter}`;
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
        this.setHashParameters(path, this.getFilter(), this.getProject());
    }

    setFilter(filter) {
        this.setHashParameters(this.getPath(), filter, this.getProject());
    }

    setProject(project) {
        this.setHashParameters(this.getPath(), this.getFilter(), project);
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

    handleURLChange() {
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