import PageBuilder from "./src/script/script.js"

try {
    new PageBuilder();
} catch (e) {
    alert(JSON.stringify(e.type));
}
window.addEventListener("error", (e) => alert(JSON.stringify(e.message)));