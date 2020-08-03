class PageBuilder{
    constructor(){
        this.catchJSON();
        this.currentPage = this.getPath(window.location.search);
        this.menu = document.querySelector(".header div.menu");
        this.main = document.querySelector("main");
    }
    catchJSON(){
        fetch("structure.json")
            .then(response => response.json())
            .then(json =>{
                this.structure = json;
                this.load();
            });
    }
    build(){
        let blockList = this.structure.pages[this.currentPage].body;

        this.menu.querySelector(".current").classList.remove("current");
        this.menu.querySelector(`li[value=${this.currentPage}`).classList.add("current");
        if(this.getProject()){
            this.openProject(this.getProject());
        }

        this.main.innerHTML = "";

        for(let i=0; i<blockList.length; i++){
            if(blockList[i].type == "box"){
                let box = document.createElement("div");
                box.classList.add("box");
                box.id = "box_"+i;

                for(let j=0; j<blockList[i].value.length; j++){
                    box.appendChild(this.blockBuild(blockList[i].value[j]));
                }
                this.main.appendChild(box);
            }else{
                this.main.appendChild(this.blockBuild(blockList[i]));
            }
        }
    }
    blockBuild(block){
        if(this[`createBlock_${block.type}`]){
            console.log("Add block:", block.type, block.name, block.value);
            return this[`createBlock_${block.type}`](block);
        }else{
            console.error("Unreleased block:", block.type);
            return this.createBlock_default(block);
        }
    }
    createBlock_default(data){
        let block = document.createElement("span");
        block.classList.add("default");
        block.id = data.name;
        block.innerText = data.value;

        return block;
    }
    setPropertes(target, propertes){
        if(!propertes) return;
        
        if(propertes["text-align"]){
            target.classList.add("text-align-"+propertes["text-align"])
        }

        if(propertes["align-self"]){
            target.classList.add("align-self-"+propertes["align-self"])
        }
        
        if(propertes["mobile"]){
            target.classList.add(`mobile-${propertes["mobile"]}`)
        }

        if(propertes["desktop"]){
            target.classList.add(`desktop-${propertes["desktop"]}`)
        }

        if(propertes.padding){
            target.classList.add("padding-"+propertes.padding)
        }

        if(propertes.margin){
            target.classList.add("margin-"+propertes.margin)
        }
    }
    createBlock_filter(data){
        let block = document.createElement("button"),
            span = document.createElement("span"),
            ul = document.createElement("ul"),
            img = document.createElement("img"),
            defaultFilter = this.getFilter(window.location.search);

        defaultFilter = defaultFilter? defaultFilter: data.value.items[data.value.default].name;

        block.classList.add("filter");
        block.id = data.name;
        block.setAttribute("value", defaultFilter);

        span.id = data.name+"Title";

        for(let i=0; i<data.value.items.length; i++){
            let li = document.createElement("li");
            li.setAttribute("value",data.value.items[i].name);
            li.innerText = data.value.items[i].value;
            if(data.value.items[i].name == defaultFilter){
                li.classList.add("selected");
                span.innerText = data.value.items[i].value;
            }

            li.addEventListener("click",(e)=>{
                let filterEvent = new Event("filter");
                filterEvent.filter = e.target.getAttribute("value");
                
                span.innerText = e.target.innerText;
                block.value = e.target.getAttribute("value");
                ul.querySelector("li.selected").classList.remove("selected");
                e.target.classList.add("selected");

                this.setFilter(filterEvent.filter);

                document.querySelector("#"+data.value.target)
                    .dispatchEvent(filterEvent);
            })

            ul.appendChild(li);
        }

        img.src = "./src/images/arrow-down.svg";
        //ul.style.setProperty("display", "none");

        block.appendChild(span);
        block.appendChild(ul);
        block.appendChild(img);

        this.setPropertes(block, data.propertes);

        block.addEventListener("click", (e)=>{
            /*if(block.childNodes[1].style.getPropertyValue("display") == "none")
                block.childNodes[1].style.setProperty("display","initial");
            else 
                block.childNodes[1].style.setProperty("display","none");*/
            block.classList.toggle("opened");
            e.stopPropagation();
            window.addEventListener("click", ()=>{
                block.classList.remove("opened");
                //block.childNodes[1].style.setProperty("display","none");
            }, {once : true});
        })

        return block;
    }
    createBlock_grid(data){
        let block = document.createElement("ol");

        block.classList.add("grid");
        block.id = data.name;
        block.setAttribute("value",data.filter);

        let filter = this.getFilter(window.location.search);
        if(!filter) filter = data.filter;

        for(let p of Object.values(this.structure[data.value])){
            let li = document.createElement("li"),
                img = document.createElement("img"),
                div = document.createElement("div"),
                title = document.createElement("span"),
                descr = document.createElement("span");

            li.setAttribute("value", p.type);
            li.addEventListener("click",(e)=>{
                this.openProject(p.name);
            })
            
            img.src = p.images[p.preview];

            title.classList.add("title");
            title.innerText = p.title;

            /*if(data.value[i].region){
                let region = document.createElement("span");
                region.innerText = data.value[i].region.toUpperCase();
                title.appendChild(region);
            }*/

            descr.classList.add("descr");
            descr.innerText = p.description;

            div.appendChild(title);
            div.appendChild(descr);

            li.appendChild(img);
            li.appendChild(div);

            if((filter != "all") && (p.type != filter)) li.style.setProperty("display", "none");

            block.appendChild(li);
        }

        block.addEventListener("filter",(e)=>{
            for(let li of block.childNodes.values()){
                if((e.filter == "all") || li.getAttribute("value") == e.filter)
                    li.style.setProperty("display","initial");
                else
                    li.style.setProperty("display","none");
            }
        });

        this.setPropertes(block, data.propertes);

        return block;
    }
    createBlock_h1(data){
        let block = document.createElement("span");
        block.classList.add("h1");
        block.id = data.name;
        block.innerText = data.value;

        this.setPropertes(block, data.propertes);

        return block;
    }
    createBlock_toTopButton(data){
        let block = document.createElement("div"),
            span = document.createElement("span");

        block.classList.add("to-top-button");
        block.id = data.name;

        span.innerText = data.value;
        block.appendChild(span);
        block.addEventListener("click",()=>window.scrollTo(0,0));

        this.setPropertes(block, data.propertes);

        return block;
    }
    createBlock_caption(data){
        let block = document.createElement("span");
        block.classList.add("caption");
        block.id = data.name;
        block.innerText = data.value;

        this.setPropertes(block, data.propertes);

        return block;
    }
    createBlock_h0(data){
        let block = document.createElement("span");
        block.classList.add("h0");
        block.id = data.name;
        block.innerText = data.value;

        this.setPropertes(block, data.propertes);

        return block;
    }
    createBlock_picture(data){
        let block = document.createElement("img");
        block.classList.add("picture");
        block.id = data.name;
        block.src = data.value.src;
        block.alt = data.value.alt;

        this.setPropertes(block, data.propertes);

        return block;
    }
    createBlock_svg_link(data, className){
        let block = document.createElementNS("http://www.w3.org/2000/svg","svg"),
            path = document.createElementNS("http://www.w3.org/2000/svg","path");

        block.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        block.setAttribute("class", className);
        block.setAttribute("width", data.value.width);
        block.setAttribute("height", data.value.height);
        block.setAttribute("viewbox", data.value.viewbox);
        block.setAttribute("fill", "none");
        block.id = data.name;
        block.classList.add("link-icon");
        path.setAttribute("d", data.value.path);
        path.setAttribute("fill", "black");
        path.setAttribute("class", "svg-icon");
        block.appendChild(path);
        
        this.setPropertes(block, data.propertes);

        return block;
    }
    createBlock_paragraph(data){
        let block = document.createElement("p");
        block.classList.add("paragraph");
        block.id = data.name;
        block.innerHTML = data.value;
        
        this.setPropertes(block, data.propertes);

        return block;
    }
    createBlock_br(data){
        let block = document.createElement("br");
        block.id = data.name;
        
        this.setPropertes(block, data.propertes);

        return block;
    }
    createBlock_form(data){
        let form = document.createElement("form"),
            inputName = document.createElement("input"),
            inputEmail = document.createElement("input"),
            inputMessage = document.createElement("textarea"),
            inputSubmit = document.createElement("input"),
            submitBlock = document.createElement("div"),
            submitSpan = document.createElement("span"),
            sendEmailLink = document.createElement("a"),
            label = document.createElement("label");

            form.setAttribute("action", data.value);
            form.setAttribute("method", "POST");
            
            label.innerText = "Name";
            inputName.setAttribute("name","name");
            inputName.setAttribute("type","text");
            form.appendChild(label);
            form.appendChild(inputName);

            label = document.createElement("label");
            label.innerText = "Email";
            inputEmail.setAttribute("name","_replyto");
            inputEmail.setAttribute("type","email");
            form.appendChild(label);
            form.appendChild(inputEmail);
            
            label = document.createElement("label");
            label.innerText = "Message";
            inputMessage.setAttribute("name","message");
            form.appendChild(label);
            form.appendChild(inputMessage);

            sendEmailLink.href = `mailto:${data.email}`;
            sendEmailLink.innerText = "Send an Email";
            inputSubmit.setAttribute("type", "submit");
            inputSubmit.setAttribute("value", "Send message");
            submitSpan.appendChild(document.createTextNode(" or "));
            submitSpan.appendChild(sendEmailLink);
            submitBlock.appendChild(inputSubmit);
            submitBlock.appendChild(submitSpan);

            form.appendChild(submitBlock);

            return form;

        /* <form action="https://formspree.io/xeqrvpvw" method="POST">
            <input type="text" name="name">
            <input type="email" name="_replyto">
            <input type="submit" value="Send">
        </form> */
    }

    openProject(project){
        if(this.structure.projects[project]){
            let popUp = document.querySelector(".pop-up"),
                popUpBody = popUp.querySelector(".pop-up-body"),
                data = this.structure.projects[project];
            this.compositePopUpBody(data);

            this.setProject(data.name);
            document.body.classList.add("no-scroll");
            document.querySelector(".main").classList.add("blur");
            popUp.classList.add("visible");
            popUp.classList.remove("hidden");
            popUpBody.classList.remove("hidden");
            popUpBody.classList.add("visible");
            popUp.scrollTo(0,0);
        }
    }
    closeProject(e){
        let popUp = document.querySelector(".pop-up"),
            popUpBody = popUp.querySelector(".pop-up-body");

        document.body.classList.remove("no-scroll");
        document.querySelector(".main").classList.remove("blur");
        popUp.classList.add("hidden");
        popUp.classList.remove("visible");
        popUpBody.classList.add("hidden");
        popUpBody.classList.remove("visible");
        this.setProject(null);
        e.stopPropagation();
    }
    openMenu(project){
        let popUp = document.querySelector(".pop-up"),
            popUpRightBody = popUp.querySelector(".pop-up-right-body"),
            popUpBody = popUp.querySelector(".pop-up-body");

        popUpRightBody.classList.add("visible");
        popUpBody.classList.add("hidden");
        popUpRightBody.classList.remove("hidden");
        popUpBody.classList.remove("visible");

        document.body.classList.add("no-scroll");
        document.querySelector(".main").classList.add("blur");
        popUp.classList.add("visible");
        popUp.classList.remove("hidden");
        popUp.scrollTo(0,0);
    }
    closeMenu(e){
        let popUp = document.querySelector(".pop-up"),
            popUpRightBody = popUp.querySelector(".pop-up-right-body");

        document.body.classList.remove("no-scroll");
        document.querySelector(".main").classList.remove("blur");
        popUp.classList.add("hidden");
        popUp.classList.remove("visible");
        popUpRightBody.classList.remove("visible");
        popUpRightBody.classList.add("hidden");
        e.stopPropagation();
    }
    compositePopUpBody(data){
        let title = document.createElement("span"),
            subtitle = document.createElement("span"),
            info = document.createElement("div"),
            slider = document.createElement("div"),
            body = document.querySelector(".pop-up-body"),
            out = document.createElement("div"),
            bar = document.createElement("div"),
            change = function(i){
                out.setAttribute("value", i);
                out.style.setProperty("background-image",`url("${bar.firstElementChild.children[i].firstElementChild.src}")`);
                bar.firstElementChild.querySelector(".selected").classList.remove("selected");
                bar.firstElementChild.children[i].classList.add("selected");
            },
            scroll = function(e){
                console.log(e.deltaY)
                bar.scrollTo(bar.scrollLeft + e.deltaY, bar.scrollTop);
                e.stopPropagation();
            };

        body.innerHTML = "";

        title.classList.add("title");
        title.innerText = data.title;
        body.appendChild(title);

        subtitle.classList.add("subtitle");
        subtitle.innerText = data.description;
        body.appendChild(subtitle);

        //slider init
        out.classList.add("output");

        out.appendChild(document.createElement("div"));
        out.appendChild(document.createElement("div"));
        out.firstElementChild.classList.add("arrow");
        out.firstElementChild.classList.add("left");
        out.firstElementChild.addEventListener("click",(e)=>{
            let current = parseInt(out.getAttribute("value")),
                i = (current-1) < 0? bar.firstElementChild.childElementCount-1 : current-1;
            
            change(i);
        });
        out.firstElementChild.appendChild(document.createElement("img"));
        out.firstElementChild.firstElementChild.setAttribute("src", "./src/images/arrow-down.svg");
        out.children[1].classList.add("arrow");
        out.children[1].classList.add("right");
        out.children[1].addEventListener("click",(e)=>{
            let i = (parseInt(out.getAttribute("value"))+1)%bar.firstElementChild.childElementCount;
            
            change(i);    
        });
        out.children[1].appendChild(document.createElement("img"));
        out.children[1].firstElementChild.setAttribute("src", "./src/images/arrow-down.svg");

        bar.classList.add("bar");
        bar.appendChild(document.createElement("ul"));
        for(let i=0; i<data.images.length; i++){
            let li = document.createElement("li");
            li.setAttribute("value",i);
            li.appendChild(document.createElement("img"));
            li.firstElementChild.src = data.images[i];
            if(i == data.default) {
                li.classList.add("selected");
                out.style.setProperty("background-image",`url("${data.images[i]}")`);
                out.setAttribute("value", i); 
            }
            li.addEventListener("click",(e)=>{
                bar.firstElementChild.querySelector(".selected").classList.remove("selected");
                e.currentTarget.classList.add("selected");
                out.setAttribute("value", e.currentTarget.getAttribute("value"));
                out.style.setProperty("background-image",`url("${e.currentTarget.firstElementChild.src}")`);
            })
            bar.firstElementChild.appendChild(li);
        }
        //bar.addEventListener("wheel",scroll);
        //bar.addEventListener("scroll",scroll);

        slider.appendChild(out);
        slider.appendChild(bar);
        body.appendChild(slider);

        //info init
        if(data.customer){
            let customer = document.createElement("div"),
                key = document.createElement("span"),
                value = document.createElement("span");

            key.classList.add("title");
            key.innerText = data.customer[0];
            value.innerText = data.customer[1];

            customer.appendChild(key);
            customer.appendChild(value);
            info.appendChild(customer);
        }
        if(data.links){
            let links = document.createElement("div"),
                key = document.createElement("span"),
                value = document.createElement("span");

            key.classList.add("title");
            key.innerText = "🔗 Project Links";
            for(let link of data.links.values()){
                let a = document.createElement("a");
                a.innerText = link.name;
                a.href = link.href;
                value.appendChild(a);
                value.appendChild(document.createTextNode(", "));
            }

            links.appendChild(key);
            links.appendChild(value);
            info.appendChild(links);
        }
        info.classList.add("info");
        body.appendChild(info);


        for(let text of data.text.values()){
            let p = document.createElement("p");
            if(text.match(/<a (\w+)>([\w+\s]*)<\/a>/gm)){
                let s = text.split(/<a (\w+)>([\w+\s]*)<\/a>/gm),
                    start = document.createTextNode(s[0] || ""),
                    a = document.createElement("a"),
                    end = document.createTextNode(s[3] || "");

                    a.href = s[1];
                    a.innerText = s[2];

                    p.appendChild(start);
                    p.appendChild(a);
                    p.appendChild(end);
            }else{
                p.innerText = text;
            }
            body.appendChild(p);
        }
    }
    compositeMenu(menu){
        let out = document.querySelector(".header .menu ul"),
            burger = this.createBlock_svg_link({
                "type":"svg_link",
                "name":"link1",
                "value":{ "url": "www.behance.net/kubic",
                    "path": "M5 8H25V10H5V8 14H25V16H5V14 20H25V22H5V20Z",
                    "width": "30",
                    "height": "30",
                    "viewbox": "0 0 30 30"
                }
            }, "menu-icon"),
            sendMessage = document.createElement("button"),
            popUpMenu = document.querySelector(".pop-up-right-body");

        this.menu.insertBefore(burger, out);
        burger.addEventListener("click",this.openMenu);
        popUpMenu.appendChild(document.createElement("ul"));

        for(let i of menu){
            let li = document.createElement("li");
            li.setAttribute("value", i.page);
            li.innerText = i.name;
            if(i.default) li.classList.add("current");
            let clone = li.cloneNode(true)
            li.addEventListener("click",(e)=> this.rebuild(i.page));
            clone.addEventListener("click",(e)=> this.rebuild(i.page));
            out.appendChild(li);
            popUpMenu.firstElementChild.appendChild(clone);
        }

        sendMessage.innerText = "Send Email";
        sendMessage.addEventListener("click", (e)=>this.rebuild("contact"));
        popUpMenu.appendChild(sendMessage);
    }

    setSearchParameters(page, filter, project){
        window.history.replaceState({},
            this.structure.pages[page].title,
            window.location.pathname + `?path=${page}${filter?"&filter="+filter:""}${project?"&project="+project:""}`);
    }
    setPath(path){
        this.setSearchParameters(path,this.getFilter(),this.getProject());
    }
    setFilter(filter){
        this.setSearchParameters(this.getPath(),filter,this.getProject());
    }
    setProject(project){
        this.setSearchParameters(this.getPath(),this.getFilter(),project)
    }
    getPath(searchString){
        let searchParams = new URLSearchParams(searchString||window.location.search);
        return searchParams.get("path") || "main";
    }
    getFilter(searchString){
        let searchParams = new URLSearchParams(searchString||window.location.search);
        return searchParams.get("filter") || null;
    }
    getProject(searchString){
        let searchParams = new URLSearchParams(searchString||window.location.search);
        return searchParams.get("project") || null;
    }
    load(){
        console.log("File 'structure.json' loaded", this.structure);
        console.log("Current path:", this.currentPage);
        this.compositeMenu(this.structure.menu);
        this.rebuild(this.currentPage);
        this.projects = this.structure.projects;
        
        let bindedCloseProject = this.closeProject.bind(this),
            bindedCloseMenu = this.closeMenu.bind(this);

        document.querySelector(".pop-up").addEventListener("click",bindedCloseProject, );
        document.querySelector(".pop-up-container").addEventListener("click",bindedCloseProject);
        document.querySelector(".pop-up > .close-icon").addEventListener("click",bindedCloseProject);
        document.querySelector(".pop-up").addEventListener("click",bindedCloseMenu);
        document.querySelector(".pop-up-container").addEventListener("click",bindedCloseMenu);
        document.querySelector(".pop-up > .close-icon").addEventListener("click",bindedCloseMenu);
        document.querySelector(".pop-up-body").addEventListener("click", (e)=>e.stopPropagation());
    }
    rebuild(page){
        this.setPath(page);
        this.currentPage = this.getPath(window.location.search);

        this.build();
    }
}
