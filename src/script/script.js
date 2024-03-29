class PageBuilder {
    constructor() { this.catchJSON(), this.currentPage = this.getPath(window.location.search), this.menu = document.querySelector(".header div.menu"), this.main = document.querySelector("main") }
    catchJSON() { fetch("structure.json").then(a => a.json()).then(a => { this.structure = a, this.load() }) }
    build() {
        let a = this.structure.pages[this.currentPage].body;
        this.menu.querySelector(".current").classList.remove("current"), this.menu.querySelector(`a[value=${this.currentPage}`).classList.add("current"), this.getProject() && this.openProject(this.getProject()), this.main.innerHTML = "";
        for (let b = 0; b < a.length; b++)
            if ("box" == a[b].type) {
                let c = document.createElement("div");
                c.classList.add("box"), c.id = "box_" + b;
                for (let d = 0; d < a[b].value.length; d++) c.appendChild(this.blockBuild(a[b].value[d]));
                this.main.appendChild(c)
            } else this.main.appendChild(this.blockBuild(a[b]));
        this.main.classList.add("opacity-high")
    }
    blockBuild(a) { return this[`createBlock_${a.type}`] ? (console.log("Add block:", a.type, a.name, a.value), this[`createBlock_${a.type}`](a)) : (console.error("Unreleased block:", a.type), this.createBlock_default(a)) }
    createBlock_default(a) { let b = document.createElement("span"); return b.classList.add("default"), b.id = a.name, b.innerText = a.value, b }
    setPropertes(a, b) { b && (b["text-align"] && a.classList.add("text-align-" + b["text-align"]), b["align-self"] && a.classList.add("align-self-" + b["align-self"]), b.mobile && a.classList.add(`mobile-${b.mobile}`), b.desktop && a.classList.add(`desktop-${b.desktop}`), b.padding && a.classList.add("padding-" + b.padding), b.margin && a.classList.add("margin-" + b.margin)) }
    createBlock_filter(a) {
        let b = document.createElement("button"),
            c = document.createElement("span"),
            d = document.createElement("div"),
            f = document.createElement("ul"),
            e = document.createElement("img"),
            g = this.getFilter(window.location.search);
        g = g ? g : a.value.items[a.value.default].name, b.classList.add("filter"), b.id = a.name, b.setAttribute("value", g), c.id = a.name + "Title";
        for (let d, e = 0; e < a.value.items.length; e++) d = document.createElement("li"), d.setAttribute("value", a.value.items[e].name), d.innerText = a.value.items[e].value, a.value.items[e].name == g && (d.classList.add("selected"), c.innerText = a.value.items[e].value), d.addEventListener("click", d => {
            let e = new Event("filter");
            e.filter = d.target.getAttribute("value"), c.innerText = d.target.innerText, b.value = d.target.getAttribute("value"), f.querySelector("li.selected").classList.remove("selected"), d.target.classList.add("selected"), console.log(d.target), this.setFilter(e.filter), b.classList.remove("opened"), d.stopPropagation(), document.querySelector("#" + a.value.target).dispatchEvent(e)
        }), f.appendChild(d);
        return e.src = "./src/images/arrow-down.svg", d.classList.add("filterContainer"), d.appendChild(f), b.appendChild(c), b.appendChild(d), b.appendChild(e), this.setPropertes(b, a.propertes), b.addEventListener("click", a => { b.classList.add("opened"), a.stopPropagation() }), window.addEventListener("click", () => { b.classList.remove("opened") }), b
    }
    createBlock_grid(a) {
        let b = document.createElement("ol"),
            c = 0,
            d = function(a) {
                let c = document.createElement("li"),
                    d = document.createElement("span"),
                    e = document.createElement("span");
                c.id = "empty", d.classList.add("title"), e.classList.add("descr"), d.innerText = ":(", e.innerText = `No projects in '${a||"unknown"}' category`, c.appendChild(document.createElement("div")), c.firstElementChild.appendChild(d), c.firstElementChild.appendChild(e), b.appendChild(c)
            },
            f = function() {
                let a = document.querySelector("#empty");
                a && a.remove()
            };
        b.classList.add("grid"), b.id = a.name, b.setAttribute("value", a.filter);
        let g = this.getFilter(window.location.search);
        g || (g = a.filter);
        for (let d of Object.values(this.structure[a.value])) {
            let a = document.createElement("li"),
                e = document.createElement("img"),
                f = document.createElement("div"),
                h = document.createElement("span"),
                i = document.createElement("span");
            a.setAttribute("value", d.type), a.addEventListener("click", () => { this.openProject(d.name) }), e.src = d.images[d.preview], h.classList.add("title"), h.innerText = d.title, i.classList.add("descr"), i.innerText = d.description, f.appendChild(h), f.appendChild(i), a.appendChild(e), a.appendChild(f), "all" != g && d.type != g ? a.style.setProperty("display", "none") : c++, b.appendChild(a)
        }
        return 0 == c && d(g), b.addEventListener("filter", a => {
            let c = 0;
            for (let d of b.childNodes.values()) "all" == a.filter || d.getAttribute("value") == a.filter ? (d.style.setProperty("display", "initial"), c++) : d.style.setProperty("display", "none");
            0 == c ? d(a.filter) : f()
        }), this.setPropertes(b, a.propertes), b
    }
    createBlock_h1(a) { let b = document.createElement("span"); return b.classList.add("h1"), b.id = a.name, b.innerText = a.value, this.setPropertes(b, a.propertes), b }
    createBlock_toTopButton(a) {
        let b = document.createElement("div"),
            c = document.createElement("span");
        return b.classList.add("to-top-button"), b.id = a.name, c.innerText = a.value, b.appendChild(c), b.addEventListener("click", () => window.scrollTo(0, 0)), this.setPropertes(b, a.propertes), b
    }
    createBlock_caption(a) { let b = document.createElement("span"); return b.classList.add("caption"), b.id = a.name, b.innerText = a.value, this.setPropertes(b, a.propertes), b }
    createBlock_h0(a) { let b = document.createElement("span"); return b.classList.add("h0"), b.id = a.name, b.innerText = a.value, this.setPropertes(b, a.propertes), b }
    createBlock_picture(a) { let b = document.createElement("img"); return b.classList.add("picture"), b.id = a.name, b.src = a.value.src, b.alt = a.value.alt, b.style.cssText = a.style, this.setPropertes(b, a.propertes), b }
    createBlock_comment(a) {
        let b = document.createDocumentFragment();
        return b
    }
    createBlock_svg_link(a, b) {
        let c = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
            d = document.createElementNS("http://www.w3.org/2000/svg", "path");
        return c.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink"), c.setAttribute("class", b), c.setAttribute("width", a.value.width), c.setAttribute("height", a.value.height), c.setAttribute("viewbox", a.value.viewbox), c.setAttribute("fill", "none"), c.id = a.name, c.classList.add("link-icon"), d.setAttribute("d", a.value.path), d.setAttribute("fill", "black"), d.setAttribute("class", "svg-icon"), a.value.stroke_width ? d.setAttribute("stroke-width", a.value.stroke_width) : d.setAttribute("stroke-width", 0), a.value.stroke && d.setAttribute("stroke", a.value.stroke), c.appendChild(d), a.value.url && c.addEventListener("click", () => window.open(a.value.url)), this.setPropertes(c, a.propertes), c
    }
    createBlock_paragraph(a) { let b = document.createElement("p"); return b.classList.add("paragraph"), b.id = a.name, b.innerHTML = a.value, this.setPropertes(b, a.propertes), b }
    createBlock_br(a) { let b = document.createElement("br"); return b.id = a.name, this.setPropertes(b, a.propertes), b }
    createBlock_form(a) {
        let b = document.createElement("form"),
            c = document.createElement("input"),
            d = document.createElement("input"),
            e = document.createElement("textarea"),
            f = document.createElement("input"),
            g = document.createElement("div"),
            h = document.createElement("span"),
            i = document.createElement("a"),
            j = document.createElement("label");
        return b.setAttribute("action", a.value), b.setAttribute("method", "POST"), j.innerText = "Name", c.setAttribute("name", "name"), c.setAttribute("type", "text"), b.appendChild(j), b.appendChild(c), j = document.createElement("label"), j.innerText = "Email", d.setAttribute("name", "_replyto"), d.setAttribute("type", "email"), b.appendChild(j), b.appendChild(d), j = document.createElement("label"), j.innerText = "Message", e.setAttribute("name", "message"), b.appendChild(j), b.appendChild(e), i.href = `mailto:${a.email}`, i.innerText = "Send an Email", f.setAttribute("type", "submit"), f.setAttribute("value", "Send message"), f.classList.add("button"), h.appendChild(document.createTextNode(" or ")), h.appendChild(i), g.appendChild(f), g.appendChild(h), b.appendChild(g), b
    }
    openProject(a) {
        if (this.structure.projects[a]) {
            let b = document.querySelector(".pop-up"),
                c = b.querySelector(".pop-up-body"),
                d = this.structure.projects[a];
            this.compositePopUpBody(d), this.setProject(d.name), document.body.classList.add("no-scroll"), document.querySelector(".main").classList.add("blur"), b.classList.add("visible"), b.classList.remove("hidden"), c.classList.remove("hidden"), c.classList.add("visible"), b.scrollTo(0, 0)
        }
    }
    closeProject(a) {
        let b = document.querySelector(".pop-up"),
            c = b.querySelector(".pop-up-body");
        console.log(a);
        document.body.classList.remove("no-scroll"), document.querySelector(".main").classList.remove("blur"), b.classList.add("hidden"), b.classList.remove("visible"), c.classList.add("hidden"), c.classList.remove("visible"), this.setProject(null), a ? a.stopPropagation() : ''
    }
    openMenu() {
        let a = document.querySelector(".pop-up"),
            b = a.querySelector(".pop-up-right-body"),
            c = a.querySelector(".pop-up-body");
        b.classList.add("visible"), c.classList.add("hidden"), b.classList.remove("hidden"), c.classList.remove("visible"), document.body.classList.add("no-scroll"), document.querySelector(".main").classList.add("blur"), a.classList.add("visible"), a.classList.remove("hidden"), a.scrollTo(0, 0)
    }
    closeMenu(a) {
        let b = document.querySelector(".pop-up"),
            c = b.querySelector(".pop-up-right-body");
        document.body.classList.remove("no-scroll"), document.querySelector(".main").classList.remove("blur"), b.classList.add("hidden"), b.classList.remove("visible"), c.classList.remove("visible"), c.classList.add("hidden"), a.stopPropagation()
    }
    compositePopUpBody(a) {
        let b = document.createElement("span"),
            c = document.createElement("span"),
            d = document.createElement("div"),
            e = document.createElement("div"),
            f = document.querySelector(".pop-up-body"),
            g = document.createElement("div"),
            h = document.createElement("div"),
            j = function(a) { g.setAttribute("value", a), g.style.setProperty("background-image", `url("${h.firstElementChild.children[a].firstElementChild.src}")`), h.firstElementChild.querySelector(".selected").classList.remove("selected"), h.firstElementChild.children[a].classList.add("selected") };
        f.innerHTML = "", b.classList.add("title"), b.innerText = a.title, f.appendChild(b), c.classList.add("subtitle"), c.innerText = a.description, f.appendChild(c), g.classList.add("output"), g.appendChild(document.createElement("div")), g.appendChild(document.createElement("div")), g.firstElementChild.classList.add("arrow"), g.firstElementChild.classList.add("noselect"), g.firstElementChild.classList.add("left"), g.firstElementChild.addEventListener("click", () => {
            let a = parseInt(g.getAttribute("value")),
                b = 0 > a - 1 ? h.firstElementChild.childElementCount - 1 : a - 1;
            j(b)
        }), g.firstElementChild.appendChild(document.createElement("img")), g.firstElementChild.firstElementChild.setAttribute("src", "./src/images/arrow-down.svg"), g.children[1].classList.add("arrow"), g.children[1].classList.add("right"), g.children[1].classList.add("noselect"), g.children[1].addEventListener("click", () => {
            let a = (parseInt(g.getAttribute("value")) + 1) % h.firstElementChild.childElementCount;
            j(a)
        }), g.children[1].appendChild(document.createElement("img")), g.children[1].firstElementChild.setAttribute("src", "./src/images/arrow-down.svg"), h.classList.add("bar"), h.appendChild(document.createElement("ul"));
        for (let b, c = 0; c < a.images.length; c++) b = document.createElement("li"), b.setAttribute("value", c), b.appendChild(document.createElement("img")), b.firstElementChild.src = a.images[c], c == a.default && (b.classList.add("selected"), g.style.setProperty("background-image", `url("${a.images[c]}")`), g.setAttribute("value", c)), b.addEventListener("click", a => { h.firstElementChild.querySelector(".selected").classList.remove("selected"), a.currentTarget.classList.add("selected"), g.setAttribute("value", a.currentTarget.getAttribute("value")), g.style.setProperty("background-image", `url("${a.currentTarget.firstElementChild.src}")`) }), h.firstElementChild.appendChild(b);
        if (e.appendChild(g), e.appendChild(h), f.appendChild(e), a.customer) {
            let b = document.createElement("div"),
                c = document.createElement("span"),
                e = document.createElement("span");
            c.classList.add("title"), c.innerText = a.customer[0], e.innerText = a.customer[1], b.appendChild(c), b.appendChild(e), d.appendChild(b)
        }
        if (a.links) {
            let b = document.createElement("div"),
                c = document.createElement("span"),
                e = document.createElement("span");
            c.classList.add("title"), c.innerText = "Links";
            for (let b of a.links.values()) {
                let c = document.createElement("a");
                c.innerText = b.name, c.href = b.href, e.appendChild(c), e.appendChild(document.createTextNode(" "))
            }
            b.appendChild(c), b.appendChild(e), b.classList.add("project-links"), d.appendChild(b)
        }
        d.classList.add("info"), f.appendChild(d);
        for (let b of a.text.values()) {
            let c = document.createElement("p");
            if (b.match(/<a (\w+)>([\w+\s]*)<\/a>/gm)) {
                let d = b.split(/<a (\w+)>([\w+\s]*)<\/a>/gm),
                    e = document.createTextNode(d[0] || ""),
                    f = document.createElement("a"),
                    a = document.createTextNode(d[3] || "");
                f.href = d[1],
                    f.innerHTML = d[2],
                    c.appendChild(e),
                    c.appendChild(f),
                    c.appendChild(a)
            } else c.innerHTML = b;
            f.appendChild(c)
        }
        let x = document.createElement("p");
        x.classList.add("popup-footer-note");
        x.innerHTML += a.footer;
        f.appendChild(x)
    }
    compositeMenu(a) {
        let b = document.querySelector(".header .menu ul"),
            c = this.createBlock_svg_link({ type: "svg_link", name: "link1", value: { path: "M5 8H25V10H5V8 14H25V16H5V14 20H25V22H5V20Z", width: "30", height: "30", viewbox: "0 0 30 30" } }, "menu-icon"),
            d = document.createElement("button"),
            f = document.querySelector(".pop-up-right-body");
        this.menu.insertBefore(c, b), c.addEventListener("click", this.openMenu), f.appendChild(document.createElement("ul"));
        for (let c of a) {
            let a = document.createElement("a");
            a.setAttribute("value", c.page), a.innerText = c.name, a.href = c.href, c.default && a.classList.add("current");
            let d = a.cloneNode(!0);
            a.addEventListener("click", a => { this.rebuild(c.page), a.preventDefault() }), d.addEventListener("click", a => { this.rebuild(c.page), f.firstElementChild.querySelector(".current").classList.remove("current"), a.currentTarget.classList.add("current"), a.preventDefault() }), b.appendChild(a), f.firstElementChild.appendChild(d)
        }
        d.innerText = "Send Email", d.addEventListener("click", () => this.rebuild("contact")), f.appendChild(d)
    }
    setSearchParameters(a, b, c) { window.history.pushState({ page: a }, this.structure.pages[a].title, window.location.pathname + `?path=${a}${b?"&filter="+b:""}${c?"&project="+c:""}`) }
    setPath(a) { this.setSearchParameters(a, this.getFilter(), this.getProject()) }
    setFilter(a) { this.setSearchParameters(this.getPath(), a, this.getProject()) }
    setProject(a) { this.setSearchParameters(this.getPath(), this.getFilter(), a) }
    getPath(a) { let b = new URLSearchParams(a || window.location.search); return b.get("path") || "main" }
    getFilter(a) { let b = new URLSearchParams(a || window.location.search); return b.get("filter") || null }
    getProject(a) { let b = new URLSearchParams(a || window.location.search); return b.get("project") || null }
    load() {
        console.log("File 'structure.json' loaded", this.structure), console.log("Current path:", this.currentPage), this.compositeMenu(this.structure.menu), this.rebuild(this.currentPage), this.projects = this.structure.projects;
        let a = this.closeProject.bind(this),
            b = this.closeMenu.bind(this);
        document.querySelector(".pop-up").addEventListener("click", a), document.querySelector(".pop-up-container").addEventListener("click", a), document.querySelector(".pop-up > .close-icon").addEventListener("click", a), document.querySelector(".pop-up").addEventListener("click", b), document.querySelector(".pop-up-container").addEventListener("click", b), document.querySelector(".pop-up > .close-icon").addEventListener("click", b), document.querySelector(".pop-up-body").addEventListener("click", a => a.stopPropagation()), document.querySelector(".header .logo").addEventListener("click", () => { "main" != this.getPath() && this.rebuild("main") }), window.onpopstate = () => { this.rebuild(this.getPath()) }
    }
    rebuild(a) { this.setPath(a), this.closeProject(), this.currentPage = this.getPath(window.location.search), this.main.classList.remove("opacity-high"), setTimeout(() => { this.build() }, 250) }
}